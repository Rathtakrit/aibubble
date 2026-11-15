# AI Bubble

How the AI bubble formed: company bubbles sized by value, the money flowing between them, and the news behind it,
day by day since June 2017. Planned for https://aibubble.rathtakrit.com.

Plan stage: no code yet. The plan is in [`docs/briefs/2026-11-15-aibubble.md`](docs/briefs/2026-11-15-aibubble.md).

## The daily news job
`scripts/news-job.mjs` reads the feeds in `scripts/news-feeds.json` for one day, asks a model to draft
news items into `data/news.json`, and the hand-started run in `.github/workflows/news.yml` puts the drafts
in a pull request for the owner to approve. Secrets it needs: `GATEWAY_URL`, `AIBUBBLE_GATEWAY_KEY`,
`SEC_USER_AGENT`, `TS_OAUTH_CLIENT_ID` and `TS_OAUTH_SECRET`.
