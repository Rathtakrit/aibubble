// Small made-up bubbles, passed in as arguments, so these tests do not depend on the data files.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import { fitView, sceneTransform } from "./camera.ts";
import type { Bubble } from "./layout.ts";

function bubble(id: string, x: number, y: number, r: number): Bubble {
  return { id, name: id, kind: "listed", x, y, r, value: 100 };
}

// The part of the frame the camera shows: 100 / z wide, centred on where it looks.
function visibleSquare(view: { cx: number; cy: number; z: number }) {
  const half = 50 / view.z;
  return {
    left: view.cx - half,
    right: view.cx + half,
    top: view.cy - half,
    bottom: view.cy + half,
  };
}

function inside(square: ReturnType<typeof visibleSquare>, player: Bubble): boolean {
  return (
    player.x - player.r >= square.left &&
    player.x + player.r <= square.right &&
    player.y - player.r >= square.top &&
    player.y + player.r <= square.bottom
  );
}

// What the transform does to a point in the scene.
function moved(transform: string, x: number, y: number): { x: number; y: number } {
  const numbers = (transform.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const [tx, ty, z] = numbers;
  return { x: x * z + tx, y: y * z + ty };
}

test("no players gives the whole frame", () => {
  const view = fitView([bubble("a", 20, 20, 5), bubble("b", 80, 80, 5)], [], 1);
  assert.deepEqual(view, { cx: 50, cy: 50, z: 1 });
});

test("one small player gives the maximum zoom centred on it", () => {
  const view = fitView([bubble("a", 30, 40, 2)], ["a"], 1);
  assert.equal(view.z, 3.2);
  assert.equal(view.cx, 30);
  assert.equal(view.cy, 40);
});

test("two far-apart players are both fully inside the visible square", () => {
  const players = [bubble("a", 30, 30, 5), bubble("b", 70, 70, 5)];
  const view = fitView(players, ["a", "b"], 1);
  const square = visibleSquare(view);
  assert.ok(view.z > 1, "the camera should zoom in");
  assert.ok(inside(square, players[0]), "the first player is cut off");
  assert.ok(inside(square, players[1]), "the second player is cut off");
});

test("players at opposite ends of the frame still both fit", () => {
  const players = [bubble("a", 8, 50, 4), bubble("b", 92, 50, 4)];
  const view = fitView(players, ["a", "b"], 1);
  const square = visibleSquare(view);
  assert.ok(inside(square, players[0]), "the first player is cut off");
  assert.ok(inside(square, players[1]), "the second player is cut off");
});

test("the manual factor multiplies the zoom within the 1..4 clamp", () => {
  const one = [bubble("a", 30, 40, 2)];
  assert.equal(fitView(one, ["a"], 1).z, 3.2);
  assert.equal(fitView(one, ["a"], 2).z, 4);
  assert.equal(fitView(one, ["a"], 0.5).z, 1.6);

  const none = [bubble("a", 30, 40, 2)];
  assert.equal(fitView(none, [], 2).z, 2);
  assert.equal(fitView(none, [], 4).z, 4);
  assert.equal(fitView(none, [], 0.4).z, 1);
});

test("a player not shown is ignored", () => {
  const shown = [bubble("a", 30, 40, 2)];
  const withMissing = fitView(shown, ["a", "not-on-screen"], 1);
  assert.deepEqual(withMissing, fitView(shown, ["a"], 1));
});

test("the scene transform puts the camera point at the centre", () => {
  const view = fitView([bubble("a", 30, 40, 2)], ["a"], 1);
  const point = moved(sceneTransform(view), view.cx, view.cy);
  assert.ok(Math.abs(point.x - 50) < 0.01, `x is ${point.x}, not 50`);
  assert.ok(Math.abs(point.y - 50) < 0.01, `y is ${point.y}, not 50`);
});
