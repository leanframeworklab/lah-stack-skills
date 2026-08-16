#!/usr/bin/env node
/** Safe, explicit Git-source -> Hermes/Codex installation synchronizer. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');

const ROUTER_ROOT = path.resolve(__dirname, '..');
const EXPECTED_HERMES = '/home/deploy/.hermes/skills/software-development/lah-repo-router';
const EXPECTED_CODEX = '/home/deploy/.codex/skills/lah-repo-router';
const mappingRelative = 'references/repo_mappings.json';
const HERMES_FILES = [
  'SKILL.md', 'scripts/dry-run-route.sh', 'scripts/dry-run-route.cjs',
  'scripts/test-v4-router.cjs', 'scripts/test-v4-write-policy.cjs', 'scripts/run-escalation-tests.cjs',
  'scripts/validate-routing-drift.cjs', 'scripts/validate-installation-drift.cjs', 'scripts/validate-installation-drift.sh',
  'references/repo_mappings.json', 'references/receipt-schema-v4.json', 'references/source-contract.json',
  'references/v4-adversarial-fixtures.json', 'references/escalation-tests.txt', 'references/test-missions.txt',
  'references/router-output-format.md', 'references/dry-run-test-results.md', 'references/refresh-limitations.md',
];
const CODEX_FILES = ['templates/codex-SKILL.md'];

function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function exists(file) { return fs.existsSync(file); }
function die(message) { console.error(`SYNC_BLOCKED: ${message}`); process.exit(2); }
function parseArgs(argv) {
  const out = { apply: false, source: ROUTER_ROOT, hermes: EXPECTED_HERMES, codex: EXPECTED_CODEX, certification: 'PENDING' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--apply') out.apply = true;
    else if (arg === '--source') out.source = path.resolve(argv[++i]);
    else if (arg === '--hermes') out.hermes = path.resolve(argv[++i]);
    else if (arg === '--codex') out.codex = path.resolve(argv[++i]);
    else if (arg === '--certification') out.certification = argv[++i];
    else if (arg === '--help') { console.log('Usage: sync-installations.cjs [--apply] [--source ROOT] [--hermes ROOT] [--codex ROOT] [--certification PASS|PENDING]'); process.exit(0); }
    else die(`unknown argument ${arg}`);
  }
  return out;
}
function ensureExpectedTarget(name, actual, expected) {
  if (path.resolve(actual) !== expected) die(`${name} target must be exactly ${expected}; got ${actual}`);
}
function sourceMap(source, relative) { return path.join(source, relative); }
function targetMap(root, relative) { return path.join(root, relative); }
function copyPlan(source, target, relative) {
  const sourceRelative = relative === 'templates/codex-SKILL.md' ? relative : relative;
  const targetRelative = relative === 'templates/codex-SKILL.md' ? 'SKILL.md' : relative;
  const from = sourceMap(source, sourceRelative);
  const to = targetMap(target, targetRelative);
  if (!exists(from)) die(`missing source artifact ${sourceRelative}`);
  return { source: from, target: to, relative: targetRelative, source_relative: sourceRelative };
}
function provenance(source, mappingFingerprint, certification) {
  let commit = 'UNKNOWN';
  try { commit = cp.execFileSync('git', ['-C', path.dirname(source), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch {}
  return { router_version: '4', source_repo: 'leanframeworklab/lah-stack-skills', source_commit: commit, mapping_fingerprint: mappingFingerprint, schema_version: '4', installed_at: new Date().toISOString(), certification };
}
function main() {
  const args = parseArgs(process.argv.slice(2));
  ensureExpectedTarget('Hermes', args.hermes, EXPECTED_HERMES);
  ensureExpectedTarget('Codex', args.codex, EXPECTED_CODEX);
  const contract = JSON.parse(fs.readFileSync(sourceMap(args.source, 'references/source-contract.json'), 'utf8'));
  const mapping = sourceMap(args.source, mappingRelative);
  if (sha256(mapping) !== contract.mapping_fingerprint) die(`source mapping fingerprint ${sha256(mapping)} != contract ${contract.mapping_fingerprint}`);
  const plan = [...HERMES_FILES.map((f) => copyPlan(args.source, args.hermes, f)), ...CODEX_FILES.map((f) => copyPlan(args.source, args.codex, f))];
  const changes = plan.filter(({ source, target }) => !exists(target) || sha256(source) !== sha256(target));
  console.log(JSON.stringify({ mode: args.apply ? 'APPLY' : 'DRY_RUN', source: args.source, hermes: args.hermes, codex: args.codex, mapping_fingerprint: contract.mapping_fingerprint, changes: changes.map((item) => ({ target: item.target, source: item.source })) }, null, 2));
  if (!args.apply) return;
  for (const item of plan) {
    fs.mkdirSync(path.dirname(item.target), { recursive: true });
    fs.copyFileSync(item.source, item.target);
    if (sha256(item.source) !== sha256(item.target)) die(`post-copy hash mismatch for ${item.target}`);
  }
  for (const [root, label] of [[args.hermes, 'Hermes'], [args.codex, 'Codex']]) {
    const receipt = provenance(args.source, contract.mapping_fingerprint, args.certification);
    const target = path.join(root, 'install-provenance.json');
    fs.writeFileSync(target, `${JSON.stringify(receipt, null, 2)}\n`);
    console.log(`${label}: provenance ${target}`);
  }
  console.log('SYNC_APPLY_PASS');
}
main();
