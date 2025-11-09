import { describe, it, expect } from '@jest/globals';
import { parseRulesBody, validateRules } from '../../lib/rules.schema';
import { ValidationError } from '../../lib/errors';

const minimalValidV2 = {
  voice: {
    traits: {
      formality: 4,
      warmth: 7,
      energy: 5,
      humor: 2,
      confidence: 8,
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
    const yaml = `voice:\n  traits:\n    formality: 4\n    warmth: 7\n    energy: 5\n    humor: 2\n    confidence: 8\nlogoUsage:\n  minSizePx: { width: 0, height: 0 }\n`;
    const obj = parseRulesBody(yaml, 'application/x-yaml') as any;
    expect(obj.voice.traits.formality).toBe(4);
  });

  it('validateRules succeeds on minimal valid V2 input', () => {
    const out = validateRules(minimalValidV2);
    expect(out.logoUsage.minClearSpaceX).toBe(0);
    expect(out.logoUsage.background.minContrastRatio).toBeGreaterThanOrEqual(1);
  });

  it('validateRules rejects invalid trait values', () => {
    const bad = {
      ...minimalValidV2,
      voice: {
        ...minimalValidV2.voice,
        traits: {
          ...minimalValidV2.voice.traits,
          humor: 11, // out of 1..10
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

