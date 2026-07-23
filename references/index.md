# Fichiers de référence — lah-workflow

Ce fichier liste l'ensemble des fichiers de référence attachés au skill lah-workflow. Consulte-les par besoin, pas par lecture séquentielle.

## Patterns openclaw-runtime

- `references/openclaw-runtime-mission-pattern.md` — PR workflow, LOCAL_CI_VERIFIED merge, CLOE architecture missions, admin merge exceptions, worktree gestion, memory lock PRs, CLOE operational assistant stack
- `references/cloe-batch-b-and-full-loop-pattern.md` — Batch B (4-slice), Full Assistant Loop, Design Gate
- `references/cloe-behavior-improvement-sprint-pattern.md` — Score-gated sprints, behavioral validation runner, regression gates
- `references/cloe-strategic-benchmark-certification-pattern.md` — Strategic vs technical certification, 10 criteria, scoring model
- `references/cloe-architecture-gate-and-runtime-trace-pattern.md` — Architecture Gate (docs-first) and Runtime Trace (9 diagnostic prompts)
- `references/cloe-reasoning-context-pipeline-pattern.md` — Gateway → CLOE → Envelope → Brain Context → LLM pipeline
- `references/cloe-user-facing-answer-renderer-pattern.md` — Strip internal artifacts, NORMAL/DEBUG modes
- `references/cloe-project-knowledge-source-pattern.md` — Bounded read-only file access, 9 knowledge targets
- `references/cloe-reasoning-context-roadmap-pattern.md` — Reasoning context roadmap
- `references/cloe-roadmap-completion-and-certification-pattern.md` — Roadmap completion and certification
- `references/cloe-runtime-integration-and-certification-pattern.md` — 6-phase CLOE runtime integration
- `references/cloe-operational-validation-pattern.md` — 9-phase operational validation after certification
- `references/deterministic-cognitive-provider-injection-pattern.md` — Inject V5 decision pipeline output into provider inference

## Patterns mémoire (cartelogic-v2)

- `references/memory-jsonl-repair-pattern.md` — Réparation des records operational_memory.jsonl
- `references/mem0-controlled-write-preflight-revalidation.md` — Controlled write preflight revalidation
- `references/mem0-observability-layer-pattern.md` — Local observability layer design
- `references/continuity-json-schema-pitfalls.md` — Pièges de schéma JSON de continuité

## Patterns infrastructure

- `references/crawl4ai-docker-bind-pitfall.md` — Crawl4AI container bind issue
- `references/live-local-validation-trial.md` — Validations live locales approuvées
- `references/protocol-based-pluggable-storage.md` — Backend durable JSONL pattern
- `references/brain-path-discovery-pattern.md` — Endpoint LLM gouverné dans écosystème multi-repo
- `references/provider-brain-path-diagnostics-pattern.md` — Provider brain path diagnostics

## Patterns CI / PR

- `references/gha-pr-creation-pattern.md` — PR avec cherry-pick sélectif, stash pop, merge
- `references/orchestration-engine-implementation-pattern.md` — Moteur d'orchestration modulaire 7-module

## Patterns git et opérateur

- `references/git-workflow-detail.md` — Worktrees, cherry-pick, LOCAL_CI_VERIFIED merge, stash recovery, multi-repo coordination
- `references/operator-packet-format.md` — Template et structure du operator packet (Gate 7)
- `references/operator-testing-gate.md` — Gate 9.5 : smoke tests post-merge, k6, catalogue d'outils de validation opérateur

## Patterns métier

- `references/lah-cognitive-quality-roadmap-pattern.md` — LAH Cognitive Quality Assurance Roadmap (9 phases)
- `references/gateway-routing-fix-pattern.md` — Gateway routing fix pattern
