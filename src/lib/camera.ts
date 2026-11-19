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
const MAX_ZOOM = 6;
const MAX_AUTO_ZOOM = 3.2;

type Point = { x: number; y: number };
const CENTRE: Point = { x: 50, y: 50 };

export function zoomBy(view: CameraView, factor: number, from: Point = CENTRE, to = from, minZoom = MIN_ZOOM): CameraView {
  const z = clamp(minZoom, view.z * factor, MAX_ZOOM);
  // Keep the same scene point under the pointer, even as a pinch moves its midpoint.
  return {
    cx: view.cx + (from.x - CENTRE.x) / view.z - (to.x - CENTRE.x) / z,
    cy: view.cy + (from.y - CENTRE.y) / view.z - (to.y - CENTRE.y) / z,
    z,
  };
}

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

export type PeakDay = { date: string; total: number };

// Scan calendar days, including the burst day. Ties keep the first peak day.
export function peakDay(first: string, burstDate: string, totalAt: (date: string) => number): PeakDay {
  let peak = { date: first, total: totalAt(first) };
  for (let time = Date.parse(`${first}T00:00:00Z`) + 86_400_000;
    time <= Date.parse(`${burstDate}T00:00:00Z`); time += 86_400_000) {
    const date = new Date(time).toISOString().slice(0, 10);
    const total = totalAt(date);
    if (total > peak.total) peak = { date, total };
  }
  return peak;
}

export function ringRatio(totalToday: number, totalAtPeak: number): number {
  return totalAtPeak > 0 ? Math.sqrt(Math.max(0, totalToday) / totalAtPeak) : 0;
}

// After a burst, keep the peak cluster's scale while following today's cluster centre.
export function dayView(
  bubbles: Bubble[],
  playerIds: string[],
  manual: number,
  date: string,
  burstDate?: string,
  peakBubbles: Bubble[] = bubbles,
): CameraView {
  if (burstDate === undefined || date < burstDate || peakBubbles.length === 0) {
    return fitView(bubbles, playerIds, manual);
  }
  const circle = bubbles.length > 0 ? enclosingCircle(bubbles) : enclosingCircle(peakBubbles);
  const peakCircle = enclosingCircle(peakBubbles);
  const autoZ = Math.max(MIN_ZOOM, FRAME.fitRadius / peakCircle.r);
  // 1x on a burst day is the peak-fit view, not the unscaled layout.
  const z = clamp(MIN_ZOOM, autoZ * manual, MAX_ZOOM);
  return { cx: circle.x, cy: circle.y, z };
}

// The transform for the scene group: the point (cx, cy) lands at the centre (50, 50), scaled by z.
export function sceneTransform(view: CameraView): string {
  const tx = 50 - view.cx * view.z;
  const ty = 50 - view.cy * view.z;
  return `translate(${fixed(tx)}px, ${fixed(ty)}px) scale(${fixed(view.z)})`;
}

// How far the reader has dragged the picture, in the bubble's own units (the 0–100 viewBox).
// It moves where the camera looks, so the content slides inside the round frame.
export type Pan = { dx: number; dy: number };

export function panView(view: CameraView, pan: Pan): CameraView {
  return { cx: view.cx + pan.dx, cy: view.cy + pan.dy, z: view.z };
}

// The view is a square of 100 / z and the round frame is the circle of radius 50 around (50, 50),
// so the view's centre may sit at most 50 - 50 / z away from the frame's centre: the pan that
// puts it further is pulled back onto that circle, so the content never slides out of the frame.
export function clampPan(view: CameraView, pan: Pan): Pan {
  const limit = Math.max(0, 50 - 50 / view.z);
  if (limit <= 0) return { dx: 0, dy: 0 };
  const cx = view.cx + pan.dx;
  const cy = view.cy + pan.dy;
  const ox = cx - 50;
  const oy = cy - 50;
  const distance = Math.hypot(ox, oy);
  if (distance <= limit) return { dx: pan.dx, dy: pan.dy };
  const scale = limit / distance;
  return { dx: 50 + ox * scale - view.cx, dy: 50 + oy * scale - view.cy };
}
