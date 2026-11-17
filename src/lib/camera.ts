// The camera inside the round frame: it flies to the players of the current item and zooms to fit
// them. Pure maths, no DOM. The bubble lives in a 100 x 100 square with its centre at (50, 50).

import { enclosingCircle, FRAME } from "./layout.ts";
import type { Bubble } from "./layout.ts";

export type CameraView = {
  cx: number;
  cy: number;
  z: number;
};

// The players are framed with room around them: 56 of the 100 units fit inside the view.
const FIT_SPAN = 56;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const MAX_AUTO_ZOOM = 3.2;

// Manual zoom on top of the automatic camera; index 1 = follow the players exactly.
export const ZOOMS = [0.4, 1, 1.5, 2.25];

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function fixed(value: number): string {
  return value.toFixed(3);
}

// Where the camera looks and how far it zooms. `manual` is the reader's own zoom on top of the
// automatic fit. Players that are not on screen that day are ignored; with no players at all the
// whole frame shows.
export function fitView(bubbles: Bubble[], playerIds: string[], manual: number): CameraView {
  const wanted = new Set(playerIds);
  const players = bubbles.filter((bubble) => wanted.has(bubble.id));

  let bx = 50;
  let by = 50;
  let autoZ = 1;
  if (players.length > 0) {
    let x0 = 100;
    let y0 = 100;
    let x1 = 0;
    let y1 = 0;
    for (const bubble of players) {
      x0 = Math.min(x0, bubble.x - bubble.r);
      y0 = Math.min(y0, bubble.y - bubble.r);
      x1 = Math.max(x1, bubble.x + bubble.r);
      y1 = Math.max(y1, bubble.y + bubble.r);
    }
    const span = Math.max(x1 - x0, y1 - y0, 1);
    autoZ = clamp(MIN_ZOOM, FIT_SPAN / span, MAX_AUTO_ZOOM);
    bx = (x0 + x1) / 2;
    by = (y0 + y1) / 2;
  }

  const z = clamp(MIN_ZOOM, autoZ * manual, MAX_ZOOM);
  // The camera only moves towards the players once it has zoomed in.
  const pull = Math.min(1, (z - MIN_ZOOM) / 0.5);
  return { cx: 50 + (bx - 50) * pull, cy: 50 + (by - 50) * pull, z };
}

// After a burst, fit the cluster's enclosing circle to the layout's padded round frame.
// The player camera's 56-unit square target would leave the cluster barely half as wide.
export function dayView(
  bubbles: Bubble[],
  playerIds: string[],
  manual: number,
  date: string,
  burstDate?: string,
): CameraView {
  if (burstDate === undefined || date < burstDate || bubbles.length === 0) {
    return fitView(bubbles, playerIds, manual);
  }
  const circle = enclosingCircle(bubbles);
  const autoZ = Math.max(MIN_ZOOM, FRAME.fitRadius / circle.r);
  // Keep zoom buttons relative to the fitted cluster, even if it needs more than the player cap.
  const z = clamp(MIN_ZOOM, autoZ * manual, Math.max(MAX_ZOOM, autoZ * ZOOMS[ZOOMS.length - 1]));
  return { cx: circle.x, cy: circle.y, z };
}

// The transform for the scene group: the point (cx, cy) lands at the centre (50, 50), scaled by z.
export function sceneTransform(view: CameraView): string {
  const tx = 50 - view.cx * view.z;
  const ty = 50 - view.cy * view.z;
  return `translate(${fixed(tx)}px, ${fixed(ty)}px) scale(${fixed(view.z)})`;
}
