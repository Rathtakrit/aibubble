import { datasets, comparisonLine, formatTotal, moments, packedOn, percentDifference, totalOn } from "../lib/compare.ts";
import type { CompareDataset, Moment } from "../lib/compare.ts";

type Side = { dataset: CompareDataset; moment: Moment | "date"; date: string; players: Set<string> | null };
const root = document.querySelector<HTMLElement>(".compare-page");
if (root) {
  const names = { ai: "AI", dotcom: "Dot-com", housing: "Housing" };
  const labels = { start: "Start", lowest: "Lowest recorded", peak: "Peak recorded", latest: "Latest", date: "Pick a date" };
  const sides: Side[] = [
    { dataset: datasets[0], moment: "lowest", date: moments(datasets[0]).lowest!, players: null },
    { dataset: datasets[1], moment: "peak", date: moments(datasets[1]).peak!, players: null },
  ];
  const phone = window.matchMedia("(max-width: 899px)");
  const syncPickers = () => {
    for (const picker of root.querySelectorAll<HTMLDetailsElement>(".picker")) picker.open = !phone.matches;
  };
  phone.addEventListener("change", syncPickers);
  syncPickers();
  let measure = "size";
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

  function render(animate = true) {
    cancelAnimationFrame(animation);
    const frames = sides.map((side) => {
      const selected = selectedDataset(side);
      const snapshot = totalOn(selected, side.date);
      const start = moments(side.dataset).start!;
      const baseline = totalOn(selected, start);
      return { ...snapshot, selected, baseline, start, circles: packedOn(selected, side.date), change: percentDifference(snapshot.total, baseline.total) };
    });
    query("[data-size]").toggleAttribute("hidden", measure !== "size");
    query("[data-change]").toggleAttribute("hidden", measure !== "change");
    for (const button of root!.querySelectorAll<HTMLButtonElement>("[data-measure]")) button.setAttribute("aria-pressed", String(button.dataset.measure === measure));
    query("[data-result]").textContent = comparisonLine(frames[0].total, frames[1].total);

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
      panel.querySelector<HTMLSelectElement>("[data-bubble]")!.value = side.dataset.id;
      panel.querySelector<HTMLSelectElement>("[data-moment]")!.value = side.moment;
      const input = panel.querySelector<HTMLInputElement>("[data-date]")!;
      input.min = moments(side.dataset).start!;
      input.max = moments(side.dataset).latest!;
      input.value = side.date;
      panel.querySelector("[data-date-label]")!.toggleAttribute("hidden", side.moment !== "date");
      panel.querySelector("[data-tile]")!.textContent = `${names[side.dataset.id]} · ${side.moment === "date" ? dayLabel(side.date) : labels[side.moment].toLowerCase()}`;
      panel.querySelector("[data-total]")!.textContent = formatTotal(frame.total);
      panel.querySelector("[data-caption]")!.textContent = frame.values.length === 1
        ? `${frame.values[0].company.name} · on ${dayLabel(side.date)} · 1 company`
        : `on ${dayLabel(side.date)} · ${frame.values.length} companies`;
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
      const label = query<SVGTextElement>(`[data-svg-label="${index}"]`);
      label.style.fontSize = `${fontSize}px`;
      label.textContent = `${index === 0 ? "A" : "B"} · ${names[side.dataset.id]}, ${labels[side.moment].toLowerCase()}`;
      tween(label, "y", Math.max(18, 485-r*2-12));
      const barLabel = query<SVGTextElement>(`[data-bar-label="${index}"]`);
      barLabel.textContent = `${index === 0 ? "A" : "B"} · ${names[side.dataset.id]}: ${signed(frame.change)}`;
      barLabel.style.fontSize = `${fontSize}px`;
      const falling = (frame.change ?? 0) < 0;
      barLabel.setAttribute("text-anchor", falling ? "end" : "start");
      barLabel.setAttribute("y", String(184 + index * 140));
      barLabel.setAttribute("dominant-baseline", "middle");
      // Reserve room for the full label beyond either bar's end, on one shared scale.
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      context.font = `${fontSize}px ${getComputedStyle(barLabel).fontFamily}`;
      const labelWidth = Math.max(...frames.map((f, i) => context.measureText(`${i === 0 ? "A" : "B"} · ${names[sides[i].dataset.id]}: ${signed(f.change)}`).width));
      const reach = Math.max(3 * unitsPerPixel, 290 - labelWidth - 8 * unitsPerPixel);
      const width = frame.change === null || frame.change === 0 ? 0 : Math.max(3 * unitsPerPixel, Math.abs(frame.change) / changeMaximum * reach);
      const length = falling ? -width : width;
      const bar = query<SVGRectElement>(`[data-bar="${index}"]`);
      tween(bar, "x", 300 + Math.min(length, 0));
      tween(bar, "width", width, 0);
    });

    const groups = query("[data-player-groups]");
    groups.replaceChildren();
    let available = 0;
    let checked = 0;
    sides.forEach((side, index) => {
      const fieldset = document.createElement("fieldset");
      addText(fieldset, "legend", `${index === 0 ? "A" : "B"} · ${names[side.dataset.id]}`);
      const entries = totalOn(side.dataset, side.date).values;
      for (const entry of entries) {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.dataset.player = entry.company.id;
        input.dataset.dataset = side.dataset.id;
        input.checked = !side.players || side.players.has(entry.company.id);
        available++;
        if (input.checked) checked++;
        label.append(input);
        addText(label, "span", entry.company.name);
        addText(label, "span", formatTotal(entry.value)).className = "amount";
        fieldset.append(label);
      }
      groups.append(fieldset);
    });
    query('[data-open="players"]').textContent = phone.matches ? `Players ${checked}/${available}` : `Players: ${checked} of ${available}`;
    const sources = query("[data-sources]");
    sources.replaceChildren();
    frames.forEach((frame, index) => {
      addText(sources, "h3", `${index === 0 ? "A" : "B"} · ${names[sides[index].dataset.id]}`);
      const snapshots = [{ label: "Chosen moment", date: sides[index].date, values: frame.values }];
      if (measure === "change") snapshots.push({ label: "Start", date: frame.start, values: frame.baseline.values });
      for (const snapshot of snapshots) {
        addText(sources, "p", `${snapshot.label}: ${dayLabel(snapshot.date)}`);
        const list = document.createElement("ul");
        for (const entry of snapshot.values) {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.href = entry.point.source;
          link.textContent = `${entry.company.name}: ${formatTotal(entry.value)} · recorded ${dayLabel(entry.point.date)}`;
          item.append(link);
          list.append(item);
        }
        sources.append(list);
      }
    });
    query("[data-missing]").textContent = sides.map((side, index) => {
      const known = new Set(totalOn(side.dataset, side.date).values.map((entry) => entry.company.id));
      const missing = side.dataset.companies.filter((company) => !known.has(company.id)).map((company) => company.name);
      return `${index === 0 ? "A" : "B"}: ${missing.length ? `No value in the data on ${dayLabel(side.date)} for: ${missing.join(", ")}.` : "All companies have a recorded value on this date."}`;
    }).join(" ");
    query("[data-size]").setAttribute("aria-label", `A in blue: ${formatTotal(frames[0].total)}; B in orange: ${formatTotal(frames[1].total)}. Same area scale. ${comparisonLine(frames[0].total, frames[1].total)}`);
    const start = performance.now();
    const tick = (now: number) => {
      const progress = !animate || reducedMotion.matches ? 1 : Math.min((now-start)/400, 1);
      const eased = 1-Math.pow(1-progress, 3);
      for (const t of tweens) t.element.setAttribute(t.attribute, String(t.from+(t.to-t.from)*eased));
      for (const { label, circle, width } of nameLabels) {
        const radius = Number(circle.getAttribute("r"));
        label.setAttribute("x", circle.getAttribute("cx")!);
        label.setAttribute("y", circle.getAttribute("cy")!);
        label.style.visibility = Math.hypot(width / 2, fontSize / 2) <= radius * .85 ? "visible" : "hidden";
      }
      for (const index of [0, 1]) {
        const bar = query<SVGRectElement>(`[data-bar="${index}"]`);
        const label = query<SVGTextElement>(`[data-bar-label="${index}"]`);
        const falling = (frames[index].change ?? 0) < 0;
        const end = falling ? Number(bar.getAttribute("x")) : 300 + Number(bar.getAttribute("width"));
        label.setAttribute("x", String(end + (falling ? -8 : 8) * unitsPerPixel));
      }
      if (progress < 1) animation = requestAnimationFrame(tick);
      else for (const element of root!.querySelectorAll("[data-exiting]")) element.remove();
    };
    tick(start);
  }

  root.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;
    if (input instanceof HTMLInputElement && input.dataset.player) {
      for (const side of sides.filter((side) => side.dataset.id === input.dataset.dataset)) {
        if (!side.players) side.players = new Set(side.dataset.companies.map((company) => company.id));
        if (input.checked) side.players.add(input.dataset.player);
        else side.players.delete(input.dataset.player);
      }
    } else {
      const panel = input.closest<HTMLElement>("[data-side]");
      if (!panel) return;
      const side = sides[Number(panel.dataset.side)];
      if (input.hasAttribute("data-bubble")) {
        side.dataset = datasets.find((dataset) => dataset.id === input.value)!;
        side.players = null;
      }
      if (input.hasAttribute("data-moment")) side.moment = input.value as Side["moment"];
      const dates = moments(side.dataset);
      if (side.moment === "date") {
        const date = input.hasAttribute("data-date") ? input.value : side.date;
        side.date = date < dates.start! ? dates.start! : date > dates.latest! ? dates.latest! : date || dates.start!;
      } else side.date = dates[side.moment] ?? dates.start!;
    }
    render();
  });
  root.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!button) return;
    if (button.dataset.open) { dialog(button.dataset.open).showModal(); return; }
    if (button.hasAttribute("data-swap")) sides.reverse();
    else if (button.dataset.measure) measure = button.dataset.measure;
    else if (button.dataset.quick) {
      const quick = button.dataset.quick;
      if (quick === "biggest") {
        for (const side of sides) {
          const top = totalOn(side.dataset, side.date).values.filter((entry) => entry.company.kind !== "group").sort((a,b) => b.value-a.value || a.company.id.localeCompare(b.company.id))[0];
          side.players = new Set(top ? [top.company.id] : []);
        }
      } else {
        sides[0] = { dataset: datasets[0], moment: quick === "then" ? "start" : quick === "peaks" ? "peak" : "lowest", date: "", players: null };
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
