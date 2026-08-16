#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const HERMES = '/home/deploy/.hermes/skills/software-development/lah-repo-router';
const CODEX = '/home/deploy/.codex/skills/lah-repo-router';
const missions = JSON.parse(fs.readFileSync(path.join(ROOT, 'references/v4-adversarial-fixtures.json'), 'utf8')).map((fixture) => fixture.mission);
const omit = new Set(['routing_ms', 'total_ms']);
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function route(engine, mapping, mission) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lah-router-p1-'));
  const missionFile = path.join(dir, 'mission.txt');
  fs.writeFileSync(missionFile, `${mission}\n`);
  const output = cp.execFileSync('node', [engine, mapping, missionFile], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  const json = output.slice(output.indexOf('{'), output.lastIndexOf('\n---'));
  return JSON.parse(json);
}
function semantic(receipt) { return Object.fromEntries(Object.entries(receipt).filter(([key]) => !omit.has(key))); }
function copyTree(source) { const target = fs.mkdtempSync(path.join(os.tmpdir(), 'lah-router-p1-install-')); fs.cpSync(source, target, { recursive: true }); return target; }
function validator(source, hermes, codex) {
  const result = cp.spawnSync('node', [path.join(ROOT, 'scripts/validate-installation-drift.cjs'), '--source', source, '--hermes', hermes, '--codex', codex, '--json'], { encoding: 'utf8' });
  return { status: result.status, value: JSON.parse(result.stdout) };
}
function main() {
  assert.equal(hash(path.join(ROOT, 'references/repo_mappings.json')), 'e93ef413f50f02244b71be01b405b09d8994657c3f931d41a193f12d8ecfd0a0');
  assert.equal(hash(path.join(CODEX, 'SKILL.md')), hash(path.join(ROOT, 'templates/codex-SKILL.md')));
  for (const mission of missions) {
    const source = semantic(route(path.join(ROOT, 'scripts/dry-run-route.cjs'), path.join(ROOT, 'references/repo_mappings.json'), mission));
    const hermes = semantic(route(path.join(HERMES, 'scripts/dry-run-route.cjs'), path.join(HERMES, 'references/repo_mappings.json'), mission));
    assert.deepEqual(hermes, source, `Hermes mismatch: ${mission}`);
    const codexExecution = semantic(route(path.join(HERMES, 'scripts/dry-run-route.cjs'), path.join(HERMES, 'references/repo_mappings.json'), mission));
    assert.deepEqual(codexExecution, source, `Codex execution mismatch: ${mission}`);
  }
  const cleanHermes = copyTree(HERMES); const cleanCodex = copyTree(CODEX);
  try {
    let result = validator(ROOT, cleanHermes, cleanCodex); assert.equal(result.status, 0); assert.equal(result.value.verdict, 'DRIFT_CHECK_PASS');
    fs.appendFileSync(path.join(cleanHermes, 'references/repo_mappings.json'), '\n');
    result = validator(ROOT, cleanHermes, cleanCodex); assert.notEqual(result.status, 0); assert.ok(result.value.failures.some((failure) => failure.category === 'INSTALLATION_DRIFT'));
    fs.rmSync(path.join(cleanHermes, 'references/repo_mappings.json'));
    result = validator(ROOT, cleanHermes, cleanCodex); assert.notEqual(result.status, 0); assert.ok(result.value.failures.some((failure) => failure.category === 'MISSING_ARTIFACT'));
    fs.cpSync(path.join(HERMES, 'references/repo_mappings.json'), path.join(cleanHermes, 'references/repo_mappings.json'));
    fs.appendFileSync(path.join(cleanCodex, 'SKILL.md'), '\n# synthetic drift\n');
    result = validator(ROOT, cleanHermes, cleanCodex); assert.notEqual(result.status, 0); assert.ok(result.value.failures.some((failure) => failure.category === 'INSTALLATION_DRIFT'));
    fs.cpSync(path.join(HERMES, 'scripts/dry-run-route.cjs'), path.join(cleanHermes, 'scripts/dry-run-route.cjs'));
    fs.appendFileSync(path.join(cleanHermes, 'scripts/dry-run-route.cjs'), '\n// synthetic engine drift\n');
    result = validator(ROOT, cleanHermes, cleanCodex); assert.notEqual(result.status, 0); assert.equal(result.value.semantic_equivalence, 'FAIL');
    const oldSource = copyTree(ROOT);
    fs.appendFileSync(path.join(oldSource, 'references/repo_mappings.json'), '\n');
    result = validator(oldSource, cleanHermes, cleanCodex); assert.notEqual(result.status, 0); assert.ok(result.value.failures.some((failure) => failure.category === 'SOURCE_DRIFT'));
    fs.rmSync(oldSource, { recursive: true, force: true });
  } finally { fs.rmSync(cleanHermes, { recursive: true, force: true }); fs.rmSync(cleanCodex, { recursive: true, force: true }); }
  console.log(`source/install equivalence: ${missions.length} missions passed`);
  console.log('negative drift tests: mapping, missing artifact, Codex semantic artifact passed');
}
main();
