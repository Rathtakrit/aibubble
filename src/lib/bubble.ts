// Draws one day of the bubble into an SVG. The layout itself is pure and lives in layout.ts.

import { arrowsForDate, bubblesForDate, formatDate, formatValue, FRAME } from "./layout.ts";
import type { Arrow, Bubble } from "./layout.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
const CLIP_ID = "aibubble-clip";

function el<T extends SVGElement>(name: string): T {
  return document.createElementNS(SVG_NS, name) as T;
}

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function fixed(value: number): string {
  return value.toFixed(3);
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
  shaft: SVGLineElement;
  head: SVGPathElement;
};

const bubbleNodes = new WeakMap<SVGSVGElement, Map<string, BubbleNode>>();
const arrowNodes = new WeakMap<SVGSVGElement, Map<string, ArrowNode>>();

// The clip, the scene group the camera will transform, and the frame ring on top.
function ensureScene(svg: SVGSVGElement): { bubbleLayer: SVGGElement; arrowLayer: SVGGElement } {
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

  let scene = svg.querySelector("g.scene");
  if (!scene) {
    scene = el("g");
    scene.setAttribute("class", "scene");
    clipGroup.appendChild(scene);
  }

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

function updateBubbleNode(node: BubbleNode, bubble: Bubble): void {
  const { circle, logo, logoRect, logoText, name, value } = node;
  const isGroup = bubble.kind === "group";

  circle.setAttribute("cx", fixed(bubble.x));
  circle.setAttribute("cy", fixed(bubble.y));
  circle.setAttribute("r", fixed(bubble.r));
  if (isGroup) {
    circle.style.fill = "none";
    circle.style.stroke = "var(--ink-2)";
    circle.setAttribute("stroke-dasharray", "2 1.5");
  } else {
    circle.style.fill = "var(--muted)";
    circle.style.stroke = "var(--ink)";
    circle.removeAttribute("stroke-dasharray");
  }
  node.group.style.opacity = "1";

  const showLogo = !isGroup && bubble.r >= 6.5;
  const showName = bubble.r >= 3.4;
  const showValue = bubble.r >= 7;
  logo.style.display = showLogo ? "" : "none";
  name.style.display = showName ? "" : "none";
  value.style.display = showValue ? "" : "none";

  const nameSize = clamp(1.8, bubble.r * 0.15, 3.8);
  const valueSize = clamp(1.5, bubble.r * 0.1, 2.6);
  const logoSize = clamp(2.2, bubble.r * 0.22, 5);
  const gap = 0.5;

  const stack =
    (showLogo ? logoSize + gap : 0) + (showName ? nameSize : 0) + (showValue ? gap + valueSize : 0);
  let cursor = bubble.y - stack / 2;
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
    logoRect.setAttribute("x", fixed(bubble.x - logoSize / 2));
    logoRect.setAttribute("y", fixed(logoCenter - logoSize / 2));
    logoRect.setAttribute("width", fixed(logoSize));
    logoRect.setAttribute("height", fixed(logoSize));
    logoRect.setAttribute("rx", fixed(logoSize * 0.25));
    logoText.setAttribute("x", fixed(bubble.x));
    logoText.setAttribute("y", fixed(logoCenter));
    logoText.style.fontSize = `${fixed(logoSize * 0.5)}px`;
    logoText.textContent = bubble.name.charAt(0);
  }
  if (showName) {
    name.setAttribute("x", fixed(bubble.x));
    name.setAttribute("y", fixed(nameCenter));
    name.style.fontSize = `${fixed(nameSize)}px`;
    name.textContent = bubble.name;
  }
  if (showValue) {
    value.setAttribute("x", fixed(bubble.x));
    value.setAttribute("y", fixed(valueCenter));
    value.style.fontSize = `${fixed(valueSize)}px`;
    value.textContent = formatValue(bubble.value);
  }
}

function updateBubbles(svg: SVGSVGElement, layer: SVGGElement, bubbles: Bubble[]): void {
  let nodes = bubbleNodes.get(svg);
  if (!nodes) {
    nodes = new Map();
    bubbleNodes.set(svg, nodes);
  }

  const seen = new Set<string>();
  for (const bubble of bubbles) {
    seen.add(bubble.id);
    let node = nodes.get(bubble.id);
    if (!node) {
      node = createBubbleNode(bubble);
      nodes.set(bubble.id, node);
      layer.appendChild(node.group);
      node.group.style.opacity = "0";
      void node.group.getBoundingClientRect();
    }
    updateBubbleNode(node, bubble);
  }

  for (const [id, node] of nodes) {
    if (!seen.has(id)) {
      node.group.style.opacity = "0";
      node.group.remove();
      nodes.delete(id);
    }
  }
}

function createArrowNode(arrow: Arrow): ArrowNode {
  const group = el<SVGGElement>("g");
  group.setAttribute("class", "bubble-arrow");
  const shaft = el<SVGLineElement>("line");
  const head = el<SVGPathElement>("path");
  for (const part of [shaft, head]) {
    part.style.stroke = `var(--${arrow.kind})`;
    part.style.strokeWidth = "1.75px";
    part.style.fill = "none";
    part.setAttribute("vector-effect", "non-scaling-stroke");
  }
  group.appendChild(shaft);
  group.appendChild(head);
  return { group, shaft, head };
}

function updateArrowNode(node: ArrowNode, arrow: Arrow): void {
  node.shaft.setAttribute("x1", fixed(arrow.x1));
  node.shaft.setAttribute("y1", fixed(arrow.y1));
  node.shaft.setAttribute("x2", fixed(arrow.x2));
  node.shaft.setAttribute("y2", fixed(arrow.y2));

  const dx = arrow.x2 - arrow.x1;
  const dy = arrow.y2 - arrow.y1;
  const distance = Math.hypot(dx, dy) || 1;
  const ux = dx / distance;
  const uy = dy / distance;
  const px = -uy;
  const py = ux;
  const length = 1.4;
  const half = 0.8;
  node.head.setAttribute(
    "d",
    `M ${fixed(arrow.x2 - ux * length + px * half)} ${fixed(arrow.y2 - uy * length + py * half)} ` +
      `L ${fixed(arrow.x2)} ${fixed(arrow.y2)} ` +
      `L ${fixed(arrow.x2 - ux * length - px * half)} ${fixed(arrow.y2 - uy * length - py * half)}`,
  );
  node.group.style.opacity = "1";
}

function updateArrows(svg: SVGSVGElement, layer: SVGGElement, arrows: Arrow[]): void {
  let nodes = arrowNodes.get(svg);
  if (!nodes) {
    nodes = new Map();
    arrowNodes.set(svg, nodes);
  }

  const seen = new Set<string>();
  for (const arrow of arrows) {
    const key = `${arrow.from}|${arrow.to}|${arrow.kind}`;
    seen.add(key);
    let node = nodes.get(key);
    if (!node) {
      node = createArrowNode(arrow);
      nodes.set(key, node);
      layer.appendChild(node.group);
      node.group.style.opacity = "0";
      void node.group.getBoundingClientRect();
    }
    updateArrowNode(node, arrow);
  }

  for (const [key, node] of nodes) {
    if (!seen.has(key)) {
      node.group.style.opacity = "0";
      node.group.remove();
      nodes.delete(key);
    }
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

export function renderBubble(svg: SVGSVGElement, date: string): void {
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("role", "img");
  const bubbles = bubblesForDate(date);
  svg.setAttribute("aria-label", ariaLabel(date, bubbles));
  const { bubbleLayer, arrowLayer } = ensureScene(svg);
  updateBubbles(svg, bubbleLayer, bubbles);
  updateArrows(svg, arrowLayer, arrowsForDate(date));
}
