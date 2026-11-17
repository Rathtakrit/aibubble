// Pure bubble layout: a day-by-day force simulation, and what is shown on a day.
// No DOM here; bubble.ts draws the result into an SVG.

import { forceSimulation } from "d3-force";
import type { Force, Simulation, SimulationNodeDatum } from "d3-force";
import { companies, datasetId, deals, isShown, LAST_DAY, valueOn, values } from "./data.ts";
import type { Company, DatasetId, Deal, ValuePoint } from "./data.ts";
import { FIRST_DAY } from "./timeline.ts";

// The bubble lives in a 100 x 100 square. The frame is the circle with this centre and radius.
export const FRAME = { cx: 50, cy: 50, radius: 48, fitRadius: 46 } as const;

export type Bubble = {
  id: string;
  name: string;
  kind: Company["kind"];
  x: number;
  y: number;
  r: number;
  value: number;
};

// A circle placed on a day: centre and radius in frame units.
export type Placed = { x: number; y: number; r: number };

// A quadratic Bezier: start, control point, end.
export type Curve = {
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  x2: number;
  y2: number;
};

export type Arrow = Curve & {
  from: string;
  to: string;
  kind: Deal["kind"];
  count: number;
  amount_usd_bn: number;
  amountKnown: boolean;
  // True for exactly one arrow per pair of companies; the faint look draws only these.
  pairFirst: boolean;
  // The control point sits bend x the distance between centres to this side of the from->to
  // line; bubble.ts needs both to redraw the curve while the bubbles glide.
  bend: number;
  side: 1 | -1;
};

// The placed circles for every day, in frame units, ready to draw.
export type DayLayouts = {
  first: string;
  last: string;
  days: Map<string, Map<string, Placed>>;
  // The room kept between bubble edges on every day, in frame units: the smallest gap every
  // pair has, and the bigger one every pair with a deal has.
  edgeGap: number;
  dealGap: number;
};

// Force settings. The simulation works in raw units (r0 = sqrt of the value in US$ bn)
// around (0, 0); everything is scaled to the frame at the end.
// The breathing room between circle edges is a share of the radius of the biggest circle in the
// set, not a fixed number of raw units: the one scale then turns it into the same visible room
// on every data set, about 2.5% of the frame's diameter on the final day of all three sets.
// DEAL_GAP is the bigger room kept between two companies with a deal (about 5%), so a money line
// between them has length enough to show its arrowhead.
const EDGE_GAP = 0.2;
const DEAL_GAP = 0.4;
const CENTRE_PULL = 0.05;
const LINK_PULL = 0.02;
const DAY_ONE_TICKS = 300;
const DAY_TICKS = 20;
const DAY_ALPHA = 0.1;
// How far a newcomer may turn around the cluster's rim (radians) looking for a free spot.
const RIM_TURN = Math.PI / 12;
const RIM_STEPS = 24;

// The overlap clean-up after a day's force ticks: how many passes it may take, and how much
// overlap (raw units) counts as nothing left to do.
const RELAX_PASSES = 20;
const RELAX_EPSILON = 1e-4;
// How many days either side the enclosing circle's centre is averaged over.
const SMOOTH_DAYS = 30;
// Ticks on a day when a company arrives: the cluster takes the newcomer in on that same day, so
// a big newcomer cannot leave the whole cluster swollen for the days that follow.
const ENTRY_TICKS = 80;
// How many directions are tried when a newcomer fits nowhere on the rim.
const PLACE_STEPS = 72;

// The most a bubble may move from one day to the next, in frame units: about the step the first
// build allowed, kept so positions glide rather than jump.
const MAX_DAY_MOVE = 2.85;

// The bends tried for a pair's first arrow, x the distance between centres, smallest first. A
// straight line is tried before any of them.
const BEND_TRIES = [0.06, 0.1, 0.15, 0.22, 0.32, 0.45, 0.6, 0.8];
// How much wider each further arrow of a pair bends, so the pair's arrows nest side by side.
const BEND_STEP = 0.1;
// How many points are sampled along a candidate line to count what it runs through.
const BEND_SAMPLES = 48;
// The room a money line keeps from a bubble it passes, in frame units.
export const LINE_MARGIN = 0.25;
// A bent line may be at most this many times as long as the straight line between its ends.
export const LONGEST_LINE = 1.6;

// d3-force needs a random source for degenerate cases; a seeded one keeps the layout the
// same on every run. Nothing here uses Math.random or the clock.
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let z = Math.imul(state ^ (state >>> 15), 1 | state);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// A fixed angle per company id, for entrants with no deal partner to start beside.
function hashAngle(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) / 4294967296) * 2 * Math.PI;
}

const DAY_MS = 86_400_000;

// One key per unordered pair of companies, for the pair's gap and its deal.
function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function midnight(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

// Every calendar day from first to last, inclusive.
function eachDay(first: string, last: string): string[] {
  const out: string[] = [];
  for (let time = midnight(first); time <= midnight(last); time += DAY_MS) {
    out.push(new Date(time).toISOString().slice(0, 10));
  }
  return out;
}

// The latest day the data mentions, never before the first day.
function lastDayOf(companies: Company[], values: ValuePoint[], deals: Deal[]): string {
  let last = FIRST_DAY;
  for (const company of companies) if (company.first_mention > last) last = company.first_mention;
  for (const point of values) if (point.date > last) last = point.date;
  for (const deal of deals) if (deal.date > last) last = deal.date;
  return last;
}

type SimNode = SimulationNodeDatum & {
  id: string;
  r0: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  // The companies this one has a deal with on the day being laid out.
  partners: Set<SimNode>;
};
type SimLink = { source: SimNode; target: SimNode };

// The forces, as d3-force force functions. At about 20 nodes a plain pair loop beats
// d3-force's own quadtree forces by a wide margin, which is what keeps four years of
// daily layouts well under half a second. Settings are the fixed ones: collision radius
// r0 + gap at strength 1 for 1 iteration, centre pull 0.05, partner links at 0.02 with
// distance the two radii + gap.

// Circles may not overlap: each pair that sits too close is pushed apart in proportion
// to the overlap, the heavier circle moving less. Like d3-force's collide, this ignores
// alpha so it fully corrects what it finds. The first pass checks every pair and lists the
// pairs that were too close; the extra iterations re-check only those, because on a
// settled day nearly every other pair already has room.
function collideForce(
  gapOf: (a: SimNode, b: SimNode) => number,
  strength: number,
  iterations: number,
): Force<SimNode, SimLink> {
  let nodes: SimNode[] = [];
  let random: () => number = mulberry32(1);
  // Pairs too close in the first pass, as flat (i, j) index pairs.
  let candidates = new Int32Array(0);
  let candidateCount = 0;

  // Pushes one pair apart when it overlaps; true when it did.
  const separate = (a: SimNode, b: SimNode): boolean => {
    const radius = a.r0 + b.r0 + gapOf(a, b);
    const ax = a.x + a.vx;
    const ay = a.y + a.vy;
    let dx = b.x + b.vx - ax;
    let dy = b.y + b.vy - ay;
    let length2 = dx * dx + dy * dy;
    if (length2 >= radius * radius) return false;
    if (dx === 0) {
      dx = (random() - 0.5) * 1e-6;
      length2 += dx * dx;
    }
    if (dy === 0) {
      dy = (random() - 0.5) * 1e-6;
      length2 += dy * dy;
    }
    const length = Math.sqrt(length2);
    const push = ((radius - length) / length) * strength;
    const wa = (b.r0 * b.r0) / (a.r0 * a.r0 + b.r0 * b.r0);
    // dx, dy point from a toward b: a moves away from b, b away from a.
    a.vx -= dx * push * wa;
    a.vy -= dy * push * wa;
    b.vx += dx * push * (1 - wa);
    b.vy += dy * push * (1 - wa);
    return true;
  };

  const force = (): void => {
    const count = nodes.length;
    for (let round = 0; round < iterations; round += 1) {
      if (round > 0) {
        for (let k = 0; k < candidateCount; k += 2) {
          separate(nodes[candidates[k]], nodes[candidates[k + 1]]);
        }
        continue;
      }
      if (candidates.length < count * (count - 1)) {
        candidates = new Int32Array(count * (count - 1));
      }
      candidateCount = 0;
      for (let i = 0; i < count; i += 1) {
        for (let j = i + 1; j < count; j += 1) {
          if (!separate(nodes[i], nodes[j])) continue;
          candidates[candidateCount] = i;
          candidates[candidateCount + 1] = j;
          candidateCount += 2;
        }
      }
    }
  };
  force.initialize = (initialized: SimNode[], source: () => number): void => {
    nodes = initialized;
    random = source;
  };
  return force;
}

// A gentle pull toward the centre of the frame, so the cluster sits around the middle.
function centrePull(strength: number): Force<SimNode, SimLink> {
  let nodes: SimNode[] = [];
  const force = (alpha: number): void => {
    for (const node of nodes) {
      node.vx -= node.x * strength * alpha;
      node.vy -= node.y * strength * alpha;
    }
  };
  force.initialize = (initialized: SimNode[]): void => {
    nodes = initialized;
  };
  return force;
}

// Partners sit near each other, so the money lines stay short: a weak pull toward
// "the two radii + gap" between companies that have a deal.
function linkForce(links: SimLink[], gap: number, strength: number): Force<SimNode, SimLink> {
  let random: () => number = mulberry32(2);
  const force = (alpha: number): void => {
    for (const link of links) {
      const { source, target } = link;
      let dx = target.x + target.vx - source.x - source.vx;
      let dy = target.y + target.vy - source.y - source.vy;
      if (dx === 0 && dy === 0) {
        dx = (random() - 0.5) * 1e-6;
        dy = (random() - 0.5) * 1e-6;
      }
      const length = Math.sqrt(dx * dx + dy * dy);
      const wanted = source.r0 + target.r0 + gap;
      const pull = ((length - wanted) / length) * strength * alpha;
      // The bias follows d3-force's link: the end with fewer links moves more.
      const bias = 0.5;
      target.vx -= dx * pull * bias;
      target.vy -= dy * pull * bias;
      source.vx += dx * pull * (1 - bias);
      source.vy += dy * pull * (1 - bias);
    }
  };
  force.initialize = (_initialized: SimNode[], source: () => number): void => {
    random = source;
  };
  return force;
}

// Forces alone leave a small circle wedged a little way inside two big ones, so once a day's
// ticks have run every overlapping pair is pushed apart along the line between their centres:
// each circle moves half of the overlap plus half the breathing gap, which leaves exactly the
// gap between the two edges. Passes repeat until no pair overlaps or RELAX_PASSES have run.
// The tour of pairs is in array order and a pair with coincident centres is separated along an
// angle hashed from the two ids, so the same input always gives the same places; the pushed
// positions carry into the next day, so nothing jumps.
function relaxOverlaps(nodes: SimNode[], gapOf: (a: SimNode, b: SimNode) => number): void {
  for (let pass = 0; pass < RELAX_PASSES; pass += 1) {
    let pushed = false;
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const gap = gapOf(a, b);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlap = a.r0 + b.r0 - distance;
        if (overlap <= -gap + RELAX_EPSILON) continue;
        let ux: number;
        let uy: number;
        if (distance < 1e-9) {
          const angle = hashAngle(a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`);
          ux = Math.cos(angle);
          uy = Math.sin(angle);
        } else {
          ux = dx / distance;
          uy = dy / distance;
        }
        const push = (overlap + gap) / 2;
        a.x -= ux * push;
        a.y -= uy * push;
        b.x += ux * push;
        b.y += uy * push;
        pushed = true;
      }
    }
    if (!pushed) return;
  }
}

// The gap a newcomer keeps from everyone else, in raw units, when it looks for a spot: the deal
// gap from a partner, the edge gap from every other company.
function clearAt(
  x: number,
  y: number,
  r0: number,
  id: string,
  nodes: SimNode[],
  gapOf: (a: string, b: string) => number,
): boolean {
  for (const node of nodes) {
    const dx = node.x - x;
    const dy = node.y - y;
    const reach = node.r0 + r0 + gapOf(id, node.id);
    if (dx * dx + dy * dy < reach * reach) return false;
  }
  return true;
}

// The middle of the cluster and the tightest circle around it, in raw units: the middle is
// where a newcomer measures its place from, and the radius is how far the cluster reaches.
function clusterMiddle(nodes: SimNode[]): Circle {
  return enclosingCircle(nodes.map((node) => ({ x: node.x, y: node.y, r: node.r0 })));
}

// A free place on the cluster's rim, near the angle asked for: the newcomer sits against the
// outside of the cluster, so it never pushes a company aside. Null when the rim is full.
function rimSpot(
  start: number,
  r0: number,
  id: string,
  nodes: SimNode[],
  middle: Circle,
  gapOf: (a: string, b: string) => number,
): { x: number; y: number } | null {
  const distance = Math.max(0, middle.r - r0);
  // Every free place on the rim is tried, and the one that leaves the tightest circle round the
  // cluster wins: a newcomer placed on the far side of the cluster would otherwise pull the
  // whole circle, and with it the frame, a long way on its first day.
  let best: { x: number; y: number } | null = null;
  let bestReach = Infinity;
  for (let step = 0; step <= RIM_STEPS; step += 1) {
    const turn = step === 0 ? 0 : (step % 2 === 1 ? -1 : 1) * Math.ceil(step / 2);
    const angle = start + turn * RIM_TURN;
    const x = middle.x + Math.cos(angle) * distance;
    const y = middle.y + Math.sin(angle) * distance;
    if (!clearAt(x, y, r0, id, nodes, gapOf)) continue;
    const reach = enclosingCircle([
      ...nodes.map((node) => ({ x: node.x, y: node.y, r: node.r0 })),
      { x, y, r: r0 },
    ]).r;
    if (reach < bestReach) {
      bestReach = reach;
      best = { x, y };
    }
  }
  return best;
}

// How far out along a ray from the cluster's middle a circle of radius r0 has to sit to be
// clear of every circle the ray crosses: the first place past the outermost of them. This is
// the tightest the cluster can take a newcomer that does not fit on the rim.
function clearAlong(
  angle: number,
  r0: number,
  id: string,
  nodes: SimNode[],
  middle: Circle,
  gapOf: (a: string, b: string) => number,
): number {
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  let need = 0;
  for (const node of nodes) {
    const cx = node.x - middle.x;
    const cy = node.y - middle.y;
    const reach = node.r0 + r0 + gapOf(id, node.id);
    const along = cx * ux + cy * uy;
    const perp2 = cx * cx + cy * cy - along * along;
    if (perp2 >= reach * reach) continue;
    const exit = along + Math.sqrt(reach * reach - perp2);
    if (exit > need) need = exit;
  }
  return need;
}

// Where an entering company starts: beside the company it first has a deal with (the
// earliest deal whose other side is already shown), on that partner's side facing away from
// the middle of the cluster; with no such partner, at the cluster's rim at an angle from its
// id. A packed cluster has no room right beside a partner, so the newcomer takes a place on
// the rim on that side instead, and drifts in over the days that follow. When the rim has no
// free place either, it starts just outside the rim in the direction that leaves the cluster's
// own circle smallest.
function entrySpot(
  companyId: string,
  r0: number,
  date: string,
  nodes: SimNode[],
  byId: Map<string, SimNode>,
  deals: Deal[],
  gapOf: (a: string, b: string) => number,
): { x: number; y: number } {
  const middle = clusterMiddle(nodes);
  let earliest: Deal | null = null;
  let partner: SimNode | null = null;
  for (const deal of deals) {
    if (deal.date > date) continue;
    const otherId = deal.from === companyId ? deal.to : deal.to === companyId ? deal.from : null;
    if (otherId === null) continue;
    const other = byId.get(otherId);
    if (!other) continue;
    if (
      earliest === null ||
      deal.date < earliest.date ||
      (deal.date === earliest.date && deal.id < earliest.id)
    ) {
      earliest = deal;
      partner = other;
    }
  }

  // The angle the company would like to sit at, seen from the middle of the cluster.
  let angle = hashAngle(companyId);
  if (partner !== null) {
    const fromCentre = Math.hypot(partner.x - middle.x, partner.y - middle.y);
    const away =
      fromCentre > 1e-9
        ? Math.atan2(partner.y - middle.y, partner.x - middle.x)
        : hashAngle(partner.id);
    const distance = partner.r0 + r0 + gapOf(companyId, partner.id);
    const x = partner.x + Math.cos(away) * distance;
    const y = partner.y + Math.sin(away) * distance;
    if (clearAt(x, y, r0, companyId, nodes, gapOf)) return { x, y };
    angle = Math.atan2(y - middle.y, x - middle.x);
  }

  const rim = rimSpot(angle, r0, companyId, nodes, middle, gapOf);
  if (rim !== null) return rim;
  // The rim is full too: sit just outside it where the cluster can take the newcomer most
  // easily, which is the place that leaves the cluster's own circle smallest.
  let bestX = middle.x + Math.cos(angle) * middle.r;
  let bestY = middle.y + Math.sin(angle) * middle.r;
  let bestReach = Infinity;
  for (let step = 0; step < PLACE_STEPS; step += 1) {
    const turn = (step / PLACE_STEPS) * 2 * Math.PI;
    const out = Math.max(middle.r, clearAlong(turn, r0, companyId, nodes, middle, gapOf));
    const x = middle.x + Math.cos(turn) * out;
    const y = middle.y + Math.sin(turn) * out;
    const reach = enclosingCircle([
      ...nodes.map((node) => ({ x: node.x, y: node.y, r: node.r0 })),
      { x, y, r: r0 },
    ]).r;
    if (reach < bestReach) {
      bestReach = reach;
      bestX = x;
      bestY = y;
    }
  }
  return { x: bestX, y: bestY };
}

// Where a company starts on the first day: a spiral around the centre, the same spread
// d3-force uses to start a simulation, so the forces have somewhere to push from.
const PHYLLOTAXIS = Math.PI * (3 - Math.sqrt(5));

function spiralSpot(index: number): { x: number; y: number } {
  const radius = 10 * Math.sqrt(0.5 + index);
  const angle = index * PHYLLOTAXIS;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

// valueOn from data.ts, precomputed for every day: flat before the first point and after
// the last, a straight line between neighbouring points. Null when there are no points.
// Days are counted as whole days, not calendar strings, so the loop does no date parsing.
function interpolate(own: ValuePoint[], dayNumbers: number[]): (number | null)[] {
  const out = new Array<number | null>(dayNumbers.length);
  if (own.length === 0) return out.fill(null);
  const points = own
    .map((point) => ({ day: Math.round(midnight(point.date) / DAY_MS), value: point.value_usd_bn }))
    .sort((a, b) => a.day - b.day);
  const lastPoint = points[points.length - 1];
  let segment = 0;
  for (let index = 0; index < dayNumbers.length; index += 1) {
    const day = dayNumbers[index];
    if (day <= points[0].day) {
      out[index] = points[0].value;
      continue;
    }
    if (day >= lastPoint.day) {
      out[index] = lastPoint.value;
      continue;
    }
    while (points[segment + 1].day < day) segment += 1;
    const before = points[segment];
    const after = points[segment + 1];
    const span = after.day - before.day;
    if (span === 0) {
      out[index] = after.value;
      continue;
    }
    const walked = day - before.day;
    out[index] = before.value + ((after.value - before.value) * walked) / span;
  }
  return out;
}

// A circle placed on a day, as the enclosing-circle helper builds it.
type Circle = { x: number; y: number; r: number };

// True when a circle holds another one: the far edge of the other is no further out.
function holds(circle: Circle, other: Placed): boolean {
  const dx = other.x - circle.x;
  const dy = other.y - circle.y;
  return Math.sqrt(dx * dx + dy * dy) + other.r <= circle.r + 1e-9;
}

// The smallest circle holding two circles: the middle sits on the line between their centres,
// and the radius is half the distance between the centres plus both radii. A circle that
// already holds the other one is the answer for that pair.
function twoCircle(a: Placed, b: Placed): Circle {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance + b.r <= a.r) return { x: a.x, y: a.y, r: a.r };
  if (distance + a.r <= b.r) return { x: b.x, y: b.y, r: b.r };
  const r = (distance + a.r + b.r) / 2;
  // Neither circle holds the other, so the distance is above zero here.
  const ux = dx / distance;
  const uy = dy / distance;
  const step = r - a.r;
  return { x: a.x + ux * step, y: a.y + uy * step, r };
}

// The smallest of these pairs that holds all of the listed circles; the largest pair when none
// does, which only happens when rounding leaves a gap.
function bestPair(pairs: Circle[], items: Placed[]): Circle {
  let best: Circle | null = null;
  let largest = pairs[0];
  for (const pair of pairs) {
    if (pair.r > largest.r) largest = pair;
    if (!items.every((item) => holds(pair, item))) continue;
    if (best === null || pair.r < best.r) best = pair;
  }
  return best ?? largest;
}

// The smallest circle holding three circles: the one touching all three from the outside. The
// three "distance + own radius = R" equations give two difference equations that are linear in
// the middle and in R, so the middle is "start + R * slope" and one quadratic gives R. The
// quadratic can have two answers and only the smaller one that holds all three is the tightest;
// the other sits far outside them. When the three centres line up, or the answer is really a
// two-circle one, the best of the pairs wins.
function threeCircle(a: Placed, b: Placed, c: Placed): Circle {
  const pairs = [twoCircle(a, b), twoCircle(a, c), twoCircle(b, c)];
  const ux = a.x - b.x;
  const uy = a.y - b.y;
  const vx = a.x - c.x;
  const vy = a.y - c.y;
  const det = ux * vy - uy * vx;
  if (Math.abs(det) < 1e-12) return bestPair(pairs, [a, b, c]);

  const f10 = a.x * a.x + a.y * a.y - (b.x * b.x + b.y * b.y) - a.r * a.r + b.r * b.r;
  const f11 = 2 * (a.r - b.r);
  const f20 = a.x * a.x + a.y * a.y - (c.x * c.x + c.y * c.y) - a.r * a.r + c.r * c.r;
  const f21 = 2 * (a.r - c.r);
  const startX = (f10 * vy - f20 * uy) / (2 * det);
  const startY = (f20 * ux - f10 * vx) / (2 * det);
  const slopeX = (f11 * vy - f21 * uy) / (2 * det);
  const slopeY = (f21 * ux - f11 * vx) / (2 * det);

  // |middle - a| = R - a.r, squared: a quadratic in R.
  const qx = startX - a.x;
  const qy = startY - a.y;
  const qa = slopeX * slopeX + slopeY * slopeY - 1;
  const qb = 2 * (qx * slopeX + qy * slopeY + a.r);
  const qc = qx * qx + qy * qy - a.r * a.r;
  let roots: number[];
  if (Math.abs(qa) < 1e-12) {
    if (Math.abs(qb) < 1e-12) return bestPair(pairs, [a, b, c]);
    roots = [-qc / qb];
  } else {
    const disc = qb * qb - 4 * qa * qc;
    if (disc < 0) return bestPair(pairs, [a, b, c]);
    const root = Math.sqrt(disc);
    roots = [(-qb + root) / (2 * qa), (-qb - root) / (2 * qa)];
  }
  let best: Circle | null = null;
  for (const r of roots) {
    if (r < 0) continue;
    const circle = { x: startX + slopeX * r, y: startY + slopeY * r, r };
    if (!holds(circle, a) || !holds(circle, b) || !holds(circle, c)) continue;
    if (best === null || circle.r < best.r) best = circle;
  }
  return best ?? bestPair(pairs, [a, b, c]);
}

// The smallest circle holding every one of a day's circles: the middle and the radius of the
// tightest circle around the cluster. This builds it up one circle at a time, recomputing the
// tightest circle that keeps the newest circles on its edge; with about 20 circles a day that
// is a few dozen short sums.
export function enclosingCircle(items: Placed[]): Circle {
  if (items.length === 0) return { x: 0, y: 0, r: 0 };
  let circle: Circle = { x: items[0].x, y: items[0].y, r: items[0].r };
  for (let i = 1; i < items.length; i += 1) {
    const a = items[i];
    if (holds(circle, a)) continue;
    circle = { x: a.x, y: a.y, r: a.r };
    for (let j = 0; j < i; j += 1) {
      const b = items[j];
      if (holds(circle, b)) continue;
      circle = twoCircle(a, b);
      for (let k = 0; k < j; k += 1) {
        const c = items[k];
        if (holds(circle, c)) continue;
        circle = threeCircle(a, b, c);
      }
    }
  }
  return circle;
}

// One scale for every day and the middle each day's cluster is drawn around: the middle of the
// tightest circle around that day's bubbles, averaged over the 30 days either side so one busy
// day cannot shift the whole cluster; and the one scale that makes the furthest day touch the
// fit circle.
function frameFit(
  days: Map<string, Map<string, Placed>>,
  dates: string[],
): { centres: { x: number; y: number }[]; scale: number } {
  const centres = dates.map((date) => enclosingCircle([...days.get(date)!.values()]));
  const smoothed = centres.map((_, index) => {
    const from = Math.max(0, index - SMOOTH_DAYS);
    const to = Math.min(centres.length - 1, index + SMOOTH_DAYS);
    let x = 0;
    let y = 0;
    for (let at = from; at <= to; at += 1) {
      x += centres[at].x;
      y += centres[at].y;
    }
    const count = to - from + 1;
    return { x: x / count, y: y / count };
  });
  let reach = 0;
  for (const [index, date] of dates.entries()) {
    const centre = smoothed[index];
    for (const placed of days.get(date)!.values()) {
      const dx = placed.x - centre.x;
      const dy = placed.y - centre.y;
      const distance = Math.sqrt(dx * dx + dy * dy) + placed.r;
      if (distance > reach) reach = distance;
    }
  }
  return { centres: smoothed, scale: FRAME.fitRadius / (reach || 1) };
}

// No bubble moves further than `limit` (raw units) in one day: each day's place is pulled back
// toward the day before until it is near enough. Without this a small bubble squeezed between
// two big ones can be thrown a long way by the bigger gaps, and a bubble that jumps makes the
// money lines jump with it.
function glide(
  days: Map<string, Map<string, Placed>>,
  dates: string[],
  limit: number,
): void {
  for (let index = 1; index < dates.length; index += 1) {
    const before = days.get(dates[index - 1])!;
    const today = days.get(dates[index])!;
    for (const [id, placed] of today) {
      const was = before.get(id);
      if (!was) continue;
      const dx = placed.x - was.x;
      const dy = placed.y - was.y;
      const moved = Math.sqrt(dx * dx + dy * dy);
      if (moved <= limit) continue;
      placed.x = was.x + (dx * limit) / moved;
      placed.y = was.y + (dy * limit) / moved;
    }
  }
}
// The layout for every day from FIRST_DAY to lastDay: day one settles from scratch, then
// each day starts from the day before so positions change a little and never jump.
export function dayLayouts(
  companies: Company[],
  values: ValuePoint[],
  deals: Deal[],
  lastDay: string = lastDayOf(companies, values, deals),
): DayLayouts {
  const first = FIRST_DAY;
  const last = lastDay < first ? first : lastDay;
  const random = mulberry32(0xa1b0b1e);
  const dates = eachDay(first, last);
  const dayNumbers = dates.map((date) => Math.round(midnight(date) / DAY_MS));

  // Each company's value for every day, looked up by day number in the loop below.
  const ownPoints = new Map<string, ValuePoint[]>();
  for (const point of values) {
    const own = ownPoints.get(point.company);
    if (own) own.push(point);
    else ownPoints.set(point.company, [point]);
  }
  const daily = new Map<string, (number | null)[]>();
  for (const company of companies) {
    const own = ownPoints.get(company.id) ?? [];
    daily.set(company.id, interpolate(own, dayNumbers));
  }

  // The room between bubble edges, in raw units: a share of the biggest circle, so that after
  // the one scale it is about 2% of the frame's diameter for every pair, and about twice that
  // for a pair with a deal.
  let biggest = 0;
  for (const point of values) if (point.value_usd_bn > biggest) biggest = point.value_usd_bn;
  const edgeGap = EDGE_GAP * Math.sqrt(biggest || 1);
  const dealGap = DEAL_GAP * Math.sqrt(biggest || 1);
  // The pairs that have a deal on the day being laid out. By id, for a newcomer looking for its
  // spot; by node, for the forces, which run over every pair on every tick and so must not build
  // a string key per check.
  const dealPairsToday = new Set<string>();
  const gapById = (a: string, b: string): number =>
    dealPairsToday.has(pairKey(a, b)) ? dealGap : edgeGap;
  const gapOf = (a: SimNode, b: SimNode): number =>
    a.partners.has(b) ? dealGap : edgeGap;

  // The earliest day each pair of companies has a deal, for the weak links between partners.
  const pairDeals: { a: string; b: string; date: string }[] = [];
  const seenPair = new Map<string, number>();
  for (const deal of deals) {
    const key = pairKey(deal.from, deal.to);
    const at = seenPair.get(key);
    if (at === undefined) {
      seenPair.set(key, pairDeals.length);
      pairDeals.push({ a: deal.from < deal.to ? deal.from : deal.to, b: deal.from < deal.to ? deal.to : deal.from, date: deal.date });
    } else if (deal.date < pairDeals[at].date) {
      pairDeals[at].date = deal.date;
    }
  }

  // One simulation and one set of forces, reused every day: the node and link arrays are
  // mutated in place, so the layout runs in well under half a second for 4 years.
  const nodes: SimNode[] = [];
  const byId = new Map<string, SimNode>();
  const links: SimLink[] = [];
  const days = new Map<string, Map<string, Placed>>();
  let simulation: Simulation<SimNode, undefined> | null = null;

  for (const [dayNumber, date] of dates.entries()) {
    const today = new Map<string, number>();
    for (const company of companies) {
      if (!isShown(company, date)) continue;
      const value = daily.get(company.id)![dayNumber];
      if (value !== null) today.set(company.id, value);
    }

    // The pairs with a deal today, before a newcomer looks for a spot beside its partner.
    dealPairsToday.clear();
    for (const pair of pairDeals) {
      if (pair.date <= date) dealPairsToday.add(pairKey(pair.a, pair.b));
    }

    // A company that leaves is dropped; the rest keep their places with today's radius.
    const before = nodes.length;
    let kept = 0;
    for (const node of nodes) {
      const value = today.get(node.id);
      if (value === undefined) {
        byId.delete(node.id);
        continue;
      }
      node.r0 = Math.sqrt(value);
      node.vx = 0;
      node.vy = 0;
      nodes[kept] = node;
      kept += 1;
    }
    nodes.length = kept;
    for (const company of companies) {
      const value = today.get(company.id);
      if (value === undefined || byId.has(company.id)) continue;
      const r0 = Math.sqrt(value);
      // Day one starts the whole cluster on a spiral; later days start an entrant beside a
      // partner, or at the cluster's rim when it has no partner yet.
      const spot: { x: number; y: number } =
        dayNumber === 0
          ? spiralSpot(nodes.length)
          : entrySpot(company.id, r0, date, nodes, byId, deals, gapById);
      const node: SimNode = {
        id: company.id,
        r0,
        x: spot.x,
        y: spot.y,
        vx: 0,
        vy: 0,
        partners: new Set(),
      };
      nodes.push(node);
      byId.set(company.id, node);
    }

    links.length = 0;
    for (const node of nodes) node.partners.clear();
    for (const pair of pairDeals) {
      if (pair.date > date) continue;
      const source = byId.get(pair.a);
      const target = byId.get(pair.b);
      if (!source || !target) continue;
      source.partners.add(target);
      target.partners.add(source);
      links.push({ source, target });
    }

    if (simulation === null) {
      simulation = forceSimulation(nodes)
        .randomSource(random)
        .force("collide", collideForce(gapOf, 1, 1))
        .force("pull", centrePull(CENTRE_PULL))
        .force("link", linkForce(links, dealGap, LINK_PULL))
        .stop();
    }
    if (dayNumber === 0) {
      simulation.tick(DAY_ONE_TICKS);
    } else {
      // A day with a newcomer gets four times the ticks, so the cluster takes it in straight
      // away instead of staying stretched around it for the weeks that follow.
      simulation.alpha(DAY_ALPHA).tick(nodes.length > before ? ENTRY_TICKS : DAY_TICKS);
    }
    // Forces alone can leave a small circle a little inside two big ones; the push-apart pass
    // leaves every pair the full gap apart before the day is recorded.
    relaxOverlaps(nodes, gapOf);

    days.set(
      date,
      new Map(nodes.map((node) => [node.id, { x: node.x, y: node.y, r: node.r0 }])),
    );
  }

  // The frame: each day's cluster is moved so that the middle of the tightest circle around
  // that day's bubbles lands on the middle of the frame, and one scale for every day comes from
  // the day that reaches furthest. The middle is a moving average over the 30 days before and
  // after, so one busy day cannot shift the whole cluster and the day-to-day movement stays
  // small.
  const datesInOrder = [...days.keys()];
  // The bigger gaps can throw a small bubble squeezed between two big ones a long way in one
  // day. A first guess at the scale turns MAX_DAY_MOVE into raw units, and the places are then
  // held to that glide from the day before; the frame fit is worked out again from what is left.
  const guess = frameFit(days, datesInOrder);
  glide(days, datesInOrder, MAX_DAY_MOVE / guess.scale);
  const fit = frameFit(days, datesInOrder);

  // One scale for all days: the biggest day's cluster touches the fit circle exactly, so no day
  // is drawn past the frame and none is drawn much smaller than it needs to be.
  for (const [index, date] of datesInOrder.entries()) {
    const centre = fit.centres[index];
    for (const placed of days.get(date)!.values()) {
      placed.x = FRAME.cx + (placed.x - centre.x) * fit.scale;
      placed.y = FRAME.cy + (placed.y - centre.y) * fit.scale;
      placed.r *= fit.scale;
    }
  }

  return { first, last, days, edgeGap: edgeGap * fit.scale, dealGap: dealGap * fit.scale };
}

// A date before the first day uses the first day's layout; after the last day, the last day's.
function clampDate(date: string, layout: DayLayouts): string {
  if (date < layout.first) return layout.first;
  if (date > layout.last) return layout.last;
  return date;
}

// The companies shown on that day, with that day's place and radius from the layout.
export function bubblesOn(
  date: string,
  companies: Company[],
  values: ValuePoint[],
  deals: Deal[] = [],
  layout: DayLayouts = dayLayouts(companies, values, deals),
): Bubble[] {
  const day = clampDate(date, layout);
  const placed = layout.days.get(day);
  const out: Bubble[] = [];
  if (!placed) return out;
  for (const company of companies) {
    const spot = placed.get(company.id);
    if (!spot) continue;
    if (!isShown(company, day)) continue;
    const value = valueOn(values, company.id, day);
    if (value === null) continue;
    out.push({
      id: company.id,
      name: company.name,
      kind: company.kind,
      x: spot.x,
      y: spot.y,
      r: spot.r,
      value,
    });
  }
  return out;
}

// The curve for one arrow: the control point is the midpoint of the two centres moved
// sideways (perpendicular) by bend x the distance between centres. Start and end sit on the
// two circles' edges on the line from each centre toward the control point.
export function arrowCurve(from: Placed, to: Placed, bend: number, side: 1 | -1): Curve {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1e-9;
  const px = (-dy / distance) * side;
  const py = (dx / distance) * side;
  const cx = (from.x + to.x) / 2 + px * bend * distance;
  const cy = (from.y + to.y) / 2 + py * bend * distance;

  const sd = Math.hypot(cx - from.x, cy - from.y) || 1e-9;
  const ed = Math.hypot(cx - to.x, cy - to.y) || 1e-9;
  return {
    x1: from.x + ((cx - from.x) / sd) * (from.r + 0.5),
    y1: from.y + ((cy - from.y) / sd) * (from.r + 0.5),
    cx,
    cy,
    x2: to.x + ((cx - to.x) / ed) * (to.r + 0.8),
    y2: to.y + ((cy - to.y) / ed) * (to.r + 0.8),
  };
}

// The straight distance between the two ends of an arrow: the line a reader would draw if the
// way were free. Bent lines are held to a share of it (LONGEST_LINE).
export function straightDistance(from: Placed, to: Placed): number {
  const curve = arrowCurve(from, to, 0, 1);
  return Math.hypot(curve.x2 - curve.x1, curve.y2 - curve.y1);
}

// The length along one quadratic curve, from short steps along it.
function curveLength(curve: Curve): number {
  let length = 0;
  let x = curve.x1;
  let y = curve.y1;
  for (let sample = 1; sample <= BEND_SAMPLES; sample += 1) {
    const t = sample / BEND_SAMPLES;
    const u = 1 - t;
    const nextX = u * u * curve.x1 + 2 * u * t * curve.cx + t * t * curve.x2;
    const nextY = u * u * curve.y1 + 2 * u * t * curve.cy + t * t * curve.y2;
    length += Math.hypot(nextX - x, nextY - y);
    x = nextX;
    y = nextY;
  }
  return length;
}

// How many of the points along one candidate line are inside another bubble (plus the small
// margin) or outside the frame circle: what a line has to go round. Counting stops at `stopAt`,
// because a candidate that is already no better than the best one so far cannot win.
function blockCount(
  from: Placed,
  to: Placed,
  others: Placed[],
  bend: number,
  side: 1 | -1,
  stopAt: number,
): number {
  const curve = arrowCurve(from, to, bend, side);
  let count = 0;
  for (let sample = 1; sample <= BEND_SAMPLES; sample += 1) {
    const t = sample / (BEND_SAMPLES + 1);
    const u = 1 - t;
    const x = u * u * curve.x1 + 2 * u * t * curve.cx + t * t * curve.x2;
    const y = u * u * curve.y1 + 2 * u * t * curve.cy + t * t * curve.y2;
    if (Math.hypot(x - FRAME.cx, y - FRAME.cy) > FRAME.radius) count += 1;
    for (const bubble of others) {
      if (Math.hypot(x - bubble.x, y - bubble.y) < bubble.r + LINE_MARGIN) {
        count += 1;
        break;
      }
    }
    if (count >= stopAt) break;
  }
  return count;
}

// Which side of the from->to line a pair's first arrow bends to, and how far. A straight line is
// used whenever it stays clear; otherwise the smallest bend whose curve clears wins. When no bend
// clears, the line that runs through the least wins, the smaller bend first; a bend whose curve
// would be longer than LONGEST_LINE x the straight distance is not considered, and the straight
// line is kept instead. The side facing away from the frame centre is tried first, so it wins a
// tie.
export function arrowPath(
  from: Placed,
  to: Placed,
  others: Placed[],
): { side: 1 | -1; bend: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1e-9;
  // The control point farther from the frame centre faces away from it.
  const mx = (from.x + to.x) / 2 - FRAME.cx;
  const my = (from.y + to.y) / 2 - FRAME.cy;
  const away: 1 | -1 = (-dy / distance) * mx + (dx / distance) * my >= 0 ? 1 : -1;
  const sides: (1 | -1)[] = [away, away === 1 ? -1 : 1];
  const limit = LONGEST_LINE * straightDistance(from, to);

  const straight = blockCount(from, to, others, 0, away, Infinity);
  if (straight === 0) return { side: away, bend: 0 };
  let best = { side: away, bend: 0 };
  let bestCount = straight;
  for (const bend of BEND_TRIES) {
    if (curveLength(arrowCurve(from, to, bend, 1)) > limit) break;
    for (const side of sides) {
      const count = blockCount(from, to, others, bend, side, bestCount);
      if (count === 0) return { side, bend };
      if (count >= bestCount) continue;
      best = { side, bend };
      bestCount = count;
    }
  }
  return best;
}

type DealGroup = {
  from: string;
  to: string;
  kind: Deal["kind"];
  count: number;
  amount: number;
  known: boolean;
};

// Deals on or before that day, merged per (from, to, kind), drawn as curves around the bubbles.
export function arrowsOn(
  date: string,
  companies: Company[],
  values: ValuePoint[],
  deals: Deal[],
  layout: DayLayouts = dayLayouts(companies, values, deals),
): Arrow[] {
  const day = clampDate(date, layout);
  const bubbles = bubblesOn(day, companies, values, deals, layout);
  const byId = new Map(bubbles.map((bubble) => [bubble.id, bubble]));

  const groups = new Map<string, DealGroup>();
  for (const deal of deals) {
    if (deal.date > day) continue;
    if (!byId.has(deal.from) || !byId.has(deal.to)) continue;
    const key = `${deal.from}|${deal.to}|${deal.kind}`;
    const group = groups.get(key);
    if (group) {
      group.count += 1;
      group.amount += deal.amount_usd_bn ?? 0;
      group.known = group.known || deal.amount_usd_bn !== null;
    } else {
      groups.set(key, {
        from: deal.from,
        to: deal.to,
        kind: deal.kind,
        count: 1,
        amount: deal.amount_usd_bn ?? 0,
        known: deal.amount_usd_bn !== null,
      });
    }
  }

  // All arrows between the same two companies (any kind, either direction) bend to one side.
  const byPair = new Map<string, DealGroup[]>();
  for (const group of groups.values()) {
    const key = group.from < group.to ? `${group.from}|${group.to}` : `${group.to}|${group.from}`;
    const pair = byPair.get(key) ?? [];
    pair.push(group);
    byPair.set(key, pair);
  }

  const out: Arrow[] = [];
  for (const pair of byPair.values()) {
    // The pair's first arrow has the largest amount; ties by the string "from|to|kind".
    pair.sort((a, b) => {
      if (a.amount !== b.amount) return b.amount - a.amount;
      const left = `${a.from}|${a.to}|${a.kind}`;
      const right = `${b.from}|${b.to}|${b.kind}`;
      return left < right ? -1 : left > right ? 1 : 0;
    });
    const first = pair[0];
    const others = bubbles.filter((bubble) => bubble.id !== first.from && bubble.id !== first.to);
    const path = arrowPath(byId.get(first.from)!, byId.get(first.to)!, others);
    pair.forEach((group, index) => {
      const from = byId.get(group.from)!;
      const to = byId.get(group.to)!;
      // An arrow going the other way flips its side so the pair bends to the same side.
      const side: 1 | -1 =
        group.from === first.from && group.to === first.to ? path.side : path.side === 1 ? -1 : 1;
      // The pair's other arrows keep the chosen side and bend a little wider each time, so they
      // nest outside the first one. None is allowed past the length limit: the extra bend stops
      // growing when the next step would take it there. A line that cannot be drawn within the
      // limit is drawn straight, under the bubbles.
      const limit = LONGEST_LINE * straightDistance(from, to);
      let bend = path.bend;
      for (let step = 1; step <= index; step += 1) {
        const wider = bend + BEND_STEP;
        if (curveLength(arrowCurve(from, to, wider, side)) > limit) break;
        bend = wider;
      }
      const curve = arrowCurve(from, to, bend, side);
      out.push({
        from: group.from,
        to: group.to,
        kind: group.kind,
        count: group.count,
        amount_usd_bn: group.amount,
        amountKnown: group.known,
        ...curve,
        pairFirst: index === 0,
        bend,
        side,
      });
    });
  }
  return out;
}

// The sum of the values shown on that day.
export function totalOn(
  date: string,
  companies: Company[],
  values: ValuePoint[],
  deals: Deal[] = [],
  layout: DayLayouts = dayLayouts(companies, values, deals),
): number {
  return bubblesOn(date, companies, values, deals, layout).reduce((sum, bubble) => sum + bubble.value, 0);
}

// "$1.2T", "$340B", "$8B".
export function formatValue(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (rounded >= 1000) return `$${(rounded / 1000).toFixed(1)}T`;
  const text = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
  return `$${text}B`;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// "14 March 2024".
export function formatDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

// The last day of the active data set: the latest date in the AI bubble's files, and the
// last_day in a past set's meta.json. Never the clock.
export function defaultDate(): string {
  return LAST_DAY;
}

// Thin wrappers over the real data, for the page and the renderer. The layout is computed
// once per data set, on first use, and kept per data set.
const realLayouts = new Map<DatasetId, DayLayouts>();

function realLayoutsFor(): DayLayouts {
  let layout = realLayouts.get(datasetId);
  if (layout === undefined) {
    layout = dayLayouts(companies, values, deals, defaultDate());
    realLayouts.set(datasetId, layout);
  }
  return layout;
}

export function bubblesForDate(date: string): Bubble[] {
  return bubblesOn(date, companies, values, deals, realLayoutsFor());
}

export function arrowsForDate(date: string): Arrow[] {
  return arrowsOn(date, companies, values, deals, realLayoutsFor());
}

export function totalForDate(date: string): number {
  return totalOn(date, companies, values, deals, realLayoutsFor());
}
