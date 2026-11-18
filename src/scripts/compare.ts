const root = document.querySelector<HTMLElement>(".compare-page");

root?.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("button[data-moment]");
  if (!button) return;
  for (const control of root.querySelectorAll<HTMLButtonElement>("button[data-moment]")) {
    control.setAttribute("aria-pressed", String(control === button));
  }
  for (const panel of root.querySelectorAll<HTMLElement>("[data-panel]")) {
    panel.hidden = panel.dataset.panel !== button.dataset.moment;
  }
});

root?.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.dataset.player) return;
  const key = input.dataset.player;
  // Phone and desktop controls represent the same player and stay in sync.
  for (const other of root.querySelectorAll<HTMLInputElement>("input[data-player]")) {
    if (other.dataset.player === key) other.checked = input.checked;
  }
  for (const circle of root.querySelectorAll<HTMLElement>("[data-circle]")) {
    if (circle.dataset.circle === key) circle.style.visibility = input.checked ? "" : "hidden";
  }
});
