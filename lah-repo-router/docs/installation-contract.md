# Installation contract

`sync-installations.cjs` is the only supported installation path. It is dry-run by default and requires `--apply` to write.

The target roots are validated against the expected Hermes and Codex paths before any write. Only the declared router artifacts are copied. The command verifies source hashes before copying, target hashes after copying, and writes a secret-free `install-provenance.json` only after verification.

The provenance receipt records the Git commit, mapping fingerprint, schema version, installation timestamp, and post-install certification status. `validate-installation-drift.cjs` compares Git source, Hermes, and Codex and reports `NO_DRIFT`, `INSTALLATION_DRIFT`, `SOURCE_DRIFT`, `MISSING_ARTIFACT`, `UNEXPECTED_ARTIFACT`, or `SEMANTIC_DRIFT`.

Fingerprint procedure: SHA-256 of the raw bytes of `references/repo_mappings.json`. A legitimate mapping change must update the source contract through a deliberate review; no installation-local fingerprint is authoritative.
