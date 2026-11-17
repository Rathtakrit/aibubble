@AGENTS.md

## For Claude
- Claude plans and reviews; OpenCode writes the code, asking the model gateway for a role (`lite/<role>`, see the
  work-routing skill). See `~/.claude/CLAUDE.md`.
- Everything in the repo is public, so briefs, PRs and commits hold nothing private. Steps and decisions:
  `docs/briefs/2026-11-15-aibubble.md`.
- The design canvas is https://claude.ai/artifact/BAskMwaD6PktmpZSjhfi4h. After changing it, copy its files into
  `design/` in the same pull request.
- Commits use GitHub's private email (the repo's local git config), never the owner's real one.

## Who does what
| Work | Who | Model |
|---|---|---|
| Story chapters | The user writes them; Claude copies them in word for word | Claude (copy only) |
| Chapter fact sheets; research on the market-data source, news feeds and logo rules | OpenCode worker; Claude checks before the user sees it. A Claude helper only for one page a worker can't open | Role by task |
| Site code, data scripts, workflows | Supervised OpenCode, one brief step per PR | Role by task |
| Small issues that need no workflow, secret or login change | Night shift (`night` label), reviewed with night-pr-reviewer | `easy` |
| Steps that look at images | Supervised OpenCode | `vision` |
| News drafts while the site runs | Daily GitHub Actions job through the gateway, key `aibubble`, capped $2 a month; the user approves each item in the weekly PR | DeepSeek via the gateway |
| Company list, logo approval, merges, Cloudflare Pages, Tailscale and repo secrets | The user | None |

Never send chapter text to a worker to write or change.
