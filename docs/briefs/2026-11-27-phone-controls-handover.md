# Handover: phone controls and the timeline ring (27 Nov 2026)

PR #85 (`story/phone-controls`, 3 commits) went wrong in where it was built and in how much it changed. The owner's
review is below. Nothing from it is on `story/three-bubbles` yet.

## Owner's decisions
- **Work lands on `story/three-bubbles` itself.** No new branch stacked on it. Close #85 without merging, after the
  keepers below are on the story branch.
- **#84 is the reference look.** Every step compares before/after screenshots against `story/three-bubbles` at
  390 × 844, 360 × 780, 1280 × 800 and 1440 × 900, in both Story and Explore. Only the asked-for change may differ.

## Keep from #85 (owner says these work)
| Commit | What | Watch for |
|---|---|---|
| `89d68c5` | Phone: ← → as round icons at the right of the timeline controls, the three icons on the left; chapters in Story, news in Explore | Built on top of `3480b39` (the ring), so it may not apply cleanly on its own |
| `f61bc5a` | Phone: tabs in the map's top-right corner; the docked sheet shows the title line, the timeline and its controls | Also reworked the sheet handle's tap and drag code, which nobody asked for. Keep it only if a tap really goes through to the map without it |

## Redo: the timeline ring (`3480b39`, drop it)
- What the owner saw: the new ring covers the old dot, moves much too fast, and doesn't match the old design.
- Wanted: the **same design and the same speed as #84**. The only change: the old ring is gone as soon as the move
  starts, so two red rings never show together.
- Likely smallest fix (to confirm): `.dot` has `transition: all 300ms ease` (`src/styles/explore.css`, the `.dot`
  rule), so the old dot's red `box-shadow` fades out over 300 ms while the new one shows. Taking `box-shadow` out of
  that transition may be the whole fix. Keep the "one red ring" Playwright test idea from `3480b39`
  (`tests/timeline.spec.ts`), since it failed on the old code.

## New
- **Desktop: move the explore button to the top-right corner**, the same place as the tabs on the phone. Ask which
  button first (see questions).

## Find the cause first
- **Story text looks a different size on #85 than on #84.** Where wasn't checked. The CSS diff between the branches
  shows no change to `.chapter-text` or the titles. Only the old big buttons (`.sheet-buttons`, 14px) and the tab
  sizes under 430px were removed. Compare screenshots of the two branches to find which width and which text.

## Order for the next session
1. Owner answers the questions below.
2. On `story/three-bubbles`: the ring fix (supervised `dev`, one step), then screenshots against #84.
3. Bring over the phone arrows, then the phone tabs, one step each, without the handle rework unless needed.
4. The desktop explore button.
5. Close #85 and delete its branch (git keeps the commits).

## Questions for the owner
1. Which desktop button moves to the top-right: the compass "Explore day by day" button under the chapter, or
   another one? Next to the AI / Dot-com / Housing / Compare links, or in place of them?
2. Where does the story text look different: phone, desktop or both, and which part (title, chapter text, sources)?

## Notes for workers
- `oc-run` needs about 1.7 GB free for a run with `--build 800M`. With several Claude sessions open the run is refused.
  Close spare sessions first, or run without a build and let Claude run the build and Playwright.
- Previous worker sessions (continue with `-c`): ring `ses_de7aa3d0cffegHRqJ9p28BdUW6`, arrows
  `ses_de79955abffeEjKm829lPdpcxZ`, tabs `ses_de78cd9b3ffe1eKloFqjl1VuAO`. Briefs: `.worker/briefs/pc{1,2,3}-*.md`.
