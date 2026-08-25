# LAH Governed Mission Design

## Goal
Replace the contradictory global lah-workflow concept with a small governed mission skill that classifies work, resolves authority, selects one mission-specific branch, verifies independently, and emits a receipt.

## Architecture
lah-governed-mission is orchestration-only. It owns no Git-hosting, memory, deployment, runtime, or business-action policy. Those remain in their authoritative guards or specialist skills.

Flow: classify -> resolve authority -> load required skills -> branch execution -> independent verification -> receipt.

## Mission types
- READ_ONLY_AUDIT: inspect and report; no implementation, commit, PR, deployment, or external mutation.
- DESIGN_ONLY: research/design artifact only; no production mutation.
- CODE_CHANGE: isolated implementation with TDD and verification; Git integration only when explicitly authorized by repo policy and mission.
- PROMOTION_DEPLOYMENT: promote or deploy already-approved artifacts through declared authority with readback; no rediscovery or unrelated code changes.

## Invariants
- Active session skill catalog is runtime discovery authority.
- Never derive skill filesystem paths from namespace, plugin name, version, or historical location.
- Required skill unresolved fails closed; optional unresolved never aborts later valid loads.
- Canonical repo/runtime authority must be proven before mutation.
- Dirty state is preserved.
- No global narrative action policy; specialized guards decide privileged actions.
- No Hermes-only primitives in the generic skill.
- No repo-specific branch names, CI exceptions, provider rules, or historical test failures.
- Certification requires fresh evidence appropriate to the branch.

## Success
A reader can determine the correct branch and its gates without inheriting unrelated mutation rules. The skill remains small enough to audit as a policy surface.
