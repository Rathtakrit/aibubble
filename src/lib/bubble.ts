// Draws one day of the bubble into an SVG. The layout itself is pure and lives in layout.ts,
// and the camera that flies to the players lives in camera.ts.
//
// Everything on screen is keyed by company id (bubbles) or "from|to|kind" (arrows), so a
// company that is shown on two days in a row keeps its element. Changing the day tweens
// every bubble from where it is now to where the new day puts it, and the money lines are
// redrawn from the bubbles' tweened places on each frame, so they stay attached.

import { arrowCurve, arrowsForDate, bubblesForDate, formatDate, formatValue, FRAME, totalForDate } from "./layout.ts";
import type { Arrow, Bubble, Placed } from "./layout.ts";
import { kindColour } from "./data.ts";
import { clampPan, dayView, panView, ringRatio, sceneTransform } from "./camera.ts";
import type { Pan, PeakDay } from "./camera.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
const CLIP_ID = "aibubble-clip";

// How long the bubbles take to glide to a new day, and how long a company takes to fade in
// or out (the fade is the stylesheet's 700ms opacity transition; this is how long we keep a
// leaving company's element before removing it).
const GLIDE_MS = 500;
const FADE_MS = 700;

// Opacity of a faint money line, and of a bubble that is not a player of the chosen item.
const FAINT = "0.45";
const DIM = "var(--bubble-dim-opacity, 0.38)";

// Minimum hit radius in CSS pixels, not in the viewBox or scene.
const HIT_RADIUS = 22;

// The small arrowhead at the end of a strong line.
const HEAD_LENGTH = 1.4;
const HEAD_HALF = 0.8;

// The peak label's arc, just inside the dots. The phone one is mirrored to the upper-left,
// because the Zoom button covers the upper-right edge there.
const PEAK_ARC_DESKTOP = "M 66.07 5.84 A 47 47 0 0 1 96.82 45.90";
const PEAK_ARC_PHONE = "M 3.18 45.90 A 47 47 0 0 1 33.93 5.84";

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
  title: SVGTitleElement;
  hit: SVGCircleElement;
  focusRing: SVGCircleElement;
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
  pixelsPerUnit: number;
  day: string;
  players: Set<string>;
  // The company whose panel is open, if any: its own ring and money lines.
  focus: string | null;
  dim: boolean;
  startedAt: number;
  raf: number | null;
  reduced: boolean;
  realRing: SVGCircleElement;
  ringRadius: number;
  fromRingRadius: number;
  toRingRadius: number;
};

const drawings = new WeakMap<SVGSVGElement, Drawing>();
// The drawings still on the page, so they can be painted once more when the font arrives.
const liveDrawings = new Set<Drawing>();

// The width of a company name at a 100px font, measured once per piece of text. The bubble's name
// font and weight never change, so its width at the size drawn is this times size / 100.
const textWidths = new Map<string, number>();

function nameWidth(name: SVGTextElement, text: string): number {
  const known = textWidths.get(text);
  if (known !== undefined) return known;
  const previousText = name.textContent;
  const previousSize = name.style.fontSize;
  const previousDisplay = name.style.display;
  name.style.display = "";
  name.style.fontSize = "100px";
  name.textContent = text;
  const measured = name.getComputedTextLength();
  name.textContent = previousText;
  name.style.fontSize = previousSize;
  name.style.display = previousDisplay;
  // A hidden SVG reports no length; the rough count then keeps the label from being drawn wide.
  const width = measured > 0 ? measured : [...text].length * 55;
  textWidths.set(text, width);
  return width;
}

// Before the font has loaded, a name is measured in the fallback font. Once the real one is ready
// every width is measured again, and each drawing is painted once more, so a long name is split or
// hidden on the width it is really drawn at.
globalThis.document?.fonts.ready.then(() => {
  textWidths.clear();
  for (const drawing of liveDrawings) paintAll(drawing);
});

function frameCircle(className: string): SVGCircleElement {
  const circle = el<SVGCircleElement>("circle");
  circle.setAttribute("class", className);
  circle.setAttribute("cx", String(FRAME.cx));
  circle.setAttribute("cy", String(FRAME.cy));
  circle.setAttribute("r", String(FRAME.radius));
  circle.style.fill = "none";
  circle.style.stroke = "var(--ink)";
  circle.style.strokeWidth = "1.5px";
  circle.setAttribute("vector-effect", "non-scaling-stroke");
  circle.style.pointerEvents = "none";
  return circle;
}

// The clipped company scene and the ring overlay on top.
function ensureScene(svg: SVGSVGElement): {
  bubbleLayer: SVGGElement;
  arrowLayer: SVGGElement;
  scene: SVGGElement;
  rings: SVGGElement;
  edge: SVGCircleElement;
} {
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

  // Money lines sit under the bubbles: a line that has to pass a bubble is covered by its fill,
  // so no line is ever seen crossing a bubble's face.
  if (arrowLayer.nextSibling !== bubbleLayer) scene.insertBefore(arrowLayer, bubbleLayer);

  let rings = svg.querySelector<SVGGElement>("g.burst-rings");
  if (!rings) {
    const ringClip = el<SVGGElement>("g");
    rings = el<SVGGElement>("g");
    rings.setAttribute("class", "burst-rings");
    rings.style.setProperty("transform-box", "view-box");
    rings.style.setProperty("transform-origin", "0 0");
    ringClip.appendChild(rings);
    svg.appendChild(ringClip);
  }

  if (!rings.querySelector("circle.bubble-frame")) {
    rings.appendChild(frameCircle("bubble-frame"));
  }

  if (!svg.querySelector(".bubble-drop")) {
    const id = `bubble-peak-arc-${svg.dataset.bubble}`;
    const arc = el<SVGPathElement>("path");
    arc.id = id;
    // Run clockwise along the upper-right edge, just inside the dots (upper-left on the phone,
    // where the arc is mirrored), so the text reads upright.
    arc.setAttribute("d", svg.dataset.bubble === "phone" ? PEAK_ARC_PHONE : PEAK_ARC_DESKTOP);
    defs.appendChild(arc);
    const text = el<SVGTextElement>("text");
    text.setAttribute("class", "bubble-drop");
    text.setAttribute("aria-hidden", "true");
    text.setAttribute("dy", "0.85em");
    const label = el<SVGTextPathElement>("textPath");
    label.setAttribute("href", `#${id}`);
    label.setAttribute("startOffset", "50%");
    label.setAttribute("text-anchor", "middle");
    text.appendChild(label);
    rings.appendChild(text);
  }

  if (!svg.querySelector("circle.bubble-real-ring")) {
    const realRing = el<SVGCircleElement>("circle");
    realRing.setAttribute("class", "bubble-real-ring");
    realRing.setAttribute("cx", String(FRAME.cx));
    realRing.style.fill = "none";
    realRing.style.stroke = "var(--ink)";
    realRing.style.strokeWidth = "1.5px";
    realRing.setAttribute("vector-effect", "non-scaling-stroke");
    realRing.style.pointerEvents = "none";
    rings.appendChild(realRing);
  }

  // Keep the edge outside both the camera transform and the clip, with its full stroke visible.
  let edge = svg.querySelector<SVGCircleElement>("circle.bubble-zoom-edge");
  if (!edge) {
    edge = frameCircle("bubble-zoom-edge");
    edge.style.display = "none";
    svg.appendChild(edge);
  }

  return {
    bubbleLayer: bubbleLayer as SVGGElement,
    arrowLayer: arrowLayer as SVGGElement,
    scene: scene as SVGGElement,
    rings,
    edge,
  };
}

const ringFrames = new WeakMap<SVGGElement, number>();

function paintRingCamera(rings: SVGGElement, transitioning: boolean): void {
  const pending = ringFrames.get(rings);
  if (pending !== undefined) cancelAnimationFrame(pending);
  ringFrames.delete(rings);

  // Counter-scale the label using the current scale, including during the camera glide.
  const transform = getComputedStyle(rings).transform;
  const matrix = new DOMMatrixReadOnly(transform === "none" ? undefined : transform);
  rings.style.setProperty("--burst-zoom", String(matrix.a));
  // At rest, leave the full stroke visible along the frame edge, as before.
  const clip = rings.parentElement!;
  if (matrix.isIdentity) clip.removeAttribute("clip-path");
  else clip.setAttribute("clip-path", `url(#${CLIP_ID})`);

  if (transitioning && rings.getAnimations().length > 0) {
    ringFrames.set(rings, requestAnimationFrame(() => paintRingCamera(rings, true)));
  }
}

function createBubbleNode(bubble: Bubble): BubbleNode {
  const group = el<SVGGElement>("g");
  group.setAttribute("class", "bubble");
  group.setAttribute("data-id", bubble.id);
  // A bubble is a button: clicking or tapping it, or Tab then Enter, opens its panel. The
  // click itself is wired up in explore.ts, not here.
  group.setAttribute("data-company", bubble.id);
  group.setAttribute("role", "button");
  group.setAttribute("tabindex", "0");
  group.style.cursor = "pointer";

  // The browser's own tooltip: a small bubble shows no name until the camera zooms in, so a mouse
  // resting on it needs this to say which company it is. It is not drawn on the page.
  const title = el<SVGTitleElement>("title");
  group.appendChild(title);

  // A transparent circle under the visible bubble makes small companies easier to tap.
  const hit = el<SVGCircleElement>("circle");
  hit.setAttribute("class", "bubble-hit");
  hit.style.fill = "transparent";
  hit.style.stroke = "none";
  group.appendChild(hit);

  // Trace the same circle from behind so keyboard focus leaves the ink stroke intact.
  const focusRing = el<SVGCircleElement>("circle");
  focusRing.setAttribute("class", "bubble-focus-ring");
  focusRing.setAttribute("aria-hidden", "true");
  focusRing.setAttribute("vector-effect", "non-scaling-stroke");
  group.appendChild(focusRing);

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

  return { group, title, hit, focusRing, circle, logo, logoRect, logoText, name, value };
}

// Paints one bubble where it is right now: circle, dashed group edge, logo slot, labels.
function paintBubble(live: LiveBubble, drawing: Drawing): void {
  const { node, bubble, x, y, r } = live;
  const { title, hit, focusRing, circle, logo, logoRect, logoText, name, value } = node;
  const isGroup = bubble.kind === "group";
  const isPlayer = drawing.players.has(bubble.id);
  // With a company panel open, only that company's bubble is ringed; with an item open, every
  // one of its players is.
  const ringed = drawing.focus === null ? isPlayer : drawing.focus === bubble.id;
  const zoom = drawing.zoom;

  hit.setAttribute("cx", fixed(x));
  hit.setAttribute("cy", fixed(y));
  hit.setAttribute("r", String(Math.max(r, HIT_RADIUS / (zoom * drawing.pixelsPerUnit))));
  node.group.setAttribute("aria-label", `${bubble.name}, ${formatValue(bubble.value)}: show its news`);
  title.textContent = `${bubble.name}, ${formatValue(bubble.value)}`;

  for (const edge of [circle, focusRing]) {
    edge.setAttribute("cx", fixed(x));
    edge.setAttribute("cy", fixed(y));
    edge.setAttribute("r", fixed(r));
  }
  if (isGroup) {
    circle.style.fill = "none";
    circle.style.stroke = ringed ? "var(--ink)" : "var(--ink-2)";
    circle.style.strokeWidth = ringed ? "2px" : "1px";
    circle.setAttribute("stroke-dasharray", "2 1.5");
  } else {
    circle.style.fill = "var(--muted)";
    circle.style.stroke = "var(--ink)";
    // The company whose panel is open, or a player of the current item, gets a thicker ink
    // outline.
    circle.style.strokeWidth = ringed ? "2px" : "1px";
    circle.removeAttribute("stroke-dasharray");
  }

  // Which labels show depends on the size of the circle on screen.
  const onScreen = r * zoom;
  const showLogo = !isGroup && onScreen >= 6.5;
  const showName = onScreen >= 3.4;
  const showValue = onScreen >= 7;

  // Font sizes are chosen for the screen and then divided by the zoom, so the text stays the same
  // size on screen however far the camera moves.
  const nameSize = clamp(1.8, r * 0.15 * zoom, 3.8) / zoom;
  const valueSize = clamp(1.5, r * 0.1 * zoom, 2.6) / zoom;
  const logoSize = clamp(2.2, r * 0.22 * zoom, 5) / zoom;
  const gap = 0.5 / zoom;

  // Where the logo, the name and the value sit for a name of one, two or no lines: the stack is
  // centred on the middle of the bubble.
  const centres = (nameLines: number) => {
    const stack =
      (showLogo ? logoSize + gap : 0) +
      nameSize * nameLines +
      (showValue ? gap + valueSize : 0);
    let cursor = y - stack / 2;
    let logoCenter = 0;
    let nameCenter = 0;
    let valueCenter = 0;
    if (showLogo) {
      logoCenter = cursor + logoSize / 2;
      cursor += logoSize + gap;
    }
    if (nameLines > 0) {
      nameCenter = cursor + (nameSize * nameLines) / 2;
      cursor += nameSize * nameLines;
    }
    if (showValue) {
      valueCenter = cursor + gap + valueSize / 2;
    }
    return { logoCenter, nameCenter, valueCenter };
  };
  // The room across the bubble at a line's height: the chord of the circle through the line's
  // furthest edge, so text that fits here stays inside the bubble.
  const roomAt = (centre: number, half: number): number => {
    const far = Math.max(Math.abs(centre - half - y), Math.abs(centre + half - y));
    return 2 * Math.sqrt(Math.max(0, r * r - far * far));
  };
  const fits = (text: string, centre: number): boolean =>
    (nameWidth(name, text) * nameSize) / 100 <= roomAt(centre, nameSize / 2) * 0.98;

  // A name wider than its bubble goes on two lines when both fit; otherwise it is hidden, as the
  // smallest bubbles already were. The full name stays in the group's aria-label and the panel.
  const lineHeight = nameSize * 1.05;
  let nameLines: string[] = [];
  if (showName) {
    const one = centres(1);
    if (fits(bubble.name, one.nameCenter)) {
      nameLines = [bubble.name];
    } else {
      const words = bubble.name.split(" ");
      const two = centres(2);
      const lineCentres = [two.nameCenter - lineHeight / 2, two.nameCenter + lineHeight / 2];
      let bestWidth = Infinity;
      for (let at = 1; at < words.length; at += 1) {
        const lines = [words.slice(0, at).join(" "), words.slice(at).join(" ")];
        if (!lines.every((line, index) => fits(line, lineCentres[index]))) continue;
        const width = Math.max(...lines.map((line) => (nameWidth(name, line) * nameSize) / 100));
        if (width < bestWidth) {
          bestWidth = width;
          nameLines = lines;
        }
      }
    }
  }
  name.style.display = nameLines.length > 0 ? "" : "none";

  logo.style.display = showLogo ? "" : "none";
  value.style.display = showValue ? "" : "none";
  const { logoCenter, nameCenter, valueCenter } = centres(nameLines.length);

  if (showLogo && bubble.ticker) {
    logo.style.display = "";
    logoText.textContent = bubble.ticker;
    logoText.style.fontSize = `${fixed(logoSize * 0.5)}px`;
    logoRect.setAttribute("y", fixed(logoCenter - logoSize / 2));
    const tickerWidth = logoText.getComputedTextLength();
    // The box takes the ticker's width, and never passes the bubble's edge: it is capped at the
    // chord across its own height.
    const boxWidth = Math.min(
      Math.max(logoSize, tickerWidth + logoSize * 0.2),
      roomAt(logoCenter, logoSize / 2) * 0.98,
    );
    logoRect.setAttribute("x", fixed(x - boxWidth / 2));
    logoRect.setAttribute("width", fixed(boxWidth));
    logoRect.setAttribute("height", fixed(logoSize));
    logoRect.setAttribute("rx", fixed(logoSize * 0.25));
    logoText.setAttribute("x", fixed(x));
    logoText.setAttribute("y", fixed(logoCenter));
  }
  if (nameLines.length > 0) {
    name.style.fontSize = `${fixed(nameSize)}px`;
    if (nameLines.length === 1) {
      name.setAttribute("x", fixed(x));
      name.setAttribute("y", fixed(nameCenter));
      name.textContent = nameLines[0];
    } else {
      // Two lines in the same text element, so the rule that hides a name stays one rule.
      name.textContent = "";
      for (const [index, line] of nameLines.entries()) {
        const tspan = el<SVGTSpanElement>("tspan");
        tspan.setAttribute("x", fixed(x));
        tspan.setAttribute("y", fixed(index === 0 ? nameCenter - lineHeight / 2 : nameCenter + lineHeight / 2));
        tspan.textContent = line;
        name.appendChild(tspan);
      }
    }
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
  // The lines are decoration under the bubbles' controls; a click passes through to them.
  group.style.pointerEvents = "none";
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
// small arrowhead when both ends are players of the chosen item. With a company panel open,
// every line that touches that company is drawn that way instead.
function styleArrow(live: LiveArrow): void {
  const strong = live.strong;
  const colour = `var(--${kindColour(live.arrow.kind)})`;
  live.node.shaft.style.stroke = strong ? colour : "var(--ink-2)";
  live.node.shaft.style.strokeWidth = strong ? "1.75px" : "1px";
  live.node.head.style.stroke = strong ? colour : "var(--ink-2)";
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
  drawing.realRing.setAttribute("r", fixed(drawing.ringRadius));
  drawing.realRing.setAttribute("cy", fixed(FRAME.cy));
  for (const live of drawing.bubbles.values()) paintBubble(live, drawing);
  paintArrows(drawing);
}

// One frame of the glide: ease every bubble to its new place, then redraw the lines.
function step(drawing: Drawing, now: number): void {
  const t = Math.min(1, Math.max(0, (now - drawing.startedAt) / GLIDE_MS));
  const e = ease(t);
  drawing.ringRadius = drawing.fromRingRadius + (drawing.toRingRadius - drawing.fromRingRadius) * e;
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
  drawing.ringRadius = drawing.toRingRadius;
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
    const strong =
      drawing.focus !== null
        ? arrow.from === drawing.focus || arrow.to === drawing.focus
        : drawing.dim && drawing.players.has(arrow.from) && drawing.players.has(arrow.to);
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
  // The company whose panel is open: it keeps a ring, its own money lines stay strong and the
  // companies it has no deal with fade back.
  focus?: string;
  // The reader's own zoom on top of the automatic fit.
  manual?: number;
  // The reader's drag of the picture, in the bubble's own units: where the camera looks, moved
  // by it and clamped so the content stays inside the round frame.
  pan?: Pan;
  burstDate?: string;
  peak?: PeakDay;
  changeFromPeak?: string;
  immediate?: boolean;
};

// The zoom control's 1x is the whole view, even when the peak fit has already scaled the scene.
export function showZoomEdge(afterBurst: boolean, manualZoom: number): boolean {
  return afterBurst && manualZoom > 1;
}

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
  // A company asked for but not on screen that day has no panel to show.
  const focus =
    options.focus !== undefined && bubbles.some((bubble) => bubble.id === options.focus)
      ? options.focus
      : null;
  const manual = options.manual ?? 1;
  const peakBubbles = options.peak ? bubblesForDate(options.peak.date) : undefined;
  const view = dayView(bubbles, options.players ?? [], manual, date, options.burstDate, peakBubbles);
  // Where the camera looks once the reader's drag is applied; clamped so the content stays
  // inside the round frame.
  const noPan = { dx: 0, dy: 0 };
  const shown = panView(view, clampPan(view, options.pan ?? noPan));

  const { bubbleLayer, arrowLayer, scene, rings, edge } = ensureScene(svg);
  const transition = options.immediate ? "none" : cameraTransition();
  scene.style.transition = transition;
  scene.style.transform = sceneTransform(shown);

  const afterBurst = options.burstDate !== undefined && date >= options.burstDate;
  edge.style.display = showZoomEdge(afterBurst, manual) ? "" : "none";
  if (afterBurst) {
    // The rings are already drawn in whole-bubble coordinates. Undo that baseline before
    // applying the camera, so 1x keeps the old geometry even when the peak fit isn't 1.
    const base = manual === 1 ? view : dayView(bubbles, [], 1, date, options.burstDate, peakBubbles);
    const whole = panView(base, clampPan(base, noPan));
    const z = shown.z / whole.z;
    const tx = FRAME.cx * (1 - z) + (whole.cx - shown.cx) * shown.z;
    const ty = FRAME.cy * (1 - z) + (whole.cy - shown.cy) * shown.z;
    rings.style.transition = transition;
    rings.style.transform = `translate(${fixed(tx)}px, ${fixed(ty)}px) scale(${fixed(z)})`;
    paintRingCamera(rings, transition !== "none");
  } else if (rings.style.transform) {
    rings.style.transition = "none";
    rings.style.removeProperty("transform");
    paintRingCamera(rings, false);
  }

  const existing = drawings.get(svg);
  if (options.immediate && existing?.day === date && existing.focus === focus
    && existing.players.size === players.size && [...players].every((id) => existing.players.has(id))) {
    existing.zoom = view.z;
    paintAll(existing);
    return;
  }

  const ring = svg.querySelector<SVGCircleElement>("circle.bubble-frame")!;
  ring.classList.toggle("burst", afterBurst);
  if (afterBurst) ring.setAttribute("stroke-dasharray", "0 4.5");
  else ring.removeAttribute("stroke-dasharray");
  const realRing = svg.querySelector<SVGCircleElement>("circle.bubble-real-ring")!;
  realRing.style.display = afterBurst && options.peak ? "" : "none";
  const radius = options.peak
    ? FRAME.radius * ringRatio(totalForDate(date), options.peak.total)
    : FRAME.radius;
  const drop = svg.querySelector<SVGTextElement>(".bubble-drop")!;
  const showDrop = afterBurst && options.changeFromPeak !== undefined;
  drop.classList.toggle("burst", showDrop);
  drop.querySelector("textPath")!.textContent = showDrop ? `${options.changeFromPeak} from peak` : "";
  let drawing = existing;
  if (!drawing) {
    drawing = {
      bubbles: new Map(),
      arrows: new Map(),
      realRing,
      ringRadius: FRAME.radius,
      fromRingRadius: FRAME.radius,
      toRingRadius: radius,
      zoom: view.z,
      pixelsPerUnit: 1,
      day: date,
      players,
      focus,
      dim: players.size > 0,
      startedAt: 0,
      raf: null,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
    drawings.set(svg, drawing);
    liveDrawings.add(drawing);
    const live = drawing;
    const resize = (): void => {
      const width = svg.getBoundingClientRect().width;
      if (width === 0) return;
      live.pixelsPerUnit = width / 100;
      drop.style.fontSize = `calc(var(--bubble-caption-size) / ${live.pixelsPerUnit} / var(--burst-zoom, 1))`;
      paintAll(live);
    };
    resize();
    new ResizeObserver(resize).observe(svg);
  }
  drawing.day = date;
  drawing.fromRingRadius = drawing.ringRadius;
  drawing.toRingRadius = afterBurst ? radius : FRAME.radius;
  drawing.zoom = view.z;
  drawing.players = players;
  drawing.focus = focus;
  drawing.dim = players.size > 0;
  drawing.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  updateBubbles(drawing, bubbleLayer, bubbles);
  updateArrows(drawing, arrowLayer, arrows);
  glide(drawing);

}

// Transparent targets can overlap; use the nearest visible company centre, not SVG paint order.
export function bubbleAtPoint(svg: SVGSVGElement, x: number, y: number): string | null {
  const drawing = drawings.get(svg);
  const scene = svg.querySelector<SVGGElement>(".scene");
  const matrix = scene?.getScreenCTM();
  const frame = svg.getScreenCTM();
  if (!drawing || !matrix || !frame) return null;
  const centre = new DOMPoint(FRAME.cx, FRAME.cy).matrixTransform(frame);
  if (Math.hypot(x - centre.x, y - centre.y) > FRAME.radius * frame.a) return null;
  let nearest: string | null = null;
  let closest = Infinity;
  for (const [id, live] of drawing.bubbles) {
    if (live.leaving) continue;
    const point = new DOMPoint(live.x, live.y).matrixTransform(matrix);
    const distance = Math.hypot(x - point.x, y - point.y);
    if (distance <= Math.max(HIT_RADIUS, live.r * matrix.a) && distance < closest) {
      nearest = id;
      closest = distance;
    }
  }
  return nearest;
}
