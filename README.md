# AI Bubble

<!-- DRAFT for the owner to rewrite. Lines starting "<!-- YOU:" are prompts for your own words; delete them after. -->

**How did a few companies come to be worth trillions on the promise of AI?** This site draws it: every company is a
bubble sized by its value, and arrows show the money moving between them, day by day since June 2017.

<!-- YOU: one or two sentences on why you made this. What made you want to see it drawn? -->

**See it live:** https://will-it-pop.rathtakrit.workers.dev

![The AI bubble on 12 November 2026: Nvidia at $4.0 trillion fills the frame, with the news of the day beside it](docs/screenshots/desktop.png)

## What you can do

| | |
|---|---|
| **Scrub through time** | Drag the timeline or tap a dot to jump to a day. The bubble resizes and the news card explains what happened. |
| **Follow the money** | Arrows show investments (blue), cloud deals (orange) and chip deals (teal), each with its source. |
| **Compare past bubbles** | The dot-com bubble (burst 10 March 2000) and the housing bubble (burst 15 September 2008) sit beside it as tabs. |

<img src="docs/screenshots/phone.png" alt="The same day on a phone: the bubble on top, the news card and timeline below" width="260" align="right">

It works on a phone too.

<!-- YOU: anything you want readers to notice first: a day worth jumping to, a surprise in the data. -->

This is an explainer, not investment advice. It never says buy or sell and never predicts prices.

<br clear="right">

## Where the numbers come from

Every value, deal and news item links to its source on the page. The data is plain JSON anyone can read:

| File | Holds |
|---|---|
| `data/companies.json` | The companies |
| `data/values.json` | Their values over time (year-end market values for now) |
| `data/deals.json` | Money moving between them |
| `data/news.json` | The news items on the timeline |
| `data/past/dotcom/`, `data/past/housing/` | The same files for the past bubbles |

**Found a wrong number or a dead link?** Open an issue with the item and a better source.

## Run it yourself

Needs Node 22 (see `.nvmrc`).

```
npm ci          # install
npm run dev     # start a local copy; open the address it prints
npm run check   # data checks, tests and a production build
```

Built with [Astro](https://astro.build) and TypeScript. Page code is in `src/`, the plan and every design decision in
[`docs/briefs/2026-11-15-aibubble.md`](docs/briefs/2026-11-15-aibubble.md), the design in `design/`.

## How it's made

<!-- YOU: a line on how you work with AI here, in your own words, if you want it public. -->

An AI coding agent works through issues labeled `night` overnight (`.github/workflows/night-shift.yml`), one pull
request per issue. Every change is reviewed and merged by the owner, and nothing AI-written goes live without that.
Off switch: Actions → **night-shift** → **...** → **Disable workflow**. Variable `NIGHT_SHIFT_MODEL`; secrets
`GATEWAY_URL`, `NIGHT_GATEWAY_KEY`, `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`.

Rules for anyone (or any agent) changing this repo: [`AGENTS.md`](AGENTS.md).
