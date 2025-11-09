import { describe, it, expect } from '@jest/globals';
import { parseRulesBody, validateRules } from '../../lib/rules.schema';
import { ValidationError } from '../../lib/errors';

const minimalValidV2 = {
  voice: {
    traits: {
      formality: [2, 4],
      warmth: [3, 5],
      energy: [2, 4],
      humor: [1, 2],
      confidence: [3, 5],
    },
  },
  logoUsage: {
    minSizePx: { width: 0, height: 0 },
  },
};

describe('rules.schema V2', () => {
  it('parseRulesBody parses JSON by default', () => {
    const obj = parseRulesBody(JSON.stringify({ a: 1 }), 'application/json') as any;
    expect(obj.a).toBe(1);
  });

  it('parseRulesBody parses YAML when content-type contains yaml', () => {
    const yaml = `voice:\n  traits:\n    formality: [2,4]\n    warmth: [3,5]\n    energy: [2,4]\n    humor: [1,2]\n    confidence: [3,5]\nlogoUsage:\n  minSizePx: { width: 0, height: 0 }\n`;
    const obj = parseRulesBody(yaml, 'application/x-yaml') as any;
    expect(obj.voice.traits.formality[0]).toBe(2);
  });

  it('validateRules succeeds on minimal valid V2 input', () => {
    const out = validateRules(minimalValidV2);
    expect(out.logoUsage.minClearSpaceX).toBe(0);
    expect(out.logoUsage.background.minContrastRatio).toBeGreaterThanOrEqual(1);
  });

  it('validateRules rejects invalid trait ranges', () => {
    const bad = {
      ...minimalValidV2,
      voice: {
        ...minimalValidV2.voice,
        traits: {
          ...minimalValidV2.voice.traits,
          humor: [0, 6], // out of 1..5
        },
      },
    };
    expect(() => validateRules(bad)).toThrow(ValidationError);
  });

  it('validateRules enforces background contrast bounds', () => {
    const badLow = { ...minimalValidV2, logoUsage: { ...minimalValidV2.logoUsage, background: { minContrastRatio: 0.5 } } };
    const badHigh = { ...minimalValidV2, logoUsage: { ...minimalValidV2.logoUsage, background: { minContrastRatio: 22 } } };
    expect(() => validateRules(badLow)).toThrow(ValidationError);
    expect(() => validateRules(badHigh)).toThrow(ValidationError);
  });

  it('validateRules rejects >200 disclaimers', () => {
    const bad = {
      ...minimalValidV2,
      claims: {
        disclaimers: Array.from({ length: 201 }, (_, i) => ({ template: `d${i}` })),
      },
    };
    expect(() => validateRules(bad)).toThrow(ValidationError);
  });
});

