// Draws one day of the bubble into an SVG. The layout itself is pure and lives in layout.ts,
// and the camera that flies to the players lives in camera.ts.
//
// Everything on screen is keyed by company id (bubbles) or "from|to|kind" (arrows), so a
// company that is shown on two days in a row keeps its element. Changing the day tweens
// every bubble from where it is now to where the new day puts it, and the money lines are
// redrawn from the bubbles' tweened places on each frame, so they stay attached.

import { arrowCurve, arrowsForDate, bubblesForDate, formatDate, formatValue, FRAME } from "./layout.ts";
import type { Arrow, Bubble, Placed } from "./layout.ts";
import { fitView, sceneTransform } from "./camera.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
const CLIP_ID = "aibubble-clip";

// How long the bubbles take to glide to a new day, and how long a company takes to fade in
// or out (the fade is the stylesheet's 700ms opacity transition; this is how long we keep a
// leaving company's element before removing it).
const GLIDE_MS = 500;
const FADE_MS = 700;

// Opacity of a faint money line, and of a bubble that is not a player of the chosen item.
const FAINT = "0.28";
const DIM = "0.38";

// The small arrowhead at the end of a strong line.
const HEAD_LENGTH = 1.4;
const HEAD_HALF = 0.8;

function el<T extends SVGElement>(name: string): T {
  return document.createElementNS(SVG_NS, name) as T;
}

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function fixed(value: number): string {
  return value.toFixed(3);
}

// Ease in-out, so a bubble starts and stops gently.
function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) * (-2 * t + 2)) / 2;
}

type BubbleNode = {
  group: SVGGElement;
  circle: SVGCircleElement;
  logo: SVGGElement;
  logoRect: SVGRectElement;
  logoText: SVGTextElement;
  name: SVGTextElement;
  value: SVGTextElement;
};

type ArrowNode = {
  group: SVGGElement;
  shaft: SVGPathElement;
  head: SVGPathElement;
};

// A bubble on screen, with where it is now and where this glide is taking it.
type LiveBubble = {
  node: BubbleNode;
  bubble: Bubble;
  x: number;
  y: number;
  r: number;
  fromX: number;
  fromY: number;
  fromR: number;
  toX: number;
  toY: number;
  toR: number;
  leaving: boolean;
  removal: ReturnType<typeof setTimeout> | null;
};

// A money line on screen. Its path follows the bubbles' place on every frame.
type LiveArrow = {
  node: ArrowNode;
  arrow: Arrow;
  strong: boolean;
  visible: boolean;
  leaving: boolean;
  removal: ReturnType<typeof setTimeout> | null;
};

type Drawing = {
  bubbles: Map<string, LiveBubble>;
  arrows: Map<string, LiveArrow>;
  zoom: number;
  players: Set<string>;
  dim: boolean;
  startedAt: number;
  raf: number | null;
  reduced: boolean;
};

const drawings = new WeakMap<SVGSVGElement, Drawing>();

// The clip, the scene group the camera will transform, and the frame ring on top.
function ensureScene(
  svg: SVGSVGElement,
): { bubbleLayer: SVGGElement; arrowLayer: SVGGElement; scene: SVGGElement } {
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = el("defs");
    svg.appendChild(defs);
  }
  if (!defs.querySelector(`#${CLIP_ID}`)) {
    const clip = el("clipPath");
    clip.id = CLIP_ID;
    const circle = el("circle");
    circle.setAttribute("cx", String(FRAME.cx));
    circle.setAttribute("cy", String(FRAME.cy));
    circle.setAttribute("r", String(FRAME.radius));
    clip.appendChild(circle);
    defs.appendChild(clip);
  }

  let clipGroup = svg.querySelector("g.bubble-clip");
  if (!clipGroup) {
    clipGroup = el("g");
    clipGroup.setAttribute("class", "bubble-clip");
    clipGroup.setAttribute("clip-path", `url(#${CLIP_ID})`);
    svg.appendChild(clipGroup);
  }

  let scene = svg.querySelector<SVGGElement>("g.scene");
  if (!scene) {
    scene = el("g");
    scene.setAttribute("class", "scene");
    clipGroup.appendChild(scene);
  }
  // The camera scales the scene about the top left of the frame.
  scene.style.setProperty("transform-box", "view-box");
  scene.style.setProperty("transform-origin", "0 0");

  let bubbleLayer = scene.querySelector("g.bubble-layer");
  if (!bubbleLayer) {
    bubbleLayer = el("g");
    bubbleLayer.setAttribute("class", "bubble-layer");
    scene.appendChild(bubbleLayer);
  }

  let arrowLayer = scene.querySelector("g.arrow-layer");
  if (!arrowLayer) {
    arrowLayer = el("g");
    arrowLayer.setAttribute("class", "arrow-layer");
    scene.appendChild(arrowLayer);
  }

  let ring = svg.querySelector<SVGCircleElement>("circle.bubble-frame");
  if (!ring) {
    ring = el("circle");
    ring.setAttribute("class", "bubble-frame");
    ring.setAttribute("cx", String(FRAME.cx));
    ring.setAttribute("cy", String(FRAME.cy));
    ring.setAttribute("r", String(FRAME.radius));
    ring.style.fill = "none";
    ring.style.stroke = "var(--ink)";
    ring.style.strokeWidth = "1.5px";
    ring.setAttribute("vector-effect", "non-scaling-stroke");
    ring.style.pointerEvents = "none";
    svg.appendChild(ring);
  }

  return {
    bubbleLayer: bubbleLayer as SVGGElement,
    arrowLayer: arrowLayer as SVGGElement,
    scene: scene as SVGGElement,
  };
}

function createBubbleNode(bubble: Bubble): BubbleNode {
  const group = el<SVGGElement>("g");
  group.setAttribute("class", "bubble");
  group.setAttribute("data-id", bubble.id);

  const circle = el<SVGCircleElement>("circle");
  circle.setAttribute("class", "bubble-circle");
  circle.style.fill = "var(--muted)";
  circle.style.stroke = "var(--ink)";
  circle.style.strokeWidth = "1px";
  circle.setAttribute("vector-effect", "non-scaling-stroke");
  group.appendChild(circle);

  const logo = el<SVGGElement>("g");
  logo.setAttribute("class", "bubble-logo");
  const logoRect = el<SVGRectElement>("rect");
  logoRect.setAttribute("class", "bubble-logo-box");
  logoRect.style.fill = "none";
  logoRect.style.stroke = "var(--ink)";
  logoRect.style.strokeWidth = "1px";
  logoRect.setAttribute("stroke-dasharray", "2 1.5");
  logoRect.setAttribute("vector-effect", "non-scaling-stroke");
  const logoText = el<SVGTextElement>("text");
  logoText.setAttribute("class", "bubble-logo-text");
  logoText.style.fill = "var(--ink)";
  logoText.style.fontFamily = "var(--font-sans)";
  logoText.style.fontWeight = "600";
  logoText.setAttribute("text-anchor", "middle");
  logoText.setAttribute("dominant-baseline", "central");
  logo.appendChild(logoRect);
  logo.appendChild(logoText);
  group.appendChild(logo);

  const name = el<SVGTextElement>("text");
  name.setAttribute("class", "bubble-name");
  name.style.fill = "var(--ink)";
  name.style.fontFamily = "var(--font-sans)";
  name.style.fontWeight = "600";
  name.setAttribute("text-anchor", "middle");
  name.setAttribute("dominant-baseline", "central");
  group.appendChild(name);

  const value = el<SVGTextElement>("text");
  value.setAttribute("class", "bubble-value");
  value.style.fill = "var(--ink-2)";
  value.style.fontFamily = "var(--font-sans)";
  value.setAttribute("text-anchor", "middle");
  value.setAttribute("dominant-baseline", "central");
  group.appendChild(value);

  return { group, circle, logo, logoRect, logoText, name, value };
}

// Paints one bubble where it is right now: circle, dashed group edge, logo slot, labels.
function paintBubble(live: LiveBubble, drawing: Drawing): void {
  const { node, bubble, x, y, r } = live;
  const { circle, logo, logoRect, logoText, name, value } = node;
  const isGroup = bubble.kind === "group";
  const isPlayer = drawing.players.has(bubble.id);
  const zoom = drawing.zoom;

  circle.setAttribute("cx", fixed(x));
  circle.setAttribute("cy", fixed(y));
  circle.setAttribute("r", fixed(r));
  if (isGroup) {
    circle.style.fill = "none";
    circle.style.stroke = "var(--ink-2)";
    circle.style.strokeWidth = "1px";
    circle.setAttribute("stroke-dasharray", "2 1.5");
  } else {
    circle.style.fill = "var(--muted)";
    circle.style.stroke = "var(--ink)";
    // A player of the current item gets a thicker ink outline.
    circle.style.strokeWidth = isPlayer ? "2px" : "1px";
    circle.removeAttribute("stroke-dasharray");
  }

  // Which labels show depends on the size of the circle on screen.
  const onScreen = r * zoom;
  const showLogo = !isGroup && onScreen >= 6.5;
  const showName = onScreen >= 3.4;
  const showValue = onScreen >= 7;
  logo.style.display = showLogo ? "" : "none";
  name.style.display = showName ? "" : "none";
  value.style.display = showValue ? "" : "none";

  // Font sizes are chosen for the screen and then divided by the zoom, so the text stays the same
  // size on screen however far the camera moves.
  const nameSize = clamp(1.8, r * 0.15 * zoom, 3.8) / zoom;
  const valueSize = clamp(1.5, r * 0.1 * zoom, 2.6) / zoom;
  const logoSize = clamp(2.2, r * 0.22 * zoom, 5) / zoom;
  const gap = 0.5 / zoom;

  const stack = (showLogo ? logoSize + gap : 0) + (showName ? nameSize : 0) + (showValue ? gap + valueSize : 0);
  let cursor = y - stack / 2;
  let logoCenter = 0;
  let nameCenter = 0;
  let valueCenter = 0;
  if (showLogo) {
    logoCenter = cursor + logoSize / 2;
    cursor += logoSize + gap;
  }
  if (showName) {
    nameCenter = cursor + nameSize / 2;
    cursor += nameSize;
  }
  if (showValue) {
    valueCenter = cursor + gap + valueSize / 2;
  }

  if (showLogo) {
    logoRect.setAttribute("x", fixed(x - logoSize / 2));
    logoRect.setAttribute("y", fixed(logoCenter - logoSize / 2));
    logoRect.setAttribute("width", fixed(logoSize));
    logoRect.setAttribute("height", fixed(logoSize));
    logoRect.setAttribute("rx", fixed(logoSize * 0.25));
    logoText.setAttribute("x", fixed(x));
    logoText.setAttribute("y", fixed(logoCenter));
    logoText.style.fontSize = `${fixed(logoSize * 0.5)}px`;
    logoText.textContent = bubble.name.charAt(0);
  }
  if (showName) {
    name.setAttribute("x", fixed(x));
    name.setAttribute("y", fixed(nameCenter));
    name.style.fontSize = `${fixed(nameSize)}px`;
    name.textContent = bubble.name;
  }
  if (showValue) {
    value.setAttribute("x", fixed(x));
    value.setAttribute("y", fixed(valueCenter));
    value.style.fontSize = `${fixed(valueSize)}px`;
    value.textContent = formatValue(bubble.value);
  }
}

function createArrowNode(): ArrowNode {
  const group = el<SVGGElement>("g");
  group.setAttribute("class", "bubble-arrow");
  const shaft = el<SVGPathElement>("path");
  shaft.setAttribute("class", "bubble-arrow-line");
  shaft.setAttribute("fill", "none");
  shaft.setAttribute("vector-effect", "non-scaling-stroke");
  shaft.setAttribute("stroke-linecap", "round");
  const head = el<SVGPathElement>("path");
  head.setAttribute("class", "bubble-arrow-head");
  head.setAttribute("fill", "none");
  head.setAttribute("vector-effect", "non-scaling-stroke");
  head.setAttribute("stroke-linecap", "round");
  group.appendChild(shaft);
  group.appendChild(head);
  return { group, shaft, head };
}

// The look of one arrow: a pale thin line for the everyday view, or its kind colour and
// small arrowhead when both ends are players of the chosen item.
function styleArrow(live: LiveArrow): void {
  const strong = live.strong;
  live.node.shaft.style.stroke = strong ? `var(--${live.arrow.kind})` : "var(--ink-2)";
  live.node.shaft.style.strokeWidth = strong ? "1.75px" : "1px";
  live.node.head.style.stroke = strong ? `var(--${live.arrow.kind})` : "var(--ink-2)";
  live.node.head.style.display = strong ? "" : "none";
  live.node.group.style.opacity = live.visible ? (strong ? "1" : FAINT) : "0";
}

// The shape of one arrow at this instant: the curve, plus the little head at its end.
function shapeArrow(live: LiveArrow, from: Placed, to: Placed): void {
  const curve = arrowCurve(from, to, live.arrow.bend, live.arrow.side);
  live.node.shaft.setAttribute(
    "d",
    `M ${fixed(curve.x1)} ${fixed(curve.y1)} Q ${fixed(curve.cx)} ${fixed(curve.cy)} ${fixed(curve.x2)} ${fixed(curve.y2)}`,
  );
  if (!live.strong) return;

  // The head points the way the curve arrives, from the control point to the end.
  const dx = curve.x2 - curve.cx;
  const dy = curve.y2 - curve.cy;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  live.node.head.setAttribute(
    "d",
    `M ${fixed(curve.x2 - ux * HEAD_LENGTH + px * HEAD_HALF)} ${fixed(curve.y2 - uy * HEAD_LENGTH + py * HEAD_HALF)} ` +
      `L ${fixed(curve.x2)} ${fixed(curve.y2)} ` +
      `L ${fixed(curve.x2 - ux * HEAD_LENGTH - px * HEAD_HALF)} ${fixed(curve.y2 - uy * HEAD_LENGTH - py * HEAD_HALF)}`,
  );
}

// Every money line, redrawn from where the bubbles are at this instant.
function paintArrows(drawing: Drawing): void {
  for (const live of drawing.arrows.values()) {
    if (!live.visible) continue;
    const from = drawing.bubbles.get(live.arrow.from);
    const to = drawing.bubbles.get(live.arrow.to);
    if (!from || !to) continue;
    shapeArrow(live, { x: from.x, y: from.y, r: from.r }, { x: to.x, y: to.y, r: to.r });
  }
}

function paintAll(drawing: Drawing): void {
  for (const live of drawing.bubbles.values()) paintBubble(live, drawing);
  paintArrows(drawing);
}

// One frame of the glide: ease every bubble to its new place, then redraw the lines.
function step(drawing: Drawing, now: number): void {
  const t = Math.min(1, Math.max(0, (now - drawing.startedAt) / GLIDE_MS));
  const e = ease(t);
  for (const live of drawing.bubbles.values()) {
    live.x = live.fromX + (live.toX - live.fromX) * e;
    live.y = live.fromY + (live.toY - live.fromY) * e;
    live.r = live.fromR + (live.toR - live.fromR) * e;
  }
  paintAll(drawing);
  drawing.raf = t < 1 ? requestAnimationFrame((later) => step(drawing, later)) : null;
}

// Jumps straight to the new day, for a reader who asked for reduced motion.
function jump(drawing: Drawing): void {
  if (drawing.raf !== null) {
    cancelAnimationFrame(drawing.raf);
    drawing.raf = null;
  }
  for (const live of drawing.bubbles.values()) {
    live.x = live.toX;
    live.y = live.toY;
    live.r = live.toR;
  }
  paintAll(drawing);
}

function glide(drawing: Drawing): void {
  if (drawing.raf !== null) cancelAnimationFrame(drawing.raf);
  drawing.raf = null;
  if (drawing.reduced) {
    jump(drawing);
    return;
  }
  drawing.startedAt = performance.now();
  drawing.raf = requestAnimationFrame((now) => step(drawing, now));
}

function removeBubble(drawing: Drawing, id: string, live: LiveBubble): void {
  live.removal = setTimeout(() => {
    live.node.group.remove();
    if (drawing.bubbles.get(id) === live) drawing.bubbles.delete(id);
  }, FADE_MS);
}

function removeArrow(drawing: Drawing, key: string, live: LiveArrow): void {
  live.removal = setTimeout(() => {
    live.node.group.remove();
    if (drawing.arrows.get(key) === live) drawing.arrows.delete(key);
  }, FADE_MS);
}

// Keyed by company id: a company shown today and tomorrow keeps its element and glides.
function updateBubbles(drawing: Drawing, layer: SVGGElement, bubbles: Bubble[]): void {
  const seen = new Set<string>();
  for (const bubble of bubbles) {
    seen.add(bubble.id);
    const existing = drawing.bubbles.get(bubble.id);
    if (!existing) {
      const node = createBubbleNode(bubble);
      layer.appendChild(node.group);
      node.group.style.opacity = "0";
      const live: LiveBubble = {
        node,
        bubble,
        x: bubble.x,
        y: bubble.y,
        r: 0,
        fromX: bubble.x,
        fromY: bubble.y,
        fromR: 0,
        toX: bubble.x,
        toY: bubble.y,
        toR: bubble.r,
        leaving: false,
        removal: null,
      };
      drawing.bubbles.set(bubble.id, live);
      // A company new to this day grows out of nothing; the stylesheet fades the element in.
      requestAnimationFrame(() => {
        node.group.style.opacity = opacityOf(live, drawing);
      });
      continue;
    }
    if (existing.removal !== null) {
      // It was fading out and this day shows it again: keep the element, fade back in.
      clearTimeout(existing.removal);
      existing.removal = null;
    }
    // A new day during a glide starts the next glide from where the bubble is now.
    existing.fromX = existing.x;
    existing.fromY = existing.y;
    existing.fromR = existing.r;
    existing.toX = bubble.x;
    existing.toY = bubble.y;
    existing.toR = bubble.r;
    existing.bubble = bubble;
    existing.leaving = false;
    existing.node.group.style.opacity = opacityOf(existing, drawing);
  }

  for (const [id, live] of drawing.bubbles) {
    if (seen.has(id) || live.leaving) continue;
    // It leaves this day: fade out and remove it, keeping its last place meanwhile.
    live.leaving = true;
    live.fromX = live.x;
    live.fromY = live.y;
    live.fromR = live.r;
    live.toX = live.x;
    live.toY = live.y;
    live.toR = live.r;
    live.node.group.style.opacity = "0";
    removeBubble(drawing, id, live);
  }
}

function opacityOf(live: LiveBubble, drawing: Drawing): string {
  if (live.leaving) return "0";
  return drawing.dim && !drawing.players.has(live.bubble.id) ? DIM : "1";
}

function updateArrows(drawing: Drawing, layer: SVGGElement, arrows: Arrow[]): void {
  const seen = new Set<string>();
  for (const arrow of arrows) {
    const key = `${arrow.from}|${arrow.to}|${arrow.kind}`;
    seen.add(key);
    const strong = drawing.dim && drawing.players.has(arrow.from) && drawing.players.has(arrow.to);
    // The everyday view draws one pale line per pair; a chosen item draws every line of
    // its own pairs in full.
    const visible = strong || arrow.pairFirst;
    const live = drawing.arrows.get(key);
    if (!live) {
      const node = createArrowNode();
      layer.appendChild(node.group);
      node.group.style.opacity = "0";
      const created: LiveArrow = { node, arrow, strong, visible, leaving: false, removal: null };
      drawing.arrows.set(key, created);
      requestAnimationFrame(() => styleArrow(created));
      continue;
    }
    if (live.removal !== null) {
      clearTimeout(live.removal);
      live.removal = null;
    }
    live.arrow = arrow;
    live.strong = strong;
    live.visible = visible;
    live.leaving = false;
    styleArrow(live);
  }

  for (const [key, live] of drawing.arrows) {
    if (seen.has(key) || live.leaving) continue;
    live.leaving = true;
    live.visible = false;
    live.node.group.style.opacity = "0";
    removeArrow(drawing, key, live);
  }
}

function ariaLabel(date: string, bubbles: Bubble[]): string {
  const top = [...bubbles]
    .sort((a, b) => b.value - a.value || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .slice(0, 5)
    .map((bubble) => `${bubble.name} ${formatValue(bubble.value)}`)
    .join(", ");
  return `AI companies on ${formatDate(date)}, sized by value: ${top || "none yet"}`;
}

// The camera glides to its new place, unless the visitor asked for reduced motion.
function cameraTransition(): string {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduced ? "none" : "transform 900ms cubic-bezier(0.65, 0, 0.35, 1)";
}

export type BubbleOptions = {
  // The players of the current item: the companies the camera flies to.
  players?: string[];
  // The reader's own zoom on top of the automatic fit.
  manual?: number;
};

export function renderBubble(
  svg: SVGSVGElement,
  date: string,
  options: BubbleOptions = {},
): void {
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("role", "img");
  const bubbles = bubblesForDate(date);
  const arrows = arrowsForDate(date);
  svg.setAttribute("aria-label", ariaLabel(date, bubbles));

  const wanted = new Set(options.players ?? []);
  // Players that are not on screen that day are ignored, as in the design.
  const players = new Set(bubbles.filter((bubble) => wanted.has(bubble.id)).map((bubble) => bubble.id));
  const view = fitView(bubbles, options.players ?? [], options.manual ?? 1);

  const { bubbleLayer, arrowLayer, scene } = ensureScene(svg);
  let drawing = drawings.get(svg);
  if (!drawing) {
    drawing = {
      bubbles: new Map(),
      arrows: new Map(),
      zoom: view.z,
      players,
      dim: players.size > 0,
      startedAt: 0,
      raf: null,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
    drawings.set(svg, drawing);
  }
  drawing.zoom = view.z;
  drawing.players = players;
  drawing.dim = players.size > 0;
  drawing.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  updateBubbles(drawing, bubbleLayer, bubbles);
  updateArrows(drawing, arrowLayer, arrows);
  glide(drawing);

  scene.style.transition = cameraTransition();
  scene.style.transform = sceneTransform(view);
}
