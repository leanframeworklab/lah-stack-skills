# LAH Governed Mission Implementation Plan

> For agentic workers: implement task by task with fresh review gates.

Goal: Add a minimal lah-governed-mission skill replacing the reusable core of lah-workflow without inheriting its contradictions.

Architecture: One declarative SKILL.md classifies missions into four branches and defines only cross-cutting gates. A contract test rejects legacy/global policy leakage and validates branch semantics.

Spec: docs/superpowers/specs/2026-08-25-lah-governed-mission-design.md

Tasks:
1. Add a RED contract test for frontmatter, mission types, gates, catalog resolution, and forbidden legacy primitives.
2. Add the minimal SKILL.md and make the contract GREEN.
3. Run contract test and git diff --check; commit only the new skill, spec, plan, and test.
