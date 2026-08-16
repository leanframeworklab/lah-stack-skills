# LAH Repo Router v4 architecture

The Git tree `leanframeworklab/lah-stack-skills/lah-repo-router` is the source authority. It owns the machine-readable ontology, receipt schema, executable router, tests, and semantic documentation.

The Hermes installation is the execution authority at runtime. The Codex installation is a derived delegation skill. Neither installation-local copy is an independent routing source.

```text
operator mission
  -> Git canonical mapping/schema/engine
  -> validated installation sync
      -> Hermes execution authority
      -> Codex delegation skill
  -> structured v4 receipt
```

The v4 model resolves roles independently: implementation, execution runtime, governance, memory, context, skill knowledge, and business assets. `repository_authority` is retained only as a derived compatibility field. Different repositories in different roles are not a conflict. Write permission comes only from explicit mutation intent and a uniquely resolved owner.

Historical prefixes and aliases are contextual evidence only. Current ownership evidence wins. Explicit repository or path intent is preserved and checked against ownership; conflicting explicit targets fail closed. Archived OpenClaw memory is non-writable. Ontology conflicts are role-scoped for routing and global for certification.
