# Dynamic Codex Skill Catalog Resolution Design

**Mission:** `LAH_CODEX_DYNAMIC_SKILL_CATALOG_RESOLUTION_AND_STALE_PATH_ELIMINATION_P0_V1`

**Decision:** Keep Codex core as runtime skill-discovery authority. Repair LAH instructions so they consume the active session catalog's exact `file:` reference and root-alias table. Do not add a second resolver, copy plugin skills, install plugins, or alter caches.

## Contract

1. Logical skill identity is lookup input only.
2. The active session catalog entry is the only runtime discovery record.
3. The catalog-declared `file:` reference is authoritative.
4. Root aliases expand only through the current session root table.
5. Namespace, plugin name, plugin version, and filesystem order never construct a path.
6. Missing declared files fail closed as `SKILL_CATALOG_PATH_STALE`; no alternate copy is selected.
7. Independent skill loads return per-skill results. Optional failures do not abort later loads; required failures produce `REQUIRED_SKILL_UNRESOLVED`.
8. LAH canonical skill repositories remain source/governance authorities, separate from current-session runtime discovery.

## Owning boundary

The lowest editable boundary found is the LAH workflow skill's runtime-loading instruction. Codex core supplies the dynamic catalog and plugin cache roots outside this repository. The repair therefore removes active hardcoded loader guidance and codifies the handoff contract; it does not pretend to control upstream Codex path construction.

## Verification

The test harness uses synthetic catalog records to exercise the contract and scans active source for forbidden path fabrication. Fresh-session verification records the current catalog references and tests mixed-root loading in the current session. Historical logs, memory, plugin caches, and installed copies remain untouched.
