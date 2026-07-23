---
name: lah-workflow
description: "Use when executing a gated LAH Stack mission: CodeGraph → AutoResearch → Superpowers plan → FastSafe gate → BR28 preflight → implémentation → tests → PR → merge → verify → memory lock. Trigger words: LAH Stack mission, gated orchestration, gouverné, workflow LAH."
---

# LAH Workflow — Gated Orchestration

Use this every time you execute a structured LAH Stack mission: new feature, sub-mission, or correction — always governed.

A **gate** is a checkable step. The **gate-pass** is the condition that says it's done. Don't advance before the pass is green. If a gate-pass is fuzzy, the gate needs sharpening, not skipping.

---

## Skills Branch Table

These skills are available in the Hermes session — **load them at the right gate** when the trigger fires:

| Branch | Skill | Gate | Trigger |
|--------|-------|------|---------|
| **Design sharpening** | `grill-me` / `grill-with-docs` | Before Gate 3 (Plan) | Design is fuzzy, scope needs tightening, trade-offs unclear |
| **Background research** | `research` | At Gate 2 (AutoResearch) | Complex context needed — delegate reading to a background agent |
| **Test-first** | `test-driven-development` (Matt Pocock's `/tdd`) | At Gate 5 (Impl) | Function has clear success criteria, prefer RED→GREEN→REFACTOR |
| **Bug diagnosis** | `diagnosing-bugs` | At Gate 6 (Tests) | Tests fail and the bug resists a first glance |
| **Code review** | `code-review` (Matt Pocock's 2-axis) | At Gate 6 (Vérification) | A diff to review against spec + coding standards |
| **Router** | `ask-matt` | Any | Uncertain which skill fits — `ask-matt` names the right one |
| **Session handoff** | `handoff` | Any | Context nearing token limit — compact and continue in a fresh thread |

Superpowers plugin skills are also available as `superpowers:<name>` (see Gate 3).

---

## Prerequisites

- **Repos:**
  - `lah-stack-tools` → `/home/deploy/lah-stack-repos/lah-stack-tools`
  - `lah-stack-biz-assets` → `/home/deploy/lah-stack-repos/lah-stack-biz-assets`
  - `cartelogic-v2` → `/home/deploy/lah-stack-repos/cartelogic-v2`
- **CodeGraph:** `node tools/codegraph/check-codegraph-availability.mjs --json` (in lah-stack-tools)
- **Branch:** `git status --short && git branch --show-current && git rev-parse --short HEAD`

---

## Gate 1 — CodeGraph (Cartographie)

**Gate-pass:** Every impacted module explored with `codegraph_explore` (explicit `projectPath`). Architecture, dependencies, and integration points mapped. No module skipped by approximation.

```javascript
codegraph_explore({
  query: "concept or symbol name",
  projectPath: "/home/deploy/lah-stack-repos/lah-stack-tools",
  maxFiles: 12
});
```

---

## Gate 2 — AutoResearch (Contexte read-only)

**Gate-pass:** Internal context (past sessions, assets) and external context (web, niche) collected. Risks and constraints identified. No live mutations. Results documented and available for the plan.

**Branch — `research`:** If the question spans primary sources (API docs, specs, competitor sites, academic papers), load `research` — it delegates reading to a background agent and leaves a cited Markdown file. Keep working while it reads.

Methods:
- **Web search** for market, competition, regulation
- **Session search** for past decisions and patterns
- **Docs** for existing assets

---

## Gate 3 — Superpowers Plan (Spécification)

**Gate-pass:** Plan written at `docs/superpowers/plans/YYYY-MM-DD-mission-name.md`. Scope, target modules, tests, and FastSafe invariants documented. Continuity JSON template included. Validated against AutoResearch results.

**Branch — `grill-me` / `grill-with-docs`:** If the design is still fuzzy — scope unclear, trade-offs unresolved, edge cases unnamed — load `grill-me` first. `grill-with-docs` leaves ADRs and a glossary; use it when this repo should retain the design rationale. Only then write the plan.

The plan includes:
- **Mission** — name and objective
- **Scope** — in-scope AND out-of-scope (from AutoResearch results)
- **CodeGraph** — modules to inspect
- **Sub-agents** — if >3 modules, plan parallel lanes (max 3 per batch)
- **FastSafe** — flags that must stay `false`
- **Tests** — how many, key assertions
- **Continuity JSON** — template for the final record

**Superpowers skills:** Cat `~/.hermes/plugins/superpowers/skills/<name>/SKILL.md` — not `skill_view`.

---

## Gate 4 — FastSafe Gate (Sécurité)

**Gate-pass:** 15 checks executed individually. Zero failures. Report signals `FASTSAFE_PASS` or lists blocked checks with reasons.

**Does not pass = mission stops.** No implementation phase without a green FastSafe.

| # | Check | Enforce |
|---|-------|---------|
| 1 | No public publish | `publish_allowed` is `false` on all assets |
| 2 | No WordPress publish status mutation | No code calling `wp.publish()` or `status: "publish"` |
| 3 | No BIZ17 publication mission | Verify scope — don't execute publication missions |
| 4 | No deploy | No deploy scripts/commands |
| 5 | No scheduler activation | No cron/scheduler config |
| 6 | No Telegram live calls | No Telegram API calls |
| 7 | No provider calls | No paid provider calls |
| 8 | No LLM generation calls | No non-essential LLM — read-only provider inference for benchmark validation is ALLOWED under no-live-action governance |
| 9 | No ad spend | No budget references |
| 10 | No live affiliate link injection | No live affiliate links |
| 11 | No force push | Standard `git push` only |
| 12 | No secrets printed | Verify files have no hardcoded secrets |
| 13 | No `git add .` | Staging ciblé only |
| 14 | No memory overwrite/collapse | Append-only to `operational_memory.jsonl`, no `rm`/`truncate`/`wipe` |
| 15 | No destructive migration | No migration scripts that alter existing memory stores |

---

## Gate 5 — Implementation (Construction)

**Gate-pass:** BR28 preflight passed (dry-run). Tests written (RED). Code implemented (GREEN). No live mutations, no provider calls. Simulated rollback verifiable.

1. **Load BR28 preflight:** `skill_view(name='br28-implementation-orchestration')` — executes dry-run safety, progressive gates, local evidence, simulated rollback.

2. **Branch — `test-driven-development`:** If the function has clear success criteria, load `tdd` (RED→GREEN→REFACTOR). Each slice is a single behaviour, tested before code.

3. **Safety constants** — use the strict pattern:
   ```javascript
   const SAFETY = Object.freeze({
     public_publish: false, wordpress_mutation: false,
     provider_calls: false, telegram_send: false,
     scheduler_enabled: false, approval_bypass: false, fail_closed: true,
   });
   ```

4. **Kill switch OC29** — must be `enabled: false` for tests:
   ```bash
   mkdir -p tools/control-plane/data
   echo '{"enabled":false,"reason":"operator_seeded_disabled","updated_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > tools/control-plane/data/autonomy-kill-switch.jsonl
   ```

5. **Module structure** — load `pattern-based-codebase-extension` and `lah-stack-cli-cockpit` for conventions.

6. **Test structure** — each test file: `cleanAll()` then `seedKillSwitch()`:
   ```javascript
   function cleanAll() {
     try { rmSync(DATA_DIR, { recursive: true, force: true }); } catch {}
     try { rmSync(join(__dirname, '..', 'runs'), { recursive: true, force: true }); } catch {}
     seedKillSwitch();
   }
   function seedKillSwitch() {
     // writes autonomy-kill-switch.jsonl with enabled:false
   }
   ```

7. **CLI integration points:** import → handler → help text → switch case — see `pattern-based-codebase-extension` for the convention.

---

## Gate 6 — Tests & Vérification

**Gate-pass:** Targeted tests pass. `node --test --test-concurrency=1` passes (only 2 pre-existing failures: `lah-core mission does not block on cartelogic codegraph absence` + `BW11 — validateBW11NotificationGate returns fail-closed without approval`). `git diff --check` clean. No new regressions.

```bash
node --test --test-concurrency=1    # always use --test-concurrency=1 (shared data/)
git diff --check                     # whitespace check
```

**Branch — `diagnosing-bugs`:** If tests fail and the bug resists a first glance — intermittent flake, regression between known-good states — load `diagnosing-bugs`. It refuses to theorise until it has a tight feedback loop (one command that goes red on *this* bug).

**Branch — `code-review`:** Review the diff on two axes: coding standards + spec compliance. Load `code-review` which runs both reviews in parallel sub-agents and reports side by side.

---

## Gate 7 — Operator Packet

**Gate-pass:** Document produced answering: (1) what's ready, (2) what's blocked (needs operator approval), (3) what remains to be done. Reference: `references/operator-packet-format.md` (see linked files below).

---

## Gate 8 — Commit

**Gate-pass:** Staging ciblé (no `git add .`). Commit message starts with mission code (e.g. `BW29`). Clean `git diff --check`.

```bash
git add <files-one-by-one>
git commit -m "TAG description"
git rev-parse --short HEAD
```

---

## Gate 9 — PR & Merge

**Gate-pass:** Branch pushed, PR created, merged. Merge method depends on repo:

- **lah-stack-tools** — feature branch → PR → merge (`gh pr merge --squash --delete-branch`)
- **cartelogic-v2** — push direct on shared branch (after integrity: verify, remote check, operator approval)
- **Multi-repo** — same branch name per repo, push all first, PR per repo, merge in dependency order

**After merge:** `git checkout master && git pull && node --test`.

Reference: `references/git-workflow-detail.md` (linked below) for worktrees, cherry-pick, LOCAL_CI_VERIFIED merge policy, and stash recovery.

---

## Gate 9.5 — Operator Testing (Optionnel)

Entre le merge et le memory lock, une validation réelle contre l'environnement déployé. **Recommandé** pour toute mission qui touche des endpoints live (WordPress, gateway, provider).

**Gate-pass:** Tous les smoke checks passent contre le déploiement. Zéro 5xx, zéro timeout. Rapport documenté incluant les checks passés et les anomalies.

Voir `references/operator-testing-gate.md` pour la procédure complète, templates de scripts (smoke.sh, k6), et catalogue d'outils par niveau de complexité.

---

## Gate 10 — Memory Lock (Hermes)

**Gate-pass:** Memory updated with compact summary: completed missions, SHA, gate status, test count, FastSafe flags.

```javascript
memory({
  action: 'replace',
  target: 'memory',
  old_text: '<old-entry-substring>',
  content: 'Short summary: missions, SHAs, gate status, tests, FastSafe.'
});
```

---

## Gate 11 — Continuity JSON (Final)

**Gate-pass:** Continuity JSON written and validated (parse + cross-file consistency). Memory lock done. Next mission can start on this foundation without re-discovery.

Write to `docs/mcporter/<MISSION>_CONTINUITY_V1.json`. See `templates/continuity-json-template.json` for the exact schema and `references/continuity-json-schema-pitfalls.md` for known traps (volatile field naming, sort-by-timestamp not sort-by-mission).

---

## Sub-agents (Parallel Work)

`delegate_task` max 3 per call. For 4--6 lanes, split into 2 sequential batches.

### Batch 1 — Discovery (3 lanes)

| Lane | Focus | Output |
|------|-------|--------|
| **A — Architecture** | CodeGraph with projectPath | Module map, integration points, dependencies |
| **B — Asset & Scope** | Inventory of assets, registries, states | Priority catalog |
| **C — Safety & Quality** | Secret scan, prohibited content, niche compliance | Security checklist |

### Batch 2 — Construction (3 lanes)

| Lane | Focus | Output |
|------|-------|--------|
| **D — Registry & Schema** | Data schemas, registry updates, scorecard rules | JSON Schema, JSONL ledgers |
| **E — CLI & Operator** | CLI implementation (dry-run default), documentation | Operator docs |
| **F — Tests & Lock** | Verification plan, continuity JSON | Test plan, memory lock |

**Context rule:** Every sub-agent gets full context — it has zero access to parent memory. Include: exact paths, existing patterns, safety invariants, expected output format. Nothing left to guessing.

---

## Pièges — Known Traps

| Trap | Symptom | Fix |
|------|---------|-----|
| **Kill switch lost** | `cleanAll()` deletes `data/`, kill switch OC29 gone | Always `seedKillSwitch()` after `cleanAll()` in tests |
| **Memory dual-track** | 524 JSONL records ≠ 62 lock files | Signale les DEUX. JSONL = running ledger, `.json` = milestone checkpoints |
| **JSONL overwrite** | `>` instead of `>>` | Append-only strict. `python3 -c "..." >> operational_memory.jsonl` |
| **Stash on wrong branch** | Files appear as `DU` (Deleted/Unmerged) | `git rm --cached <files>` |
| **Scope integrity** | Agent declares required steps "out of scope" | Ne pas court-circuiter. Gate non passée = mission incomplète |
| **Narrative ≠ verdict** | Rapport qualitatif écrase le verdict d'un moteur | Verdicts moteur = source de vérité. Opinions = commentaires |
| **Failure accounting** | "11 cas échoués" au lieu de "11 assertions échouées dans 1 cas" | Signale les deux nombres séparément |

---

## Communication Adaptative

Caveman levels by phase (loaded from `caveman` skill):
- **NORMAL** — arch/design/plan/risk (Gate 1--3)
- **LITE** — FastSafe, progress, operator tests, memory lock (Gate 4--6, 9.5, 10)
- **FULL** — tests, PR, merge, continuity (Gate 6--9, 11)

---

## Linked References

The following reference files live in `references/` under this skill's directory. Load them by name when the gate description tells you to, or when you need the specific pattern:

- `references/operator-testing-gate.md` — Gate 9.5: post-merge smoke tests, k6, tool catalog
- `references/git-workflow-detail.md` — worktrees, cherry-pick, LOCAL_CI_VERIFIED merge, stash recovery
- `references/operator-packet-format.md` — full operator packet template
- `references/continuity-json-schema-pitfalls.md` — volatile field naming, sort traps, fix conventions
- `references/memory-jsonl-repair-pattern.md` — repairing operational_memory.jsonl records
- `references/orchestration-engine-implementation-pattern.md` — 7-module orchestration engine
- `references/live-local-validation-trial.md` — approved local live validation (Gate 6 option)
- `references/index.md` — complete catalog of all 27 reference files

---

## Scripts

| Script | Usage |
|--------|-------|
| `scripts/strategic-benchmark-diagnostics.mjs` | Provider-backed 9-question benchmark + V3 strategic certification gate |
