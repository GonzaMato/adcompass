import { describe, it, expect } from '@jest/globals';
import { parseRulesBody, validateRules } from '../../lib/rules.schema';
import { ValidationError } from '../../lib/errors';

const minimalValid = {
  prohibitedClaims: [],
  tone: { allowed: [], bannedWords: [] },
  logoUsage: { allowedPositions: [], bannedBackgrounds: [], invertOnDark: false, minClearSpaceRatio: 0 },
  sensitive: { disallowCategories: [] },
  requiredDisclaimers: [],
};

describe('rules.schema', () => {
  it('parseRulesBody parses JSON by default', () => {
    const obj = parseRulesBody(JSON.stringify({ a: 1 }), 'application/json') as any;
    expect(obj.a).toBe(1);
  });

  it('parseRulesBody parses YAML when content-type contains yaml', () => {
    const yaml = `tone:\n  allowed: [formal]\n  bannedWords: []\nlogoUsage:\n  allowedPositions: []\n  bannedBackgrounds: []\n  invertOnDark: false\n  minClearSpaceRatio: 0\nsensitive:\n  disallowCategories: []\nprohibitedClaims: []\nrequiredDisclaimers: []\n`;
    const obj = parseRulesBody(yaml, 'application/x-yaml') as any;
    expect(obj.tone.allowed[0]).toBe('formal');
  });

  it('validateRules succeeds on minimal valid input', () => {
    const out = validateRules(minimalValid);
    expect(out.logoUsage.minClearSpaceRatio).toBe(0);
  });

  it('validateRules rejects too many prohibitedClaims', () => {
    const bad = {
      ...minimalValid,
      prohibitedClaims: Array.from({ length: 5001 }, (_, i) => `term-${i}`),
    };
    expect(() => validateRules(bad)).toThrow(ValidationError);
  });

  it('validateRules rejects invalid tone value', () => {
    const bad = {
      ...minimalValid,
      tone: { allowed: ['wtf'], bannedWords: [] },
    } as any;
    expect(() => validateRules(bad)).toThrow(ValidationError);
  });

  it('validateRules enforces minClearSpaceRatio bounds', () => {
    const badLow = { ...minimalValid, logoUsage: { ...minimalValid.logoUsage, minClearSpaceRatio: -0.1 } };
    const badHigh = { ...minimalValid, logoUsage: { ...minimalValid.logoUsage, minClearSpaceRatio: 1.1 } };
    expect(() => validateRules(badLow)).toThrow(ValidationError);
    expect(() => validateRules(badHigh)).toThrow(ValidationError);
  });

  it('validateRules rejects >200 disclaimers', () => {
    const bad = { ...minimalValid, requiredDisclaimers: Array.from({ length: 201 }, (_, i) => `d${i}`) };
    expect(() => validateRules(bad)).toThrow(ValidationError);
  });
});


