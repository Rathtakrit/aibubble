# AI Bubble

How the AI bubble formed: company bubbles sized by value, the money flowing between them, and the news behind it,
day by day since June 2017. Planned for https://aibubble.rathtakrit.com.

The site is being built and is not live yet. The plan is in
[`docs/briefs/2026-11-15-aibubble.md`](docs/briefs/2026-11-15-aibubble.md).

Run it locally with `npm ci` to install, then `npm run dev` and open the address it prints. `npm run check` runs
the data checks, the tests and a production build. It needs Node 22 (see `.nvmrc`).

## The daily news job
`scripts/news-job.mjs` reads the feeds in `scripts/news-feeds.json` for one day, asks a model to draft
news items into `data/news.json`, and the hand-started run in `.github/workflows/news.yml` puts the drafts
in a pull request for the owner to approve. Secrets it needs: `GATEWAY_URL`, `AIBUBBLE_GATEWAY_KEY`,
`SEC_USER_AGENT`, `TS_OAUTH_CLIENT_ID` and `TS_OAUTH_SECRET`.

## Night shift
`.github/workflows/night-shift.yml` runs an unattended agent on GitHub issues labeled `night`, on a timer
through the night. It takes up to three issues at a time, works on each one on its own branch, and opens a
pull request per issue that closes it. The agent talks to the model gateway over Tailscale, and the workflow
itself does the branch, commit, push, pull request and issue comment.

- **Off switch:** Actions tab → **night-shift** → **...** → **Disable workflow**.
- **To queue an issue:** open an issue and add the `night` label. Only issues you wrote, with no comments from
  anyone else, are picked up. A scheduled run starts nothing while three night pull requests are still open.
- **Variables:** `NIGHT_SHIFT_MODEL`, the gateway model name with no provider prefix (default `tm-flash`).
- **Secrets:** `GATEWAY_URL`, `NIGHT_GATEWAY_KEY`, `TS_OAUTH_CLIENT_ID` and `TS_OAUTH_SECRET`.
