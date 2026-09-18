'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  classifyDepwireActivation,
  canAnalyzeRepository,
  evaluateGroundtruthProbation,
  isGroundtruthAuthoritative,
} = require('../../scripts/depwire-workflow-policy.cjs');

test('trivial change skips Depwire', () => {
  assert.deepEqual(
    classifyDepwireActivation({ changeType: 'documentation-only' }),
    { decision: 'MUST_NOT', reasons: ['documentation-only'] },
  );
});

test('cross-file core change requires Depwire', () => {
  const result = classifyDepwireActivation({
    crossFileRefactor: true,
    sharedCoreModule: true,
  });
  assert.equal(result.decision, 'MUST');
  assert.deepEqual(result.reasons, ['cross-file-refactor', 'shared-core-module']);
});

test('unknown blast radius requires Depwire', () => {
  assert.equal(
    classifyDepwireActivation({ unknownBlastRadius: true }).decision,
    'MUST',
  );
});

test('documentation-only change can still require Depwire when dependency information is explicit', () => {
  const result = classifyDepwireActivation({
    changeType: 'documentation-only',
    dependencyInformationRequired: true,
  });
  assert.equal(result.decision, 'MUST');
  assert.deepEqual(result.reasons, ['dependency-information-required']);
});

test('should condition is reported without forcing tool use', () => {
  const result = classifyDepwireActivation({
    productionFilesLikely: 3,
    multipleTestSurfaces: true,
  });
  assert.equal(result.decision, 'SHOULD');
  assert.deepEqual(result.reasons, ['3-plus-production-files', 'multiple-test-surfaces']);
});

test('unavailable Depwire has safe native fallback', () => {
  const result = classifyDepwireActivation({
    unknownBlastRadius: true,
    depwireAvailable: false,
  });
  assert.equal(result.decision, 'MUST');
  assert.equal(result.fallback, 'NATIVE_INSPECTION_AND_TESTS');
});

test('remote repository sources are rejected', () => {
  assert.deepEqual(
    canAnalyzeRepository('https://github.com/example/repo', ['/home/deploy/lah-stack-repos']),
    { allowed: false, reason: 'UNTRUSTED_REMOTE_REPOSITORY' },
  );
});

test('local repository is allowed only under trusted roots', () => {
  assert.deepEqual(
    canAnalyzeRepository('/home/deploy/lah-stack-repos/lah-brain', ['/home/deploy/lah-stack-repos']),
    { allowed: true, reason: 'TRUSTED_LOCAL_REPOSITORY' },
  );
  assert.equal(
    canAnalyzeRepository('/tmp/repo', ['/home/deploy/lah-stack-repos']).allowed,
    false,
  );
});

test('GroundTruth is non-authoritative', () => {
  assert.equal(isGroundtruthAuthoritative(), false);
});

test('probation requires exactly three canaries and applies thresholds', () => {
  const result = evaluateGroundtruthProbation([
    { sourceRelevance: 2, versionSpecificity: 2, newInformation: 2, uncertaintyReduction: 2, actionability: 2, materiallyUseful: true },
    { sourceRelevance: 2, versionSpecificity: 2, newInformation: 1, uncertaintyReduction: 1, actionability: 2, materiallyUseful: true },
    { sourceRelevance: 0, versionSpecificity: 0, newInformation: 0, uncertaintyReduction: 0, actionability: 0, materiallyUseful: false },
  ]);
  assert.equal(result.average, 6);
  assert.equal(result.usefulCanaries, 2);
  assert.equal(result.status, 'OPTIONAL_SPECIALIST');
  assert.throws(() => evaluateGroundtruthProbation([]), /exactly three/i);
});

test('probation can prove useful or reject value mechanically', () => {
  const perfect = { sourceRelevance: 2, versionSpecificity: 2, newInformation: 2, uncertaintyReduction: 2, actionability: 2, materiallyUseful: true };
  assert.equal(evaluateGroundtruthProbation([perfect, perfect, { ...perfect, materiallyUseful: false }]).status, 'PROVEN_USEFUL');
  const empty = { sourceRelevance: 0, versionSpecificity: 0, newInformation: 0, uncertaintyReduction: 0, actionability: 0, materiallyUseful: false };
  assert.equal(evaluateGroundtruthProbation([empty, empty, empty]).status, 'NO_PROVEN_VALUE');
});
