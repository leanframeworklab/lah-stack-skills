# Dynamic Codex Skill Catalog Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove active LAH instructions that fabricate Codex skill paths and certify catalog-authoritative, fail-closed, independent skill loading behavior.

**Architecture:** Codex core remains runtime discovery authority. `lah-stack-skills/SKILL.md` becomes a consumer contract: resolve logical IDs through the active catalog, expand declared aliases, and load each result independently. A test-only synthetic catalog harness verifies the contract without becoming a runtime resolver.

**Tech Stack:** Markdown contract, Node.js CommonJS test script, Git worktree, shell verification.

**Spec:** `docs/superpowers/specs/2026-08-25-codex-skill-catalog-resolution-design.md`

## Global Constraints

- Never guess `~/.codex/skills/<name>` for plugin skills.
- Never treat `r8` or `namespace:skill` as filesystem directories.
- Never hardcode plugin versions or infer plugin provenance.
- Missing catalog paths return `SKILL_CATALOG_PATH_STALE` and never fall back to another copy.
- Optional load failure must not prevent later independent loads.
- Preserve dirty checkouts, caches, installed copies, historical logs, and memory.
- No symlinks, plugin reinstall, manual skill copy, deployment, or parallel runtime resolver.

### Task 1: Establish spec and isolated baseline

**Files:**
- Create: `docs/superpowers/specs/2026-08-25-codex-skill-catalog-resolution-design.md`
- Create: `docs/superpowers/plans/2026-08-25-codex-skill-catalog-resolution-p0.md`

- [x] Create isolated branch from clean canonical HEAD.
- [x] Record baseline status and source authority.
- [x] Review plan against mission requirements before code changes.

### Task 2: Add RED catalog-contract tests

**Files:**
- Create: `scripts/test-codex-skill-catalog-contract.cjs`

**Interfaces:** Test-only `resolveFromCatalog(catalog, logicalId)` and `loadIndependently(catalog, requests)` model the declared contract. They must never read the filesystem or search alternate roots.

- [x] Write tests for local, system, versioned plugin, other plugin, duplicate logical IDs, namespace rejection, alias expansion, version changes, wrong-root rejection, stale paths, no cross-agent fallback, optional isolation, and required fail-closed behavior.
- [x] Run `node scripts/test-codex-skill-catalog-contract.cjs` and confirm RED because the active workflow still contains the hardcoded Hermes loader instruction.

### Task 3: Repair active workflow consumer

**Files:**
- Modify: `SKILL.md:123-139`

- [x] Replace the Hermes-specific `cat ~/.hermes/plugins/...` instruction with the catalog contract.
- [x] State exact declared `file:` reference and current root-alias expansion as authoritative.
- [x] State independent optional/required load behavior and explicit stale error.
- [x] Run the focused test and confirm GREEN.

### Task 4: Census and verification

**Files:** No additional production files.

- [x] Run focused test, routing/drift checks, and `git diff --check`.
- [x] Scan active source for forbidden path fabrication; classify historical/backups separately.
- [x] Capture current catalog matrix for mixed local/system/plugin/duplicate entries.
- [x] Attempt fresh controlled Codex mixed-root canary; network preflight proved `NETWORK_UNAVAILABLE_DNS`.
- [x] Review final diff against spec and mission receipt fields.
