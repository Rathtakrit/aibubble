// The phone's bottom sheet: the two states it rests in, and the maths that decides where a
// dragged sheet settles. Pure, no DOM. Heights are in pixels and the speed is pixels per
// millisecond, positive while the sheet grows (the finger is moving up).

export type SheetState = "open" | "docked";

// A press that moves less than this is a tap, not a drag.
export const SHEET_TAP_PX = 6;

// A flick faster than this decides the state by its direction, however far the sheet has moved.
export const SHEET_FLICK = 0.5;

export function snapSheet(height: number, docked: number, open: number, velocity: number): SheetState {
  if (Math.abs(velocity) > SHEET_FLICK) return velocity > 0 ? "open" : "docked";
  return height >= (docked + open) / 2 ? "open" : "docked";
}
