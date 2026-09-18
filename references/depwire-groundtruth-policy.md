# Depwire / GroundTruth Development-Intelligence Policy

Status: source policy, 2026-08-22.

## Authority and sequence

The existing LAH authority remains in force:

`RESOLVE → PLAN → EXECUTE → VERIFY → PERSIST → REPORT`

Depwire is a read-oriented development-intelligence capability. It does not
choose repositories, authorize mutations, replace tests, or establish business
truth. Native source and test evidence wins when evidence disagrees.

For a qualifying code change:

1. Resolve the canonical repository with the existing router.
2. Inspect load-bearing source natively.
3. Connect Depwire to the trusted local checkout.
4. Query architecture/dependencies and impact.
5. Separate required fix files, verification files, transitive files, and unrelated files.
6. Plan the minimal change, then execute.
7. Run tests; optionally use supported Depwire change verification; run required regressions.

## Activation

The policy classifier is `scripts/depwire-workflow-policy.cjs`.

- `MUST`: cross-file refactor; shared/core module; public or internal API
  contract; database abstraction; dependency injection; module boundary; shared
  utility with multiple consumers; exported symbol removal/rename; migration
  affecting callers; multiple subsystems; explicit blast-radius request; or
  unknown/incomplete blast radius.
- `SHOULD`: three or more likely production files; multiple test surfaces; many
  callers; unfamiliar architecture; directory boundary crossing; or materially
  non-local regression risk. Skip only with a concise evidence-based reason.
- `MUST_NOT`: typo, comment-only, documentation-only, formatting, isolated
  constant, known one-line local bug, non-code artifact, or trivial test-only
  change, unless dependency information is specifically required.

Depwire failure has a safe fallback: native inspection plus tests, with the
unavailability recorded. It does not justify inventing graph results.

## Repository safety

Depwire analyzes trusted local repositories only. It must not automatically
clone or fetch an arbitrary URL supplied by agent-generated input. A governed
Git mechanism may first obtain a trusted checkout; only then may Depwire
analyze it. This contains the known transitive `simple-git` and `ws` security
debt without applying overrides, patches, forks, or silent upgrades.

## Security and update watch

Current approved pin: `depwire-cli=1.16.0`. Known findings remain tracked:

- `simple-git=3.35.2`, CVE-2026-6951 / GHSA-hffm-xvc3-vprc;
- vulnerable transitive `ws` versions, including the previously audited
  CVE-2026-45736 / GHSA-58qx-3vcg-4xpx and CVE-2026-48779 / GHSA-96hv-2xvq-fx4p.

No `npm audit fix`, force fix, dependency override, manual node_modules patch,
fork, or silent upgrade is permitted. At existing startup/maintenance audit
points, report the installed version, available upstream version, Truecopy
fingerprint, and known security state. An update requires changelog review,
dependency verification, benchmark regression, deliberate Truecopy
re-fingerprinting, and explicit approval. Never auto-upgrade.

## GroundTruth probation

GroundTruth 7.5.0 is optional specialist evidence, never authority. Exactly
three distinct, real, version-sensitive canaries are required. For each:

1. Record the native conclusion from repository files, installed versions,
   lockfiles, local types, and available repository documentation.
2. Query GroundTruth.
3. Record tool, query, returned source, relevance, version relevance, new
   information, contradiction, and uncertainty reduction.
4. Score each dimension from 0 to 2: source relevance, version specificity,
   new information, uncertainty reduction, actionability.

Decision is mechanical:

- average `>= 7` and at least two materially useful canaries:
  `PROVEN_USEFUL`;
- average `>= 4` and below 7:
  `OPTIONAL_SPECIALIST`;
- average `< 4`, or zero materially useful canaries:
  `NO_PROVEN_VALUE`, followed by clean removal from Codex and fresh startup
  verification.

