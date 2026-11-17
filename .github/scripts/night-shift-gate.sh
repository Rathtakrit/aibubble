#!/usr/bin/env bash
# shellcheck disable=SC2016  # the GraphQL $variables below are meant literally
# Night shift gate. Called by .github/workflows/night-shift.yml.
#
#   night-shift-gate.sh           Decide whether this run may start, and on which issues.
#   night-shift-gate.sh recheck   Right before the agent starts: is $ISSUE still free?
#
# Writes go=true|false (and issues=[N,...]) to $GITHUB_OUTPUT and one line to the run summary.
# A "no" is not an error: the run just ends green with the reason in its summary.
set -euo pipefail

: "${MODEL:?}" "${EVENT:?}" "${GH_REPO:?}"
MAX_WAITING_PRS=${MAX_WAITING_PRS:-3}
MAX_JOBS=${MAX_JOBS:-3}
OWNER=${GH_REPO%/*}
NAME=${GH_REPO#*/}
ISSUES=()

note() { echo "$1"; if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then echo "$1" >>"$GITHUB_STEP_SUMMARY"; fi; }
output() { if [ -n "${GITHUB_OUTPUT:-}" ]; then echo "$1" >>"$GITHUB_OUTPUT"; fi; }
json_issues() {
  if [ ${#ISSUES[@]} -eq 0 ]; then echo '[]'; return; fi
  printf '%s\n' "${ISSUES[@]}" | jq -Rsc 'split("\n") | map(select(length > 0)) | map(tonumber)'
}
stop() { note "Not starting: $1"; output "go=false"; output "issues=[]"; exit 0; }
start() { note "Starting: $1"; output "go=true"; output "issues=$(json_issues)"; exit 0; }

# Comments made with the workflow's GitHub token show up as this bot.
is_bot() { [[ "$1" =~ ^github-actions(\[bot\])?$ ]]; }

# Prints "<STATE> <open PRs that close it> <last commenter or ->" for issue $1.
issue_status() {
  gh api graphql -f owner="$OWNER" -f name="$NAME" -F number="$1" -f query='
    query($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        issue(number: $number) {
          state
          closedByPullRequestsReferences(first: 1, includeClosedPrs: false) { totalCount }
          comments(last: 1) { nodes { author { login } } }
        }
      }
    }' --jq '.data.repository.issue
      | "\(.state) \(.closedByPullRequestsReferences.totalCount) \(.comments.nodes[0].author.login // "-")"'
}

# Issue numbers that already have an open night shift PR (branch opencode/issue<N>-...).
# GitHub doesn't link "Closes #N" in PRs opened with the workflow token, so the branch name
# is the reliable link between a night PR and its issue.
open_pr_issues() {
  gh pr list --state open --limit 200 --json headRefName \
    --jq '.[].headRefName | capture("^opencode/issue(?<n>[0-9]+)-").n'
}
has_open_pr() { grep -qx "$1" <<<"$OPEN_PR_ISSUES"; }

# Prints "ok" when issue $1 may reach the agent, else the rule that stops it.
# This repo is public, so a stranger's words must never reach the agent's task: only an
# issue the owner wrote, with only owner and bot comments on it, is allowed through.
issue_safety() {
  gh api graphql -f owner="$OWNER" -f name="$NAME" -F number="$1" -f query='
    query($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        issue(number: $number) {
          authorAssociation
          comments(first: 100) { totalCount nodes { author { login } authorAssociation } }
        }
      }
    }' --jq '.data.repository.issue
      | if .authorAssociation != "OWNER" then "the issue is not from the owner"
        elif .comments.totalCount > 100 then "it has more than 100 comments"
        elif any(.comments.nodes[];
          .authorAssociation != "OWNER" and ((.author.login // "") | test("^github-actions(\\[bot\\])?$") | not))
          then "a comment is not from the owner"
        else "ok"
        end'
}

# Prints the oldest open issues labeled "night" that have no open PR and where the bot
# didn't comment last (the bot asked a question, opened a PR you closed, or reported a failure).
queue_candidates() {
  gh api graphql -f owner="$OWNER" -f name="$NAME" -f query='
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        issues(first: 50, states: OPEN, labels: ["night"], orderBy: {field: CREATED_AT, direction: ASC}) {
          nodes {
            number
            closedByPullRequestsReferences(first: 1, includeClosedPrs: false) { totalCount }
            comments(last: 1) { nodes { author { login } } }
          }
        }
      }
    }' --jq '.data.repository.issues.nodes[]
      | select(.closedByPullRequestsReferences.totalCount == 0)
      | select((.comments.nodes[0].author.login // "") | test("^github-actions(\\[bot\\])?$") | not)
      | .number'
}

# Adds up to $1 issues from the queue to ISSUES, oldest first.
fill_queue() {
  local n why
  for n in $(queue_candidates); do
    [ ${#ISSUES[@]} -lt "$1" ] || return 0
    if has_open_pr "$n"; then continue; fi
    if ! why=$(issue_safety "$n"); then note "Skipping issue #$n: couldn't read it."; continue; fi
    if [ "$why" != ok ]; then note "Skipping issue #$n: $why."; continue; fi
    ISSUES+=("$n")
  done
}

OPEN_PR_ISSUES=$(open_pr_issues)

if [ "${1:-}" = recheck ]; then
  : "${ISSUE:?}"
  if ! status=$(issue_status "$ISSUE"); then stop "couldn't read issue #$ISSUE."; fi
  read -r state prs last <<<"$status"
  [ "$state" = OPEN ] || stop "issue #$ISSUE was closed in the meantime."
  if [ "$prs" != 0 ] || has_open_pr "$ISSUE"; then stop "issue #$ISSUE already has an open pull request."; fi
  if [ -z "${INPUT_ISSUE:-}" ] && is_bot "$last"; then
    stop "the night shift already replied on issue #$ISSUE and is waiting for your answer."
  fi
  if ! why=$(issue_safety "$ISSUE"); then stop "couldn't read issue #$ISSUE."; fi
  [ "$why" = ok ] || stop "issue #$ISSUE is skipped: $why."
  start "issue #$ISSUE is still free."
fi

case "$EVENT" in
  schedule)
    waiting=$(gh pr list --label night --state open --limit 100 --json number --jq length)
    room=$((MAX_WAITING_PRS - waiting))
    ((room > 0)) ||
      stop "$waiting night pull requests are waiting for your review (the limit is $MAX_WAITING_PRS)."
    want=$MAX_JOBS
    if ((room < want)); then want=$room; fi
    fill_queue "$want"
    ;;
  workflow_dispatch)
    if [ -n "${INPUT_ISSUE:-}" ]; then
      [[ "$INPUT_ISSUE" =~ ^[0-9]+$ ]] || stop "'$INPUT_ISSUE' is not an issue number."
      if ! status=$(issue_status "$INPUT_ISSUE"); then stop "issue #$INPUT_ISSUE doesn't exist."; fi
      read -r state prs _ <<<"$status"
      [ "$state" = OPEN ] || stop "issue #$INPUT_ISSUE is closed."
      if [ "$prs" != 0 ] || has_open_pr "$INPUT_ISSUE"; then
        stop "issue #$INPUT_ISSUE already has an open pull request."
      fi
      if ! why=$(issue_safety "$INPUT_ISSUE"); then stop "couldn't read issue #$INPUT_ISSUE."; fi
      [ "$why" = ok ] || stop "issue #$INPUT_ISSUE is skipped: $why."
      ISSUES=("$INPUT_ISSUE")
    else
      fill_queue "$MAX_JOBS"
    fi
    ;;
  *) stop "unexpected event '$EVENT'." ;;
esac

[ ${#ISSUES[@]} -gt 0 ] || stop "no night issue is ready."

what=$(printf '#%s, ' "${ISSUES[@]}")
start "issue ${what%, } with $MODEL."
