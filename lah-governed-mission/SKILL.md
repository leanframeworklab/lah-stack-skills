---
name: lah-governed-mission
description: "Use for governed LAH missions that need explicit mission classification, canonical authority resolution, branch-specific gates, independent verification, and a structured receipt without inheriting repo-, provider-, or agent-specific policy."
category: software-development
---

# LAH Governed Mission

A small orchestration contract for structured LAH work.

This skill does **not** own repository routing rules, Git policy, deployment authority, provider policy, memory policy, CI exceptions, or runtime-specific safety rules. Load those from their current authoritative skills, guards, or repository instructions only when the selected mission branch requires them.

## Core flow

`Classify mission -> Resolve authority -> Load required skills -> Execute one branch -> Independent verification -> Final receipt`

Do not force every mission through implementation, commit, PR, merge, deployment, or memory steps.

## Gate 0 — Classify mission

Choose exactly one mission type from the user request and current evidence:

- `READ_ONLY_AUDIT`
- `DESIGN_ONLY`
- `CODE_CHANGE`
- `PROMOTION_DEPLOYMENT`

If the mission spans materially different types, decompose it into bounded phases and classify each phase explicitly. Do not silently upgrade an audit into a mutation mission.

## Gate 1 — Resolve authority

Before repository-dependent work:

1. Resolve the canonical repository or runtime authority using the current router, runtime index, repository instructions, and direct readback as applicable.
2. Verify the intended workspace, branch, HEAD, and dirty state.
3. Preserve unrelated dirty state.
4. Before any mutation, prove that the selected authority owns that mutation.

If authority is ambiguous, stop with `BLOCKED_CANONICAL_AUTHORITY_UNRESOLVED`.

## Gate 2 — Resolve skills

The **Active session skill catalog** is runtime discovery authority.

For each required logical skill:

1. Use its current catalog entry.
2. Use the exact declared `file:` reference and current root table.
3. Never derive a filesystem path from namespace, plugin name, version, historical path, or another agent runtime.
4. Load skills independently.

Required failure:

`REQUIRED_SKILL_UNRESOLVED`

Optional failure:

`OPTIONAL_SKILL_UNRESOLVED`

An optional failure must not abort later valid loads. A required failure fails closed.

If a catalog-declared file is absent, return `SKILL_CATALOG_PATH_STALE`. Do not search the filesystem for another copy.

## Gate 3 — Execute exactly one branch

### READ_ONLY_AUDIT

Use for diagnosis, architecture mapping, inventory, business truth reconstruction, governance review, or evidence gathering.

Required behavior:

- no implementation
- no commit or PR
- no deployment
- no runtime/provider/external mutation
- inspect the actual current authority instead of relying only on historical reports
- distinguish observed facts, inference, unknowns, and blockers
- produce evidence-backed findings and a receipt

### DESIGN_ONLY

Use when the requested deliverable is a design, architecture decision, implementation plan, migration strategy, or specification.

Required behavior:

- inspect enough current context to avoid designing against stale topology
- define scope, interfaces, invariants, risks, and verification criteria
- create only explicitly requested design artifacts
- no production/runtime mutation
- do not convert design approval into implementation authority

### CODE_CHANGE

Use for a bounded feature, bug fix, refactor, or policy implementation.

Required behavior:

1. Work in the correct canonical or isolated workspace according to repository policy.
2. Preserve dirty state; use isolation when required.
3. Use TDD where behavior has testable success criteria: RED -> GREEN -> regression.
4. Make the smallest owning-layer change.
5. Run focused tests, relevant broader tests, and repository-specific checks.
6. Treat Git integration, PR, merge, and deployment as separate actions requiring current repository policy or explicit mission authority. They are not automatic gates.

### PROMOTION_DEPLOYMENT

Use when an already-reviewed artifact, commit, configuration, or runtime candidate must be promoted or deployed.

Required behavior:

1. Verify exact source identity, ancestry or provenance, and current declared authority.
2. Do not rediscover or redesign the implementation unless drift invalidates the certified artifact.
3. Execute only through the **declared authority**.
4. Preserve unrelated runtime and dirty state.
5. Perform exact post-action **readback** and source/runtime equivalence checks.
6. Fail closed on unexpected drift, target mismatch, or unverified identity.

## Gate 4 — Independent verification

Verification must be appropriate to the selected branch and independent of the implementation narrative.

Examples:

- audit: cross-check authoritative sources and evidence completeness
- design: consistency, ambiguity, and scope review
- code: focused tests, relevant regression suite, diff checks, behavioral canary where authorized
- promotion/deployment: runtime readback, identity/fingerprint equality, and no collateral mutation

Do not claim `FIXED`, `CERTIFIED`, `DEPLOYED`, `READY`, or equivalent without fresh evidence supporting that exact claim.

## Gate 5 — Final receipt

Every mission ends with a compact structured **Final receipt** containing, where applicable:

- `MISSION`
- `MISSION_TYPE`
- `VERDICT`
- `CANONICAL_AUTHORITY`
- `WORKSPACE`
- `HEAD_OR_SOURCE_ID`
- `ACTIONS_PERFORMED`
- `FILES_CHANGED`
- `TESTS_OR_EVIDENCE`
- `RUNTIME_READBACK`
- `DIRTY_STATE_PRESERVED`
- `KNOWN_LIMITATIONS`
- `BLOCKERS`
- `NEXT_RECOMMENDED_MISSION`

For fields not applicable to the selected mission type, use `NOT_APPLICABLE` rather than fabricating a value.

## Non-negotiable invariants

- Evidence before assertion.
- Authority before mutation.
- One branch per bounded phase.
- No hidden promotion from read-only to mutation.
- No guessed skill paths.
- No parallel authority created merely to bypass an existing guard.
- No historical exception hardcoded as permanent workflow policy.
- Repository-, provider-, memory-, deployment-, and business-specific rules belong to their owning authority, not this generic skill.
