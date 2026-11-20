// Small made-up bubbles, passed in as arguments, so these tests do not depend on the data files.
// @ts-expect-error node:test has no types in this repo
import test from "node:test";
// @ts-expect-error node:assert has no types in this repo
import assert from "node:assert";
import { showZoomEdge } from "./bubble.ts";
import { clampPan, dayView, fitView, panView, peakDay, ringRatio, sceneTransform, zoomBy } from "./camera.ts";
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

test("the manual factor multiplies the zoom within the 1..6 clamp", () => {
  const one = [bubble("a", 30, 40, 2)];
  assert.equal(fitView(one, ["a"], 1).z, 3.2);
  assert.equal(fitView(one, ["a"], 2).z, 6);
  assert.equal(fitView(one, ["a"], 0.5).z, 1.6);

  const none = [bubble("a", 30, 40, 2)];
  assert.equal(fitView(none, [], 2).z, 2);
  assert.equal(fitView(none, [], 4).z, 4);
  assert.equal(fitView(none, [], 10).z, 6);
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

test("the fixed frame edge only shows after a burst above whole-view zoom", () => {
  for (const zoom of [1.001, 2, 4]) {
    assert.equal(showZoomEdge(true, zoom), true);
    assert.equal(showZoomEdge(false, zoom), false);
  }
  assert.equal(showZoomEdge(true, 1), false);
  assert.equal(showZoomEdge(true, 0.5), false);
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

// What a zoom keeps put: the scene point the reader points at, checked through the transform.
function pointUnder(transform: string, frameX: number, frameY: number): { x: number; y: number } {
  const numbers = (transform.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const [tx, ty, z] = numbers;
  return { x: (frameX - tx) / z, y: (frameY - ty) / z };
}

test("zoomBy multiplies the zoom and keeps the pointer's scene point still", () => {
  const view = fitView([bubble("a", 30, 40, 2)], ["a"], 1); // z 3.2 on (30, 40)
  for (const factor of [1.5, 1 / 1.5]) {
    const zoomed = zoomBy(view, factor, { x: 60, y: 30 });
    assert.ok(Math.abs(zoomed.z - view.z * factor) < 1e-9, `z is ${zoomed.z}`);
    // The scene point that sat under the pointer sits there again after the zoom.
    // The transform rounds to three decimals, so the point stays still within a pixel.
    const before = pointUnder(sceneTransform(view), 60, 30);
    const after = pointUnder(sceneTransform(zoomed), 60, 30);
    assert.ok(Math.abs(after.x - before.x) < 0.01 && Math.abs(after.y - before.y) < 0.01, "the point under the pointer moved");
  }
});

test("zoomBy clamps the zoom between the floor and 6, and zooms at the centre by default", () => {
  const view = { cx: 50, cy: 50, z: 3 };
  assert.equal(zoomBy(view, 4).z, 6, "the zoom caps at 6");
  assert.equal(zoomBy(view, 100).z, 6);
  assert.deepEqual(zoomBy(view, 100), { cx: 50, cy: 50, z: 6 }, "a centre zoom does not move the centre");
  assert.equal(zoomBy(view, 1 / 8).z, 1, "the zoom floors at 1");
  assert.equal(zoomBy({ cx: 40, cy: 40, z: 2 }, 1 / 4, { x: 50, y: 50 }, { x: 50, y: 50 }, 2).z, 2);
});

test("zoomBy moves the camera so a pinch that drifts its midpoint keeps the point under it", () => {
  const view = { cx: 40, cy: 40, z: 2 };
  const zoomed = zoomBy(view, 2, { x: 60, y: 30 }, { x: 70, y: 40 });
  const before = pointUnder(sceneTransform(view), 60, 30);
  const after = pointUnder(sceneTransform(zoomed), 70, 40);
  assert.ok(Math.abs(after.x - before.x) < 1e-9 && Math.abs(after.y - before.y) < 1e-9, "the pinch point moved");
});

test("the pan moves where the camera looks, in the bubble's own units", () => {
  const view = { cx: 30, cy: 40, z: 2 };
  assert.deepEqual(panView(view, { dx: 10, dy: -5 }), { cx: 40, cy: 35, z: 2 });
  assert.deepEqual(panView(view, { dx: 0, dy: 0 }), view);
});

test("clampPan leaves a pan inside the limit untouched", () => {
  // At z 2 the view is 50 wide, so its centre may sit 50 - 50 / 2 = 25 from the frame's centre.
  const view = { cx: 50, cy: 50, z: 2 };
  assert.deepEqual(clampPan(view, { dx: 0, dy: 0 }), { dx: 0, dy: 0 });
  assert.deepEqual(clampPan(view, { dx: 10, dy: 0 }), { dx: 10, dy: 0 });
  assert.deepEqual(clampPan(view, { dx: 25, dy: 0 }), { dx: 25, dy: 0 });
  assert.deepEqual(clampPan(view, { dx: -17.5, dy: 17.5 }), { dx: -17.5, dy: 17.5 });
});

test("clampPan pulls a pan back so the view stays inside the frame", () => {
  const view = { cx: 50, cy: 50, z: 2 };
  assert.deepEqual(clampPan(view, { dx: 40, dy: 0 }), { dx: 25, dy: 0 });
  assert.deepEqual(clampPan(view, { dx: 0, dy: -60 }), { dx: 0, dy: -25 });
  // A diagonal pan lands on the limit circle, at 25 / sqrt(2) per axis.
  const diagonal = clampPan(view, { dx: -25, dy: 25 });
  assert.ok(Math.abs(diagonal.dx + 25 / Math.SQRT2) < 1e-9, `dx is ${diagonal.dx}`);
  assert.ok(Math.abs(diagonal.dy - 25 / Math.SQRT2) < 1e-9, `dy is ${diagonal.dy}`);
});

test("clampPan measures the limit from the frame's centre, not from the view", () => {
  // The view already sits 10 from the frame's centre, so it may pan 15 more units that way.
  const view = { cx: 60, cy: 50, z: 2 };
  assert.deepEqual(clampPan(view, { dx: 15, dy: 0 }), { dx: 15, dy: 0 });
  assert.deepEqual(clampPan(view, { dx: 20, dy: 0 }), { dx: 15, dy: 0 });
  assert.deepEqual(clampPan(view, { dx: -25, dy: 0 }), { dx: -25, dy: 0 });
});

test("clampPan allows no pan at the whole-frame zoom, and more the further the zoom", () => {
  assert.deepEqual(clampPan({ cx: 50, cy: 50, z: 1 }, { dx: 9, dy: 9 }), { dx: 0, dy: 0 });
  // At z 4 the view is 25 wide, so its centre may sit 50 - 50 / 4 = 37.5 from the frame's centre.
  assert.deepEqual(clampPan({ cx: 50, cy: 50, z: 4 }, { dx: 37.5, dy: 0 }), { dx: 37.5, dy: 0 });
  assert.deepEqual(clampPan({ cx: 50, cy: 50, z: 4 }, { dx: 50, dy: 0 }), { dx: 37.5, dy: 0 });
});

test("clamped views never leave the frame", () => {
  for (const z of [1, 1.5, 2, 3.2, 4]) {
    for (const [dx, dy] of [
      [0, 0], [40, 0], [-40, 0], [0, 40], [40, 40], [-30, 20], [100, -100],
    ] as const) {
      const view = { cx: 50, cy: 50, z };
      const after = panView(view, clampPan(view, { dx, dy }));
      const distance = Math.hypot(after.cx - 50, after.cy - 50);
      assert.ok(
        distance <= 50 - 50 / z + 1e-9,
        `z ${z}, pan ${dx}, ${dy}: the centre sits ${distance.toFixed(3)} from the frame's centre`,
      );
    }
  }
});
