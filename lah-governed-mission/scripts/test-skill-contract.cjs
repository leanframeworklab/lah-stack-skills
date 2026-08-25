const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const skill = path.join(__dirname, '..', 'SKILL.md');
assert.equal(fs.existsSync(skill), true, 'SKILL.md must exist');

const s = fs.readFileSync(skill, 'utf8');

for (const needle of [
  'name: lah-governed-mission',
  'READ_ONLY_AUDIT',
  'DESIGN_ONLY',
  'CODE_CHANGE',
  'PROMOTION_DEPLOYMENT',
  'Classify mission',
  'Resolve authority',
  'Active session skill catalog',
  'REQUIRED_SKILL_UNRESOLVED',
  'OPTIONAL_SKILL_UNRESOLVED',
  'Independent verification',
  'Final receipt',
]) {
  assert.ok(s.includes(needle), 'missing required contract: ' + needle);
}

for (const forbidden of [
  'skill_view(',
  'delegate_task',
  "action: 'replace'",
  'git checkout master',
  'gh pr merge --admin',
  '.hermes/plugins/superpowers',
  'only 2 pre-existing failures',
  'push direct on shared branch',
]) {
  assert.equal(s.includes(forbidden), false, 'forbidden legacy/global policy leaked: ' + forbidden);
}

const audit = s.slice(s.indexOf('### READ_ONLY_AUDIT'), s.indexOf('### DESIGN_ONLY'));
assert.ok(/no implementation/i.test(audit));
assert.ok(/no commit/i.test(audit));
assert.ok(/no deployment/i.test(audit));

const code = s.slice(s.indexOf('### CODE_CHANGE'), s.indexOf('### PROMOTION_DEPLOYMENT'));
assert.ok(/TDD/i.test(code));
assert.ok(/dirty/i.test(code));

const promote = s.slice(s.indexOf('### PROMOTION_DEPLOYMENT'));
assert.ok(/readback/i.test(promote));
assert.ok(/declared authority/i.test(promote));

console.log('lah-governed-mission contract: PASS');
