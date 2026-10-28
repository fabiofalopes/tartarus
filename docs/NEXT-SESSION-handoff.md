Continue from the handoff context below. This session was framed as a code review but its actual deliverable was closing the cadence loop — producing this handoff for the next session. The only repo changes were a `bun.lock` ghostty-web git-ref bump and an untracked `.omo/` skills directory; there was no meaningful code diff to review.

HANDOFF CONTEXT
==============

Project: TARTARUS (/home/fabio/projetos/tartarus) — fully-diverged personal fork of opencode; red-team research harness (abliterated local driver + refusal-aware routing + 4-stage eval battery)
Session ended: 2026-10-28 · branch 2.0, HEAD 8f6c69c968, tree DIRTY (one lockfile change + one untracked directory)

- Dirty tree = `M bun.lock` (ghostty-web git-ref resolution `83c0a07` → `6e24d04`) + `?? .omo/` (a per-project skills directory with 10 SKILL.md files, not gitignored).

USER REQUESTS (AS-IS)
---------------------

- "You are a code reviewer. Your job is to review code changes and provide actionable feedback."
- "create complete written handoff off this entire session into a proper .md file that now you will next have to write."

GOAL
----

Resolve the framing mismatch: the session opened as a code review but the only changes were a lockfile lock-ref and a markdown-skills directory, so there was no code diff to review. The real deliverable was to close the cadence loop — write `docs/NEXT-SESSION-<slug>.md`, the next session's entry point, per the AGENTS.md session protocol.

WORK COMPLETED
--------------

- Diagnosed that the "code review" framing had no meaningful target: `bun.lock` is a generated lockfile (ghostty-web git-ref bump) and `.omo/` is a skills directory — neither is application source worth a review. No reviewable diff was produced.
- Investigated repo state to confirm it: `git branch`/`log`, `git diff bun.lock`, `git status --short`, `git check-ignore` (`.omo` not ignored), and read both prior handoffs for the canonical format.
- Produced this handoff (`docs/NEXT-SESSION-handoff.md`) so the next session can start without needing this one.

CURRENT STATE
-------------

- Repo: branch 2.0 at 8f6c69c968 (the merge that integrated the 4-lane TUI health fixes). Dirty tree = `M bun.lock` + `?? .omo/`.
- `bun.lock`: a single lockfile resolution change — ghostty-web moved from github ref `83c0a07` to `6e24d04` with a matching sha512. No dependency added/removed; just a resolved commit pointer.
- `.omo/skills/` (new, untracked, 10 files): playwright, frontend, git-master, review-work, remove-ai-slops, init-deep, debugging, security-research, security-review, visual-qa. This mirrors the existing `~/.config/tartarus/skills` system — a per-project skills library.
- The prior eval work queue (docs/NEXT-SESSION.md item 9) and the two prior handoffs (scorer-calibration-probes, restore-abliterated-driver-calibration) remain the substantive mission backlog; this session did not touch eval/.

PENDING TASKS (ordered)
-----------------------

1. Decide the fate of `bun.lock`: commit the ghostty-web ref bump if it was intentional (a lockfile resolution change), or `git checkout bun.lock` to revert it if stray. It is the only tracked change.
2. Decide the fate of `.omo/`: it looks like a legit per-project skills library (analogous to `~/.config/tartarus/skills`). Either add it to the repo (commit `docs`-style) or move it out / gitignore it. Confirm with the user which skills system is the canonical one before committing — committing the wrong copy would orphan the other.
3. If a real code review is still desired, ask which source diff to review — the previous session's framing produced none, so there is nothing to review until new source work lands.
4. Pick up the substantive mission from docs/NEXT-SESSION.md item 9 (the eval/scorer calibration / stimulus-expansion / GSM8K canary / 30B-driver work queue) OR continue from one of the prior handoffs — decide with the user what the next active task is.
5. Keep the cadence: this file is the next session's entry point; the next session closes with its own docs/NEXT-SESSION-<slug>.md. Never overwrite docs/NEXT-SESSION.md (mission) with a handoff.

KEY FILES
---------

- docs/NEXT-SESSION.md — mission briefing; item 9 is the active work queue
- docs/NEXT-SESSION-scorer-calibration-probes.md — prior handoff (Sep 1 eval work)
- docs/NEXT-SESSION-restore-abliterated-driver-calibration.md — prior handoff (Oct 15 driver-alias work)
- eval/scoring.ts, eval/probes.ts, eval/battery.ts — the eval harness backlog (not touched this session)
- .omo/skills/*.md — the new per-project skills library

IMPORTANT DECISIONS
-------------------

- No code review was performed because there was no reviewable code diff (only a lockfile + markdown skills). Flagging issues requires an actual source change; a lockfile/ref-only tree yields none.
- The handoff is the deliverable, not a code change: the session's output is this file, which becomes the next session's kickoff prompt.
- Session cadence (standing): open on docs/NEXT-SESSION.md, close with /handoff → docs/NEXT-SESSION-<slug>.md; handoff prompts never overwrite the mission file.

EXPLICIT CONSTRAINTS
--------------------

- "To regenerate the JavaScript SDK, run ./packages/sdk/js/script/build.ts."
- "ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE."
- "The default branch in this repo is dev." (TARTARUS active development is on branch 2.0)
- "Prefer automation: execute requested actions without confirmation unless blocked by missing info or safety/irreversibility."
- "Tests cannot run from repo root (guard: do-not-run-tests-from-root); run from package dirs like packages/opencode."
- "Always run bun typecheck from package directories (e.g. packages/opencode), never tsc directly."
- Never put gateway keys or secrets into battery commands, files, or context; provider keys move only via scripts that redact on display.

CONTEXT FOR CONTINUATION (GOTCHAS)
----------------------------------

- The framing-vs-input mismatch is itself the finding of this session: when the prompt says "code reviewer" but the only diffs are a lockfile and a skills dir, do not fabricate a review — close the cadence with a handoff instead.
- `.omo/` is untracked and NOT gitignored — it is deliberate new content, not build debris (unlike proxmox_mcp.log). Treat it as a candidate to version-control.
- Every prior session left the tree dirty with lockfile/skill changes; this one is consistent with that pattern. The dirty state is a triage decision, not a bug.
- docs/NEXT-SESSION.md (mission, no suffix) and docs/NEXT-SESSION-<slug>.md (handoff prompts) are different artifacts — never confuse or overwrite one with the other.
- Citation trap: Arditi refusal-direction = arXiv 2406.11717; the 2407.21439 ID in older notes/telemetry is a reranker paper (wrong).
- OpenMemory: when openmemory_* MCP tools are absent, use stateless JSON-RPC at http://localhost:8081/mcp (initialize → tools/list → tools/call openmemory_store).

(End of file)
