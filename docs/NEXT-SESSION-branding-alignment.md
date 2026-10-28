Continue from the handoff context below. This session measured TARTARUS's divergence
from upstream opencode, dry-ran a merge, then validated the codebase and fixed the
130 failing self-tests down to 0 in all core suites — by completing the
opencode→tartarus branding that a prior commit had left half-done.

HANDOFF CONTEXT
===============

Project: TARTARUS (/home/fabio/projetos/tartarus) — fully-diverged personal fork of
opencode; red-team research harness (abliterated local driver + refusal-aware routing

- 4-stage eval battery).
  Session ended: 2026-10-28 · branch 2.0, HEAD f3df349fe1 · tree CLEAN · 2 commits ahead
  of origin/2.0 (NOT pushed).

USER REQUESTS (AS-IS)
---------------------

- "How far from opencode our repo is from their side not ours"
- "yes its our repo now. but i meant opencode original. we can probably just merge new things"
- "validate dry run"
- "So we ran dry run now we like let's have our branch now holding our code that
  opencode doesn't give a shit about ... we want to make sure 100% of our codebase
  tartarus is not only intact we must now validate a afinm that everything is well"
- "make sure everything was doing well but > 100k for current config sucks, less than
  that amazing really"
- (answers) test remediation = "A) Align tests to tartarus"; dirty-tree triage =
  "Commit both"

GOAL
----

Answer "how far from upstream", validate a merge is feasible, then prove the TARTARUS
codebase is intact and healthy — and make the test suite green by aligning it to the
fork's `tartarus` branding (rather than reverting our branding, per the user's choice).

DIVERGENCE FINDINGS
-------------------

- vs `upstream/2.0` (the dead line, tip 7a6ce05 @ 2026-04-13): 0 behind / 18 ahead.
  This is the fork anchor. Not the interesting comparison.
- vs `upstream/dev` (the LIVE opencode line, tip fa1260d6ca @ 2026-10-28):
  **10,404 behind / 20 ahead** (18 prior + 2 from this session). Upstream `dev` has
  restructured the tree (packages/opencode/src/* → packages/core/src/*, src/seed/ gone).
- Dry-run merge `upstream/dev` → `2.0` (git merge-tree, no tree touched): 75 conflicts
  - 45 modify/delete (upstream deleted files we edited across our 18 commits)
  - 25 file-location (our new files in dirs upstream renamed)
  - 1 rename/delete (`bin/opencode`→`bin/tartarus` in 2.0, deleted upstream)
  - 4 content conflicts (incl. packages/tui/src/logo.ts)
  - Only 5 auto-merged cleanly. Merge is NOT a fast "just merge" — needs a strategy.

WORK COMPLETED
--------------

1. Divergence measured (above). Two upstream refs must be distinguished: dead `2.0`
   anchor vs live `dev` line.
2. Dry-run merge validated with `git merge-tree` (working tree untouched; an earlier
   `git merge --no-commit` aborted on dirty bun.lock, harmless).
3. Validation baseline: our 18 commits intact, no in-progress merge, all TARTARUS
   artifacts present (14 godmode files, bin/tartarus, docs, research corpus).
   `bun typecheck` green.
4. Found 130 test failures in agent/config/provider. Root-caused: the 2.0 branding
   commits renamed config DISCOVERY (reads) opencode→tartarus but NOT the WRITE paths
   and migration sources → fork writes opencode.json/.opencode while reading
   tartarus.json/.tartarus. An internal inconsistency the upstream tests exposed.
5. Fixed source (7 files) — completes the rename, fixes a REAL inconsistency:
   - config.ts: managed-settings dir loop reads tartarus.json[rc]
   - tui-migrate.ts: migration sources read tartarus files (helper → tartarusFiles)
   - plugin/install.ts + cli/cmd/plug.ts: server-config patch name opencode→tartarus
   - agent.ts + session/index.ts: plans dir .opencode/plans → .tartarus/plans
   - cli/cmd/mcp.ts: config candidates → tartarus.json[rc] / .tartarus
6. Fixed tests (30 files) — aligned fixtures to tartarus naming:
   - opencode.json[rc]→tartarus.json[rc]; .opencode dir→.tartarus (directory-path
     contexts ONLY via regex `.opencode(?=["/])`; provider-key accesses
     `providerOptions?.opencode` and api/console.opencode.ai hosts LEFT INTACT — they
     are identifiers, not branding paths).
   - agent.test.ts: 'all primaries disabled' now also disables g0dm0d3 (primary) +
     parseltongue (all) — TARTARUS pantheon SEED agents add them (they come from seed
     files, not agent.ts, which is why agent.ts was unchanged).
   - tui.test.ts: `await TuiConfig.waitForDependencies()` in the plugin-merge test to
     stop async install racing past tmpdir disposal (latent isolation bug, now exposed).
7. Committed (2 commits, tree clean):
   - 9722d84175 — test alignment + source branding completion (38 files)
   - f3df349fe1 — housekeeping: bun.lock ghostty-web ref bump, .omo/ skills, prior handoff

CURRENT STATE
-------------

- branch 2.0 @ f3df349fe1, clean tree, 2 ahead of origin/2.0 (unpushed).
- Test status (from packages/opencode):
  - agent+config+provider+plugin+mcp+file: **662 pass / 0 fail / 10 skip**
  - session(compaction/prompt/system)+cli/error+util/filesystem+theme-store:
    **115 pass / 0 fail**
  - typecheck: green (tsgo --noEmit, exit 0)
- Remaining failures are ENVIRONMENTAL, not fork regressions:
  - test/skill (11 fail): host has real `~/.claude/skills` + `~/.agents/skills`
    (20+ skills incl. godmode) that pollute `it.live` global-scan tests (e.g. a test
    expecting "global-test-skill" receives "godmode"). These fail on any populated host.
  - test/tool/write "sensitive data" (1 fail): checks mode 0o644, umask-dependent.

PENDING TASKS (ordered)
-----------------------

1. Decide whether to PUSH origin/2.0 (2 commits ahead). Not pushed this session.
2. Merge decision for upstream/dev (10,404 behind): preserve-first merge (keep our 20
   commits, resolve modify/delete in our favor, layer upstream tree) vs rebase our
   commits onto dev. Neither attempted — only dry-run measured. Engine patches are
   re-implement-only (see AGENTS.md base-drift note); tree was restructured upstream.
3. Optional: make skill/tool `it.live` tests hermetic (isolate HOME / set umask) so the
   suite is green on this host. Purely test-harness hardening; not fork correctness.
4. Pick up substantive mission from docs/NEXT-SESSION.md item 9 (eval/scorer
   calibration / stimulus expansion / GSM8K canary / 30B-driver queue).

KEY FILES
---------

- docs/NEXT-SESSION.md — mission briefing; item 9 is the active work queue (do NOT overwrite)
- docs/NEXT-SESSION-branding-alignment.md — THIS handoff
- docs/NEXT-SESSION-handoff.md — prior (review-framed) handoff, committed f3df349fe1
- packages/opencode/src/config/{config,tui,tui-migrate,paths}.ts — config branding
- packages/opencode/src/plugin/install.ts, src/cli/cmd/{plug,mcp}.ts — write-side branding
- packages/opencode/test/** — 30 aligned test files
- .omo/skills/*.md — newly version-controlled per-project skills library

IMPORTANT DECISIONS
-------------------

- User chose A) align tests to tartarus (NOT revert branding) — the fork identity is
  the point; tests must match it.
- Rename scope discipline: only config DIRECTORY paths (.opencode/, .opencode").
  Provider keys (providerOptions?.opencode) and external hosts (api/console.opencode.ai,
  brew/scoop opencode.json URLs) are identifiers/artifacts, left intact.
- Commit both bun.lock and .omo/ per explicit user instruction.
- No push performed; no upstream merge performed.

EXPLICIT CONSTRAINTS
--------------------

- "To regenerate the JavaScript SDK, run ./packages/sdk/js/script/build.ts."
- "ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE."
- "The default branch in this repo is dev." (TARTARUS active development is branch 2.0)
- "Prefer automation: execute requested actions without confirmation unless blocked by
  missing info or safety/irreversibility."
- "Tests cannot run from repo root (guard: do-not-run-tests-from-root); run from package
  dirs like packages/opencode."
- "Always run bun typecheck from package directories (e.g. packages/opencode), never tsc."
- Never put gateway keys or secrets into battery commands, files, or context.

CONTEXT FOR CONTINUATION (GOTCHAS)
----------------------------------

- Two upstream refs: `upstream/2.0` (dead anchor 7a6ce05) vs `upstream/dev` (live line).
  Fetching `dev` needs an explicit refspec: `git fetch upstream dev:upstream/dev`; a plain
  fetch lands in FETCH_HEAD only.
- The full `bun test` from packages/opencode is very slow (>5 min) — run targeted dirs.
- `.opencode`→`.tartarus` blanket replace is WRONG: it hits provider keys and API hosts.
  Use `.\.opencode(?=["/])` (directory strings only).
- TARTARUS pantheon agents (azazel, eris, g0dm0d3, nyx, parseltongue, phoebe, typhon)
  come from SEED files, not agent.ts. g0dm0d3 is primary; parseltongue is mode "all".
  Tests assuming only build/plan are primary must disable these too.
- skill/tool `it.live` failures are host-state (global skills, umask), not code.
- Citation trap: Arditi refusal-direction = arXiv 2406.11717; 2407.21439 is a reranker.
- OpenMemory: when openmemory_* MCP tools absent, use stateless JSON-RPC at
  http://localhost:8081/mcp (initialize → tools/list → tools/call openmemory_store).

(End of file)
