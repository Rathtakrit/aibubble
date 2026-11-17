# AI Bubble

A picture of how the AI money bubble formed. Each company is a bubble sized by its value, arrows show money moving
between companies (investments, cloud deals, chip orders), and a slider walks through it day by day from June 2017.
Click a dot on the timeline to read the news behind that day.

**Live:** https://will-it-pop.rathtakrit.workers.dev (later https://aibubble.rathtakrit.com)

Two past bubbles sit beside it for comparison, as tabs (in the header on desktop, in the bottom sheet on a phone): the dot-com bubble (burst
10 March 2000) and the housing bubble (burst 15 September 2008).

This is an explainer, not investment advice. It never says buy or sell and never predicts prices.

## Where the numbers come from
Every value, deal and news item carries a link to its source, shown on the page. The data lives in plain JSON files:

| File | Holds |
|---|---|
| `data/companies.json` | The companies |
| `data/values.json` | Their values over time |
| `data/deals.json` | Money moving between them |
| `data/news.json` | The news items on the timeline |
| `data/past/dotcom/`, `data/past/housing/` | The same files for the past bubbles |

Spotted a wrong number or a dead link? Open an issue with the item and a better source.

## Run it yourself
Needs Node 22 (see `.nvmrc`).

```
npm ci          # install
npm run dev     # start a local copy; open the address it prints
npm run check   # data checks, tests and a production build
```

Built with [Astro](https://astro.build) and TypeScript. The page code is in `src/`, the plan and every design
decision in [`docs/briefs/2026-11-15-aibubble.md`](docs/briefs/2026-11-15-aibubble.md), the design in `design/`.

## How it's kept up to date
- **News drafts:** `.github/workflows/news.yml` runs `scripts/news-job.mjs`, which reads the feeds in
  `scripts/news-feeds.json` and asks an AI model to draft news items. The drafts arrive as a pull request, and
  nothing goes live until the owner approves it. Secrets: `GATEWAY_URL`, `AIBUBBLE_GATEWAY_KEY`, `SEC_USER_AGENT`,
  `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`.
- **Night shift:** `.github/workflows/night-shift.yml` lets an AI coding agent work on issues labeled `night`
  overnight, one pull request per issue, each reviewed before merging. Only the owner's issues are picked up.
  Off switch: Actions → **night-shift** → **...** → **Disable workflow**. Variable `NIGHT_SHIFT_MODEL` (default
  `tm-flash`); secrets `GATEWAY_URL`, `NIGHT_GATEWAY_KEY`, `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`.

Rules for anyone (or any agent) changing this repo: [`AGENTS.md`](AGENTS.md).
