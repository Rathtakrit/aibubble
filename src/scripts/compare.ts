import { datasets, changeLine, comparisonLine, formatTotal, labelsOverlap, moments, momentOptions, packedOn, percentDifference, totalOn } from "../lib/compare.ts";
import type { CompareDataset, LabelBox, Moment } from "../lib/compare.ts";
import { publisherName } from "../lib/timeline.ts";

type Side = { dataset: CompareDataset; moment: Moment; date: string; players: Set<string> | null };
type Frame = {
  selected: CompareDataset;
  values: ReturnType<typeof totalOn>["values"];
  total: number;
  baseline: ReturnType<typeof totalOn>;
  start: string;
  circles: ReturnType<typeof packedOn>;
  change: number | null;
};
const root = document.querySelector<HTMLElement>(".compare-page");
if (root) {
  const names = { ai: "AI", dotcom: "Dot-com", housing: "Housing" };
  const labels = { start: "Start", lowest: "Lowest recorded", peak: "Peak recorded", latest: "Latest" };
  const sides: Side[] = [
    { dataset: datasets[0], moment: "lowest", date: moments(datasets[0]).lowest!, players: null },
    { dataset: datasets[1], moment: "peak", date: moments(datasets[1]).peak!, players: null },
  ];
  const phone = window.matchMedia("(max-width: 899px)");
  const pickers = Array.from(root.querySelectorAll<HTMLDetailsElement>(".picker"));
  const syncPickers = () => {
    for (const picker of pickers) picker.open = !phone.matches;
  };
  for (const picker of pickers) {
    picker.addEventListener("toggle", () => {
      if (!phone.matches || !picker.open) return;
      for (const other of pickers) if (other !== picker) other.open = false;
    });
  }
  phone.addEventListener("change", syncPickers);
  syncPickers();
  let measure = "size";
  let playerSide = "0";
  const syncPlayers = () => {
    for (const panel of root.querySelectorAll<HTMLElement>("[data-player-panel]")) panel.hidden = phone.matches && panel.dataset.playerPanel !== playerSide;
    for (const button of root.querySelectorAll<HTMLButtonElement>("[data-player-side]")) button.setAttribute("aria-pressed", String(button.dataset.playerSide === playerSide));
  };
  let sourceSide = "0";
  let sourcePeriod = "chosen";
  let sourcePage = 0;
  const syncSources = () => {
    for (const section of root.querySelectorAll<HTMLElement>("[data-source-panel]")) section.hidden = phone.matches && section.dataset.sourcePanel !== sourceSide;
    for (const line of root.querySelectorAll<HTMLElement>("[data-source-missing]")) line.hidden = phone.matches && line.dataset.sourceMissing !== sourceSide;
    for (const button of root.querySelectorAll<HTMLButtonElement>("[data-source-side]")) button.setAttribute("aria-pressed", String(button.dataset.sourceSide === sourceSide));
    for (const button of root.querySelectorAll<HTMLButtonElement>("[data-source-period]")) button.setAttribute("aria-pressed", String(button.dataset.sourcePeriod === sourcePeriod));
    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-source-panel]"));
    const active = panels.find((panel) => panel.dataset.sourcePanel === sourceSide);
    const pageCount = Math.max(1, Math.ceil((active?.querySelectorAll(".source").length ?? 0) / 16));
    sourcePage = Math.min(sourcePage, pageCount - 1);
    for (const panel of panels) {
      for (const [index, link] of Array.from(panel.querySelectorAll<HTMLElement>(".source")).entries()) link.hidden = phone.matches && Math.floor(index / 16) !== sourcePage;
    }
    query("[data-source-pagination]").toggleAttribute("hidden", !phone.matches || pageCount === 1);
    query("[data-source-page-label]").textContent = `${sourcePage + 1} / ${pageCount}`;
    query<HTMLButtonElement>('[data-source-page="previous"]').disabled = sourcePage === 0;
    query<HTMLButtonElement>('[data-source-page="next"]').disabled = sourcePage === pageCount - 1;
  };
  let animation = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const svgNS = "http://www.w3.org/2000/svg";
  const query = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const dayLabel = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
  const signed = (value: number | null) => value === null ? "Not defined (Start is zero)" : `${value >= 0 ? "+" : "−"}${Math.round(Math.abs(value))}%`;
  const selectedDataset = (side: Side): CompareDataset => ({ ...side.dataset, companies: side.dataset.companies.filter((company) => !side.players || side.players.has(company.id)) });
  const dialog = (name: string) => query<HTMLDialogElement>(`[data-dialog="${name}"]`);
  const addText = (parent: Element, tag: string, text: string) => {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.append(element);
    return element;
  };

  // One frame per side index, kept until that side's dataset, date or ticked set changes, so
  // ticking a company repacks one drawing, not both.
  const frameSlots: { key: string; frame: Frame }[] = [];
  const frameKey = (side: Side) => `${side.dataset.id}|${side.date}|${side.players ? [...side.players].sort().join(",") : "*"}`;
  const frameFor = (side: Side, index: number): Frame => {
    const key = frameKey(side);
    const slot = frameSlots[index];
    if (slot && slot.key === key) return slot.frame;
    const selected = selectedDataset(side);
    const snapshot = totalOn(selected, side.date);
    const start = moments(side.dataset).start!;
    const baseline = totalOn(selected, start);
    const frame: Frame = { ...snapshot, selected, baseline, start, circles: packedOn(selected, side.date), change: percentDifference(snapshot.total, baseline.total) };
    frameSlots[index] = { key, frame };
    return frame;
  };

  // The checkbox lists are kept in place while their companies stay the same, so a tick keeps
  // keyboard focus on its own checkbox.
  const playerPanels: HTMLFieldSetElement[] = [];
  const playerPanelKeys: string[] = [];
  const syncPlayerPanels = () => {
    const groups = query("[data-player-groups]");
    sides.forEach((side, index) => {
      const entries = totalOn(side.dataset, side.date).values;
      const key = `${side.dataset.id}|${side.date}|${entries.map((entry) => entry.company.id).join(",")}`;
      if (!playerPanels[index] || playerPanelKeys[index] !== key) {
        const fieldset = document.createElement("fieldset");
        fieldset.dataset.playerPanel = String(index);
        const legend = addText(fieldset, "legend", `${index === 0 ? "A" : "B"} · ${names[side.dataset.id]} · ${dayLabel(side.date)}`);
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.dataset.playerToggle = String(index);
        legend.append(toggle);
        const grid = document.createElement("div");
        grid.className = "player-grid";
        for (const entry of entries) {
          const label = document.createElement("label");
          const input = document.createElement("input");
          input.type = "checkbox";
          input.dataset.player = entry.company.id;
          input.dataset.side = String(index);
          label.append(input);
          addText(label, "span", entry.company.name);
          addText(label, "span", formatTotal(entry.value)).className = "amount";
          grid.append(label);
        }
        fieldset.append(grid);
        const previous = playerPanels[index];
        playerPanels[index] = fieldset;
        playerPanelKeys[index] = key;
        if (previous) previous.replaceWith(fieldset);
        else groups.append(fieldset);
      }
      const fieldset = playerPanels[index];
      for (const input of fieldset.querySelectorAll<HTMLInputElement>("input[data-player]")) {
        input.checked = !side.players || side.players.has(input.dataset.player!);
      }
      const toggle = fieldset.querySelector<HTMLButtonElement>("[data-player-toggle]")!;
      const anySelected = totalOn(selectedDataset(side), side.date).values.length > 0;
      toggle.textContent = anySelected ? "Clear" : "All";
      toggle.setAttribute("aria-label", `${anySelected ? "Clear" : "Select all"} companies for ${index === 0 ? "A" : "B"}`);
      if (groups.children[index] !== fieldset) groups.insertBefore(fieldset, groups.children[index] ?? null);
    });
    syncPlayers();
    const inputs = Array.from(groups.querySelectorAll<HTMLInputElement>("input[data-player]"));
    const available = inputs.length;
    const checked = inputs.filter((input) => input.checked).length;
    query('[data-open="players"]').textContent = phone.matches ? `Players ${checked}/${available}` : `Players: ${checked} of ${available}`;
  };

  // A source panel is rebuilt only when its side's frame or Start/Chosen choice changes.
  const sourcePanels: HTMLElement[] = [];
  const sourceFrames: (Frame | null)[] = [];
  const sourceBaselines: (boolean | null)[] = [];
  const syncSourcePanels = (frames: Frame[]) => {
    const sources = query("[data-sources]");
    frames.forEach((frame, index) => {
      const baseline = sourcePeriod === "start";
      if (sourcePanels[index] && sourceFrames[index] === frame && sourceBaselines[index] === baseline) return;
      const section = document.createElement("section");
      section.dataset.sourcePanel = String(index);
      addText(section, "h3", `${index === 0 ? "A" : "B"} · ${names[sides[index].dataset.id]} · ${dayLabel(baseline ? frame.start : sides[index].date)}`);
      const grid = document.createElement("div");
      grid.className = "source-grid";
      for (const entry of baseline ? frame.baseline.values : frame.values) {
        const link = document.createElement("a");
        link.className = "source";
        link.href = entry.point.source;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = `${entry.company.name} · ${formatTotal(entry.value).replace("$", "")} · ${publisherName(entry.point.source)}, ${dayLabel(entry.point.date)} ↗`;
        grid.append(link);
      }
      if (!grid.childElementCount) addText(grid, "p", "No recorded values selected.");
      section.append(grid);
      const previous = sourcePanels[index];
      sourcePanels[index] = section;
      sourceFrames[index] = frame;
      sourceBaselines[index] = baseline;
      if (previous) previous.replaceWith(section);
      else sources.append(section);
      if (sources.children[index] !== section) sources.insertBefore(section, sources.children[index] ?? null);
    });
  };

  function render(animate = true) {
    cancelAnimationFrame(animation);
    const frames = sides.map((side, index) => frameFor(side, index));
    query("[data-size]").toggleAttribute("hidden", measure !== "size");
    query("[data-size-legend]").toggleAttribute("hidden", measure !== "size");
    query("[data-change]").toggleAttribute("hidden", measure !== "change");
    for (const button of root!.querySelectorAll<HTMLButtonElement>("[data-measure]")) button.setAttribute("aria-pressed", String(button.dataset.measure === measure));
    query("[data-result]").textContent = measure === "change"
      ? changeLine(frames[0], frames[1])
      : comparisonLine(frames[0].total, frames[1].total);

    // Animate the currently displayed geometry, including interrupted transitions.
    const tweens: { element: Element; attribute: string; from: number; to: number }[] = [];
    const tween = (element: Element, attribute: string, to: number, initial = to) => {
      const from = element.hasAttribute(attribute) ? Number(element.getAttribute(attribute)) : initial;
      tweens.push({ element, attribute, from, to });
    };
    const maximum = Math.max(...frames.map((f) => f.total), 1);
    const changeMaximum = Math.max(...frames.map((f) => Math.abs(f.change ?? 0)), 1);
    // SVG units shrink with the viewport; keep labels and minimum bars in screen pixels.
    const drawingWidth = query<HTMLElement>(".drawing").getBoundingClientRect().width || 620;
    const unitsPerPixel = 620 / drawingWidth;
    const fontSize = Math.max(13, 12 * unitsPerPixel);
    const nameLabels: { label: SVGTextElement; circle: SVGCircleElement; width: number }[] = [];
    const textContext = document.createElement("canvas").getContext("2d")!;
    textContext.font = `${fontSize}px ${getComputedStyle(query(".drawing")).fontFamily}`;
    sides.forEach((side, index) => {
      const panel = query<HTMLElement>(`[data-side="${index}"]`);
      const frame = frames[index];
      for (const button of panel.querySelectorAll<HTMLButtonElement>("[data-bubble]")) button.setAttribute("aria-pressed", String(button.dataset.bubble === side.dataset.id));
      const options = momentOptions(side.dataset.id);
      const pillRow = panel.querySelector(".moment-pills")!;
      const existing = Array.from(pillRow.querySelectorAll<HTMLButtonElement>("[data-moment]"));
      if (existing.map((button) => button.dataset.moment).join() !== options.map((option) => option.id).join()) {
        pillRow.replaceChildren();
        for (const option of options) {
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.moment = option.id;
          pillRow.append(button);
        }
      }
      for (const button of pillRow.querySelectorAll<HTMLButtonElement>("[data-moment]")) {
        button.setAttribute("aria-pressed", String(button.dataset.moment === side.moment));
        button.textContent = options.find((option) => option.id === button.dataset.moment)!.label;
      }
      const momentLabel = side.dataset.id === "ai" && (side.moment === "latest" || side.moment === "peak") ? "Current" : labels[side.moment];
      panel.querySelector("[data-tile]")!.textContent = `${names[side.dataset.id]} · ${phone.matches ? momentLabel.toLowerCase().replace(" recorded", "") : momentLabel.toLowerCase()}`;
      panel.querySelector("[data-total]")!.textContent = formatTotal(frame.total);
      panel.querySelector("[data-caption]")!.textContent = frame.values.length === 1
        ? `${frame.values[0].company.name} · ${phone.matches ? "" : "on "}${dayLabel(side.date)} · 1 company`
        : `${phone.matches ? "" : "on "}${dayLabel(side.date)} · ${frame.values.length} ${phone.matches ? "cos" : "companies"}`;
      const group = query<SVGGElement>(`[data-size] [data-exposure="${index}"]`);
      const r = 225 * Math.sqrt(frame.total / maximum);
      const shapes = [
        { key: `${index}-frame`, x: 300, y: 485-r, r, title: `${names[side.dataset.id]}: ${formatTotal(frame.total)}` },
        ...frame.circles.map((circle) => ({ key: `${index}-${circle.company.id}`, x: 300+(circle.x-50)*r/48, y: 485-r+(circle.y-50)*r/48, r: circle.r*r/48, title: `${circle.company.name}: ${formatTotal(circle.value)} (${dayLabel(circle.point.date)})` })),
      ];
      for (const label of group.querySelectorAll("[data-company-label]")) label.remove();
      const active = new Set(shapes.map((shape) => shape.key));
      for (const circle of group.querySelectorAll<SVGCircleElement>("[data-shape]")) {
        if (!active.has(circle.dataset.shape!)) {
          tween(circle, "r", 0);
          circle.setAttribute("data-exiting", "");
        }
      }
      for (const shape of shapes) {
        let circle = Array.from(group.querySelectorAll<SVGCircleElement>("[data-shape]")).find((c) => c.dataset.shape === shape.key);
        if (!circle) {
          circle = document.createElementNS(svgNS, "circle");
          circle.dataset.shape = shape.key;
          circle.setAttribute("class", shape.key.endsWith("-frame") ? "outline" : "company");
          group.insertBefore(circle, group.querySelector("text"));
        }
        circle.removeAttribute("data-exiting");
        circle.replaceChildren();
        const title = document.createElementNS(svgNS, "title");
        title.textContent = shape.title;
        circle.append(title);
        tween(circle, "cx", shape.x);
        tween(circle, "cy", shape.y);
        tween(circle, "r", shape.r, 0);
      }
      for (const entry of frame.circles) {
        const circle = Array.from(group.querySelectorAll<SVGCircleElement>("[data-shape]")).find((c) => c.dataset.shape === `${index}-${entry.company.id}`)!;
        const name = document.createElementNS(svgNS, "text");
        name.setAttribute("data-company-label", "");
        name.setAttribute("text-anchor", "middle");
        name.setAttribute("dominant-baseline", "middle");
        name.style.fontSize = `${fontSize}px`;
        name.textContent = entry.company.name;
        group.append(name);
        nameLabels.push({ label: name, circle, width: textContext.measureText(entry.company.name).width });
      }
      query(`[data-drawing-label="${index}"]`).textContent = `${index === 0 ? "A" : "B"} · ${names[side.dataset.id]}, ${momentLabel.toLowerCase()}`;
      const barLabel = query<SVGTextElement>(`[data-bar-label="${index}"]`);
      const barText = `${index === 0 ? "A" : "B"} · ${names[side.dataset.id]}: ${signed(frame.change)}`;
      const lines: string[] = [];
      for (const word of barText.split(" ")) {
        const last = lines.length - 1;
        if (last < 0 || textContext.measureText(`${lines[last]} ${word}`).width > 240) lines.push(word);
        else lines[last] += ` ${word}`;
      }
      barLabel.replaceChildren();
      for (const [lineIndex, line] of lines.entries()) {
        const span = document.createElementNS(svgNS, "tspan");
        span.textContent = line;
        span.setAttribute("dy", lineIndex === 0 ? String(-(lines.length - 1) * fontSize * .6) : String(fontSize * 1.2));
        barLabel.append(span);
      }
      barLabel.style.fontSize = `${fontSize}px`;
      const falling = (frame.change ?? 0) < 0;
      barLabel.setAttribute("text-anchor", falling ? "end" : "start");
      barLabel.setAttribute("y", String(184 + index * 140));
      barLabel.setAttribute("dominant-baseline", "middle");
      // Reserve room for the full label beyond either bar's end, on one shared scale.
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      context.font = `${fontSize}px ${getComputedStyle(barLabel).fontFamily}`;
      const labelWidth = Math.min(240, Math.max(...frames.map((f, i) => context.measureText(`${i === 0 ? "A" : "B"} · ${names[sides[i].dataset.id]}: ${signed(f.change)}`).width)));
      const reach = Math.max(3 * unitsPerPixel, 290 - labelWidth - 8 * unitsPerPixel);
      const width = frame.change === null || frame.change === 0 ? 0 : Math.max(3 * unitsPerPixel, Math.abs(frame.change) / changeMaximum * reach);
      const length = falling ? -width : width;
      const bar = query<SVGRectElement>(`[data-bar="${index}"]`);
      tween(bar, "x", 300 + Math.min(length, 0));
      tween(bar, "width", width, 0);
    });

    syncPlayerPanels();
    if (measure !== "change") sourcePeriod = "chosen";
    query("[data-source-period-control]").toggleAttribute("hidden", measure !== "change");
    syncSourcePanels(frames);
    syncSources();
    const missingValues = query("[data-missing]");
    missingValues.replaceChildren();
    sides.forEach((side, index) => {
      const known = new Set(totalOn(side.dataset, side.date).values.map((entry) => entry.company.id));
      const missing = side.dataset.companies.filter((company) => !known.has(company.id)).map((company) => company.name);
      const line = addText(missingValues, "p", `${index === 0 ? "A" : "B"}: ${missing.length ? `No value in the data on ${dayLabel(side.date)} for: ${missing.join(", ")}.` : "All companies have recorded values."}`);
      line.dataset.sourceMissing = String(index);
    });
    syncSources();
    query("[data-size]").setAttribute("aria-label", `A in blue: ${formatTotal(frames[0].total)}; B in orange: ${formatTotal(frames[1].total)}. Same area scale. ${comparisonLine(frames[0].total, frames[1].total)}`);
    // The first frame's own timestamp is the start, and progress never leaves 0..1: a frame
    // timestamp can be earlier than the call that started the animation.
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const raw = !animate || reducedMotion.matches ? 1 : (now - start) / 400;
      const progress = Math.max(0, Math.min(raw, 1));
      const eased = 1-Math.pow(1-progress, 3);
      for (const t of tweens) {
        const value = t.from+(t.to-t.from)*eased;
        // A radius or bar width can never be negative, even while an interrupted tween runs.
        const safe = t.attribute === "r" || t.attribute === "width" ? Math.max(0, value) : value;
        t.element.setAttribute(t.attribute, String(safe));
      }
      const placedNames: LabelBox[] = [];
      for (const { label, circle, width } of nameLabels) {
        const radius = Number(circle.getAttribute("r"));
        const x = Number(circle.getAttribute("cx"));
        const y = Number(circle.getAttribute("cy"));
        label.setAttribute("x", String(x));
        label.setAttribute("y", String(y));
        const box = { x: x - width / 2, y: y - fontSize / 2, width, height: fontSize };
        const fits = Math.hypot(width / 2, fontSize / 2) <= radius * .85;
        const visible = fits && !placedNames.some((placed) => labelsOverlap(box, placed, 4 * unitsPerPixel));
        label.style.visibility = visible ? "visible" : "hidden";
        if (visible) placedNames.push(box);
      }
      for (const index of [0, 1]) {
        const bar = query<SVGRectElement>(`[data-bar="${index}"]`);
        const label = query<SVGTextElement>(`[data-bar-label="${index}"]`);
        const falling = (frames[index].change ?? 0) < 0;
        const end = falling ? Number(bar.getAttribute("x")) : 300 + Number(bar.getAttribute("width"));
        const x = String(end + (falling ? -8 : 8) * unitsPerPixel);
        label.setAttribute("x", x);
        for (const span of label.querySelectorAll("tspan")) span.setAttribute("x", x);
      }
      if (progress < 1) animation = requestAnimationFrame(tick);
      else for (const element of root!.querySelectorAll("[data-exiting]")) element.remove();
    };
    tick(performance.now());
  }

  root.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.dataset.player) return;
    // Each side keeps its own ticked set, even when both sides show the same bubble.
    const side = sides[Number(input.dataset.side)];
    if (!side) return;
    if (!side.players) side.players = new Set(side.dataset.companies.map((company) => company.id));
    if (input.checked) side.players.add(input.dataset.player);
    else side.players.delete(input.dataset.player);
    render();
  });
  root.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!button) return;
    if (button.dataset.open) { dialog(button.dataset.open).showModal(); return; }
    if (button.dataset.playerToggle !== undefined) {
      const side = sides[Number(button.dataset.playerToggle)];
      side.players = totalOn(selectedDataset(side), side.date).values.length > 0 ? new Set() : null;
      render();
      query<HTMLButtonElement>(`[data-player-toggle="${button.dataset.playerToggle}"]`).focus();
      return;
    }
    if (button.dataset.playerSide !== undefined) {
      playerSide = button.dataset.playerSide;
      syncPlayers();
      return;
    }
    if (button.dataset.sourcePage) {
      sourcePage += button.dataset.sourcePage === "next" ? 1 : -1;
      syncSources();
      return;
    }
    if (button.dataset.sourceSide !== undefined) {
      sourcePage = 0;
      sourceSide = button.dataset.sourceSide;
      syncSources();
      return;
    }
    if (button.dataset.sourcePeriod) {
      sourcePeriod = button.dataset.sourcePeriod;
      render(false);
      return;
    }
    if (button.dataset.bubble || button.dataset.moment) {
      const panel = button.closest<HTMLElement>("[data-side]")!;
      const side = sides[Number(panel.dataset.side)];
      if (button.dataset.bubble) {
        side.dataset = datasets.find((dataset) => dataset.id === button.dataset.bubble)!;
        side.players = null;
      }
      if (button.dataset.moment) side.moment = button.dataset.moment as Side["moment"];
      if (side.dataset.id === "ai" && side.moment === "peak") side.moment = "latest";
      const dates = moments(side.dataset);
      side.date = dates[side.moment] ?? dates.start!;
    }
    else if (button.hasAttribute("data-swap")) sides.reverse();
    else if (button.dataset.measure) measure = button.dataset.measure;
    else if (button.dataset.quick) {
      const quick = button.dataset.quick;
      if (quick === "biggest") {
        for (const side of sides) {
          const top = totalOn(side.dataset, side.date).values.filter((entry) => entry.company.kind !== "group").sort((a,b) => b.value-a.value || a.company.id.localeCompare(b.company.id))[0];
          side.players = new Set(top ? [top.company.id] : []);
        }
      } else {
        sides[0] = { dataset: datasets[0], moment: quick === "then" ? "start" : quick === "peaks" ? "latest" : "lowest", date: "", players: null };
        sides[1] = { dataset: datasets[quick === "then" ? 0 : 1], moment: quick === "then" ? "latest" : "peak", date: "", players: null };
        for (const side of sides) side.date = moments(side.dataset)[side.moment as Moment]!;
      }
    } else return;
    render();
  });
  reducedMotion.addEventListener("change", () => render(false));
  window.addEventListener("resize", () => render(false));
  void document.fonts.ready.then(() => render(false));
  render(false);
}
