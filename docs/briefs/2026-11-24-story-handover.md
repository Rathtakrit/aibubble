# Handover: story chapters (24 Nov 2026)

Branch `story/three-bubbles`, PR #84 (draft, not for merging yet). Main is untouched. The rules and decisions are in
`docs/briefs/2026-11-23-aibubble.md`, "Next goal". This file holds status only.

## Done
| Item | Where |
|---|---|
| Research, one file per bubble: mechanism, link types found, fact table (primary link plus quote per number), turning points, disputed claims | `docs/research/story-{ai,dotcom,housing}.md` |
| Three stories, 9 chapters each, with `links`, `look` and `sources` | `docs/story/` (AI, replaces the 9 samples), `docs/story/dotcom/`, `docs/story/housing/` |
| Lines and companies the chapters use that the data lacks | `docs/research/story-{ai,dotcom,housing}-data-gaps.md` |
| Owner decisions: link kinds per page, a government bubble, visual aid on the bubble picture | the brief |
| Checks: 111 research links (all open except Guardian pages, which block the server, plus 3 slow sites); 5 numbers matched word for word; every chapter's ids, dates, length and sources checked by script; `npm run check` passes; the AI story builds with story mode on; two cold-reader rounds, and the second gave the right mechanism for all three | PR #84 |

How it was made: OpenCode `lite/easy` through `oc-run`, in three stages (research, stories, repairs), with three runs
in parallel per stage. Briefs and logs are in the local `.worker/` folder (`s1_*` to `s6_*`), not in git.

## Left, in order
1. **Owner: verify the stories** (planned before the next session), plus the AI ending: it stops at the 20 Nov 2026 listing, and the cold reader called it unfinished. The site can't predict, so the options are to leave it or add a line saying the story is still running.
2. **Text repairs from the owner's notes and these known gaps:** "bond", "GDP", "revenue" and "assets" are never explained. AI ch. 4 and 8 have `look` lines about bubbles shrinking in a day, which year-end values can't show.
3. **Data:** add the rows in the three data-gap files (new kinds in `meta.json`, new deals, Winstar, ICG, Leap, Netscape and `us-government`), each with its source. `npm run check` must pass.
4. **Design (owner):** the colours for the five new link kinds, and how the government bubble looks. Draw them on the design canvas first.
5. **Code (supervised `dev`):**
   - Story mode on the past pages (it reads only `docs/story/[0-9][0-9]-*.md` today, `src/lib/story.ts:99`).
   - Light up each chapter's `links` and show its `look` line and `sources`.
   - Turn on `STORY_ENABLED`.
   - Update the "Sample chapters, written by AI" notice on the page.
   - Playwright checks of each chapter at both widths.
6. **Merge PR #84 (or the stacked branch)** when the owner is happy. The night shift stays off until then.

## To resume
- Work on `story/three-bubbles`. New steps branch from it, and their PRs target it, not main.
- Text repairs go to a worker with the exact lines to change. Claude doesn't rewrite chapter text.
- The worker sessions behind each story (to continue with `oc-run ... -c <session>`):
  - housing `ses_df2642bb7ffelsgjqmhW7BM2v1`
  - dot-com `ses_df263dd8cffeC57bw6k7EYLL3Y`
  - AI `ses_df2638eddffehzG2K8SEpwxqhu`
- The chapter check script is `.worker/check_ids.py` (local), run with `python3 -I`.
