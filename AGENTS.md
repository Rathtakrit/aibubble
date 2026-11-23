# AI Bubble rules

A public site that draws the AI, dot-com and housing bubbles: company bubbles sized by value, money arrows between
them, and a timeline. What the site is, its rules and the next goal: `docs/briefs/2026-11-23-aibubble.md`. The design:
`design/` (the brief lists which file shows what).

This repo is public. Anyone can read every file, issue, pull request and commit, and none of it can be taken back.

## Never
- Commit secrets: keys, tokens, passwords or `.env` files. They live in repo secrets only.
- Publish anything AI-written without the owner's approval in a pull request.
- Say buy or sell, or predict prices.
- Add a paid service, or a cost of any kind, without the owner's OK.
- Touch anything outside this repo.
- Invent design. What the design files and the brief don't show goes to the owner as a question.

## Always
- Every value, deal and news item carries its source link in the data.
- Plain words. Explain an investment term the first time it appears.
- Works at phone width (layout C) and desktop (layout B). Touch targets at least 44 px. Respect reduced motion.
- Before finishing, `npm run check` (data check, unit tests, type check, build) and `npx playwright test` (browser
  checks of the timeline and Compare at both widths) pass.

## Night shift
For runs started by `.github/workflows/night-shift.yml`. You run unattended: nobody can answer questions.
- One issue, one branch, one pull request. Never push to main.
- Do only what the issue asks. List anything else you noticed in the pull request description.
- If the issue is unclear, change nothing and say what you need in your final message.
- Before you finish, run the build and tests. If they fail and you can't fix them, say what failed.
- Write the pull request description for a non-programmer: what changed, how to check it, what you weren't sure
  about.
- Never touch login, permissions, payments, secrets, `.env` files, DNS, deploy settings or GitHub workflows.
- Never use real people's private data. Never delete files this task didn't create.
- Add a package only when the issue allows it, and say why in the pull request.
- Copy the nearest similar file in the codebase.
