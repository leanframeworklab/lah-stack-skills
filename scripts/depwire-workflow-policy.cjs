'use strict';

const path = require('node:path');

const MUST_RULES = [
  ['crossFileRefactor', 'cross-file-refactor'],
  ['sharedCoreModule', 'shared-core-module'],
  ['publicOrInternalApiChange', 'api-contract-change'],
  ['databaseAbstractionChange', 'database-abstraction-change'],
  ['dependencyInjectionChange', 'dependency-injection-change'],
  ['moduleBoundaryChange', 'module-boundary-change'],
  ['sharedUtilityChange', 'shared-utility-change'],
  ['exportedSymbolRemovalOrRename', 'exported-symbol-removal-or-rename'],
  ['migrationAffectingCallers', 'migration-affecting-callers'],
  ['multipleSubsystems', 'multiple-subsystems'],
  ['explicitBlastRadius', 'explicit-blast-radius-request'],
  ['unknownBlastRadius', 'unknown-blast-radius'],
  ['nativeInspectionIncomplete', 'native-inspection-incomplete'],
];

const SHOULD_RULES = [
  ['productionFilesLikely', (value) => Number(value) >= 3, '3-plus-production-files'],
  ['multipleTestSurfaces', Boolean, 'multiple-test-surfaces'],
  ['manyCallers', (value) => Number(value) >= 3, 'many-callers'],
  ['unfamiliarArchitecture', Boolean, 'unfamiliar-architecture'],
  ['crossesDirectoryBoundary', Boolean, 'crosses-directory-boundary'],
  ['materiallyNonLocalRisk', Boolean, 'materially-non-local-risk'],
];

const TRIVIAL_CHANGES = new Set([
  'typo',
  'comment-only',
  'documentation-only',
  'formatting',
  'isolated-constant',
  'known-one-line-local-bug',
  'non-code-artifact',
  'trivial-test-only',
]);

function classifyDepwireActivation(input = {}) {
  const mustReasons = MUST_RULES
    .filter(([key]) => Boolean(input[key]))
    .map(([, reason]) => reason);

  if (input.dependencyInformationRequired && mustReasons.length === 0) {
    mustReasons.push('dependency-information-required');
  }

  if (mustReasons.length > 0) {
    return {
      decision: 'MUST',
      reasons: mustReasons,
      ...(input.depwireAvailable === false
        ? { fallback: 'NATIVE_INSPECTION_AND_TESTS' }
        : {}),
    };
  }

  if (TRIVIAL_CHANGES.has(input.changeType) && !input.dependencyInformationRequired) {
    return { decision: 'MUST_NOT', reasons: [input.changeType] };
  }

  const shouldReasons = SHOULD_RULES
    .filter(([key, predicate]) => predicate(input[key]))
    .map(([, , reason]) => reason);

  if (shouldReasons.length > 0) {
    return { decision: 'SHOULD', reasons: shouldReasons };
  }

  return { decision: 'MUST_NOT', reasons: ['no-qualifying-condition'] };
}

function canAnalyzeRepository(source, trustedLocalRoots = []) {
  if (typeof source !== 'string' || /^(?:https?|ssh|git):\/\//i.test(source) || /^git@/i.test(source)) {
    return { allowed: false, reason: 'UNTRUSTED_REMOTE_REPOSITORY' };
  }

  if (!path.isAbsolute(source) || !Array.isArray(trustedLocalRoots)) {
    return { allowed: false, reason: 'TRUSTED_LOCAL_ROOT_REQUIRED' };
  }

  const resolvedSource = path.resolve(source);
  const allowed = trustedLocalRoots.some((root) => {
    const resolvedRoot = path.resolve(root);
    const relative = path.relative(resolvedRoot, resolvedSource);
    return relative === '' || (relative && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
  });

  return allowed
    ? { allowed: true, reason: 'TRUSTED_LOCAL_REPOSITORY' }
    : { allowed: false, reason: 'OUTSIDE_TRUSTED_LOCAL_ROOTS' };
}

function scoreCanary(score) {
  const keys = ['sourceRelevance', 'versionSpecificity', 'newInformation', 'uncertaintyReduction', 'actionability'];
  for (const key of keys) {
    if (!Number.isInteger(score[key]) || score[key] < 0 || score[key] > 2) {
      throw new RangeError(`${key} must be an integer from 0 to 2`);
    }
  }
  return keys.reduce((sum, key) => sum + score[key], 0);
}

function evaluateGroundtruthProbation(scores) {
  if (!Array.isArray(scores) || scores.length !== 3) {
    throw new RangeError('GroundTruth probation requires exactly three canaries');
  }

  const totals = scores.map(scoreCanary);
  const average = Math.round((totals.reduce((sum, value) => sum + value, 0) / 3) * 100) / 100;
  const usefulCanaries = scores.filter((score) => score.materiallyUseful === true).length;
  let status = 'NO_PROVEN_VALUE';
  if (average >= 7 && usefulCanaries >= 2) status = 'PROVEN_USEFUL';
  else if (average >= 4 && usefulCanaries > 0) status = 'OPTIONAL_SPECIALIST';

  return { totals, average, usefulCanaries, status };
}

function isGroundtruthAuthoritative() {
  return false;
}

module.exports = {
  canAnalyzeRepository,
  classifyDepwireActivation,
  evaluateGroundtruthProbation,
  isGroundtruthAuthoritative,
};
