#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const workflow = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf8');

function catalog(entries, roots) {
  return { roots, entries };
}

// Test-only model of the Codex contract. It intentionally does not search the
// filesystem and is not imported by runtime code.
function resolveFromCatalog(activeCatalog, logicalId) {
  const matches = activeCatalog.entries.filter((candidate) => candidate.id === logicalId);
  if (matches.length === 0) throw new Error(`SKILL_NOT_IN_ACTIVE_CATALOG:${logicalId}`);
  const entry = matches.find((candidate) => candidate.active === true) || (matches.length === 1 ? matches[0] : null);
  if (!entry) throw new Error(`SKILL_CATALOG_ENTRY_AMBIGUOUS:${logicalId}`);
  const declared = entry.file;
  const match = /^([a-z][a-z0-9]*)(?:\/(.*))?$/i.exec(declared);
  if (!match || !activeCatalog.roots[match[1]]) throw new Error('CATALOG_ROOT_ALIAS_UNKNOWN');
  const expandedPath = path.join(activeCatalog.roots[match[1]], match[2] || '');
  if (entry.exists === false) throw new Error('SKILL_CATALOG_PATH_STALE');
  return { logicalId, catalogFileRef: declared, expandedPath, sourceRoot: entry.sourceRoot, version: entry.version ?? null };
}

function loadIndependently(activeCatalog, requests) {
  return requests.map((request) => {
    try {
      return { id: request.id, required: request.required, result: resolveFromCatalog(activeCatalog, request.id), error: null };
    } catch (error) {
      return { id: request.id, required: request.required, result: null, error: error.message };
    }
  });
}

const roots = {
  r0: '/session/local/skills',
  r2: '/session/system/skills',
  r5: '/session/plugins/google-drive/0.1.11/skills',
  r6: '/session/plugins/hugging-face/1.0.0/skills',
  r8: '/session/plugins/superpowers/6.3.0/skills',
};
const entries = [
  { id: 'caveman', file: 'r0/caveman/SKILL.md', sourceRoot: 'ACTIVE_CODEX_RUNTIME', exists: true },
  { id: 'openai-docs', file: 'r2/openai-docs/SKILL.md', sourceRoot: 'ACTIVE_CODEX_RUNTIME', exists: true },
  { id: 'superpowers:using-superpowers', file: 'r8/using-superpowers/SKILL.md', sourceRoot: 'ACTIVE_CODEX_RUNTIME', version: '6.3.0', exists: true },
  { id: 'google-drive:google-docs', file: 'r5/google-docs/SKILL.md', sourceRoot: 'ACTIVE_CODEX_RUNTIME', version: '0.1.11', exists: true },
  { id: 'hugging-face:huggingface-datasets', file: 'r6/datasets/SKILL.md', sourceRoot: 'ACTIVE_CODEX_RUNTIME', version: '1.0.0', exists: true },
  { id: 'codebase-design', file: 'r0/codebase-design/SKILL.md', sourceRoot: 'ACTIVE_CODEX_RUNTIME', active: true, exists: true },
  { id: 'codebase-design', file: 'r2/codebase-design/SKILL.md', sourceRoot: 'ACTIVE_CODEX_RUNTIME', active: false, exists: true },
];

const activeCatalog = catalog(entries, roots);
const local = resolveFromCatalog(activeCatalog, 'caveman');
assert.equal(local.catalogFileRef, 'r0/caveman/SKILL.md');
assert.equal(local.expandedPath, '/session/local/skills/caveman/SKILL.md');

const system = resolveFromCatalog(activeCatalog, 'openai-docs');
assert.equal(system.expandedPath, '/session/system/skills/openai-docs/SKILL.md');

const superpowers = resolveFromCatalog(activeCatalog, 'superpowers:using-superpowers');
assert.equal(superpowers.expandedPath, '/session/plugins/superpowers/6.3.0/skills/using-superpowers/SKILL.md');
assert.equal(superpowers.version, '6.3.0');

const plugin = resolveFromCatalog(activeCatalog, 'google-drive:google-docs');
assert.equal(plugin.sourceRoot, 'ACTIVE_CODEX_RUNTIME');
assert.equal(plugin.expandedPath, '/session/plugins/google-drive/0.1.11/skills/google-docs/SKILL.md');

const changedVersion = catalog(
  [{ ...entries[2], file: 'r8/using-superpowers/SKILL.md', version: '6.4.0' }],
  { ...roots, r8: '/session/plugins/superpowers/6.4.0/skills' },
);
assert.equal(resolveFromCatalog(changedVersion, 'superpowers:using-superpowers').expandedPath, '/session/plugins/superpowers/6.4.0/skills/using-superpowers/SKILL.md');

assert.throws(() => resolveFromCatalog(activeCatalog, 'superpowers:using-superpowers/SKILL.md'), /SKILL_NOT_IN_ACTIVE_CATALOG/);
assert.throws(() => resolveFromCatalog({ roots, entries: [{ id: 'x', file: 'r9/using-superpowers/SKILL.md', exists: true }] }, 'x'), /CATALOG_ROOT_ALIAS_UNKNOWN/);
assert.throws(() => resolveFromCatalog({ roots, entries: [{ id: 'x', file: 'r8/using-superpowers/SKILL.md', exists: false }] }, 'x'), /SKILL_CATALOG_PATH_STALE/);

const duplicate = resolveFromCatalog(activeCatalog, 'codebase-design');
assert.equal(duplicate.catalogFileRef, 'r0/codebase-design/SKILL.md');
assert.equal(duplicate.expandedPath.includes('/claude/'), false);
assert.equal(duplicate.expandedPath.includes('/hermes/'), false);
assert.equal(duplicate.expandedPath.includes('/openclaw/'), false);
assert.throws(() => resolveFromCatalog({ roots, entries: entries.slice(-2).map((entry) => ({ ...entry, active: false })) }, 'codebase-design'), /SKILL_CATALOG_ENTRY_AMBIGUOUS/);

const independent = loadIndependently(activeCatalog, [
  { id: 'missing-optional', required: false },
  { id: 'openai-docs', required: false },
]);
assert.equal(independent[0].error, 'SKILL_NOT_IN_ACTIVE_CATALOG:missing-optional');
assert.equal(independent[1].result.expandedPath, '/session/system/skills/openai-docs/SKILL.md');

const required = loadIndependently(activeCatalog, [{ id: 'missing-required', required: true }]);
assert.equal(required[0].error, 'SKILL_NOT_IN_ACTIVE_CATALOG:missing-required');
assert.equal(required[0].required, true);

assert.doesNotMatch(workflow, /~\/\.hermes\/plugins\/superpowers\/skills\/<name>\/SKILL\.md/);
assert.doesNotMatch(workflow, /\/home\/deploy\/\.codex\/skills\/(?:superpowers|r\d+)/);
assert.match(workflow, /active session.*catalog/i);
assert.match(workflow, /SKILL_CATALOG_PATH_STALE/);
assert.match(workflow, /OPTIONAL_SKILL_UNRESOLVED/);
assert.match(workflow, /REQUIRED_SKILL_UNRESOLVED/);

console.log('codex skill catalog contract: 12 cases passed');
