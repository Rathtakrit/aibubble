// Small made-up bubbles, passed in as arguments, so these tests do not depend on the data files.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import { dayView, fitView, peakDay, ringRatio, sceneTransform } from "./camera.ts";
import { bubblesForDate, enclosingCircle, FRAME, totalForDate } from "./layout.ts";
import type { Bubble } from "./layout.ts";
import { burst, useDataset } from "./data.ts";
import { FIRST_DAY } from "./timeline.ts";

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

test("the burst day and later fit all bubbles; earlier days and AI keep the old view", () => {
  const shown = [bubble("a", 40, 45, 4), bubble("b", 60, 55, 5)];
  for (const burst of ["2000-03-10", "2008-09-15"]) {
    const before = `${Number(burst.slice(0, 4)) - 1}-12-31`;
    assert.deepEqual(dayView(shown, ["a"], 1, before, burst), fitView(shown, ["a"], 1));
    for (const date of [burst, `${Number(burst.slice(0, 4)) + 1}-06-30`]) {
      const view = dayView(shown, [], 1, date, burst);
      assert.deepEqual(dayView(shown, ["a"], 1, date, burst), view);
      assert.equal(dayView(shown, [], 1.5, date, burst).z, view.z * 1.5);
      assert.equal(dayView(shown, [], 0.4, date, burst).z, Math.max(1, view.z * 0.4));
    }
  }
  assert.deepEqual(dayView(shown, [], 1, "2026-11-17"), fitView(shown, [], 1));
  assert.deepEqual(dayView([], [], 1, "2002-10-09", "2000-03-10"), fitView([], [], 1));
});

test("shrinking bubbles cannot increase the post-burst zoom, even with no bubbles left", () => {
  const peak = [bubble("a", 50, 50, 20)];
  const small = [bubble("a", 50, 50, 10)];
  const peakView = dayView(peak, [], 1, "2000-03-10", "2000-03-10", peak);
  assert.equal(dayView(small, ["a"], 1, "2001-01-01", "2000-03-10", peak).z, peakView.z);
  assert.equal(dayView([], [], 1, "2002-01-01", "2000-03-10", peak).z, peakView.z);
  assert.deepEqual(dayView(small, ["a"], 1, "2000-03-09", "2000-03-10", peak), fitView(small, ["a"], 1));
});

test("past clusters keep their peak scale at desktop and phone sizes", () => {
  try {
    for (const [id, date] of [["dotcom", "2002-10-09"], ["housing", "2009-06-30"]] as const) {
      useDataset(id);
      const shown = bubblesForDate(date);
      const peak = peakDay(FIRST_DAY, burst!.date, totalForDate);
      const peakBubbles = bubblesForDate(peak.date);
      const view = dayView(shown, [], 1, date, burst?.date, peakBubbles);
      const peakView = dayView(peakBubbles, [], 1, burst!.date, burst?.date, peakBubbles);
      assert.equal(view.z, peakView.z);
      assert.ok(Math.abs(enclosingCircle(peakBubbles).r * view.z - FRAME.fitRadius) < 1e-6);
      const circle = enclosingCircle(shown);
      assert.equal(view.cx, circle.x);
      assert.equal(view.cy, circle.y);
      const centre = moved(sceneTransform(view), circle.x, circle.y);
      // sceneTransform rounds to three decimals in scene units.
      assert.ok(Math.abs(centre.x - FRAME.cx) < 0.1);
      assert.ok(Math.abs(centre.y - FRAME.cy) < 0.1);
      for (const framePixels of [316, 350]) {
        const clusterPixels = 2 * circle.r * view.z / (2 * FRAME.radius) * framePixels;
        assert.ok(clusterPixels < framePixels * 0.9, `${id}: cluster did not shrink in ${framePixels}px frame`);
      }
      for (const b of shown) {
        const reach = (Math.hypot(b.x - view.cx, b.y - view.cy) + b.r) * view.z;
        assert.ok(reach <= FRAME.fitRadius + 1e-6, `${id}: ${b.id} is clipped`);
      }
    }
  } finally {
    useDataset("ai");
  }
});

test("peak day scans daily totals through the burst, keeping the earliest tie", () => {
  const totals: Record<string, number> = {
    "2000-03-08": 10, "2000-03-09": 20, "2000-03-10": 20, "2000-03-11": 100,
  };
  assert.deepEqual(peakDay("2000-03-08", "2000-03-10", (date) => totals[date]),
    { date: "2000-03-09", total: 20 });
  assert.deepEqual(peakDay("2000-03-08", "2000-03-10", (date) => date === "2000-03-10" ? 30 : 10),
    { date: "2000-03-10", total: 30 });
});

test("real ring radius follows the square root of the value ratio", () => {
  assert.equal(ringRatio(100, 100), 1);
  assert.ok(Math.abs(ringRatio(50, 100) - 0.7071067811865476) < 1e-12);
  assert.equal(ringRatio(0, 100), 0);
  assert.equal(ringRatio(0, 0), 0);
});

test("the scene transform puts the camera point at the centre", () => {
  const view = fitView([bubble("a", 30, 40, 2)], ["a"], 1);
  const point = moved(sceneTransform(view), view.cx, view.cy);
  assert.ok(Math.abs(point.x - 50) < 0.01, `x is ${point.x}, not 50`);
  assert.ok(Math.abs(point.y - 50) < 0.01, `y is ${point.y}, not 50`);
});
