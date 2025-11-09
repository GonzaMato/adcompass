import { BrandRulesInput } from './rules.schema';

type V1 = {
  prohibitedClaims?: string[];
  tone?: { allowed?: string[]; bannedWords?: string[] };
  logoUsage?: {
    allowedPositions?: string[];
    bannedBackgrounds?: string[];
    invertOnDark?: boolean;
    minClearSpaceRatio?: number;
  };
  sensitive?: { disallowCategories?: string[]; minAudienceAge?: number };
  requiredDisclaimers?: string[];
};

const toneRangePresets: Record<
  string,
  { formality: [number, number]; warmth: [number, number]; energy: [number, number]; humor: [number, number]; confidence: [number, number] }
> = {
  formal: { formality: [4, 5], warmth: [1, 3], energy: [1, 3], humor: [1, 1], confidence: [3, 5] },
  friendly: { formality: [2, 3], warmth: [4, 5], energy: [3, 4], humor: [1, 3], confidence: [3, 4] },
  playful: { formality: [1, 2], warmth: [4, 5], energy: [4, 5], humor: [3, 5], confidence: [2, 4] },
  authoritative: { formality: [4, 5], warmth: [2, 3], energy: [2, 3], humor: [1, 1], confidence: [4, 5] },
};

function mergeRanges(a: [number, number], b: [number, number]): [number, number] {
  return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
}

export function migrateRulesV1toV2(v1: V1): BrandRulesInput {
  // Defaults
  let traits = {
    formality: [2, 4] as [number, number],
    warmth: [3, 5] as [number, number],
    energy: [2, 4] as [number, number],
    humor: [1, 2] as [number, number],
    confidence: [3, 5] as [number, number],
  };

  const allowedTones = v1.tone?.allowed ?? [];
  if (allowedTones.length > 0) {
    for (const t of allowedTones) {
      const preset = toneRangePresets[t];
      if (preset) {
        traits = {
          formality: mergeRanges(traits.formality, preset.formality),
          warmth: mergeRanges(traits.warmth, preset.warmth),
          energy: mergeRanges(traits.energy, preset.energy),
          humor: mergeRanges(traits.humor, preset.humor),
          confidence: mergeRanges(traits.confidence, preset.confidence),
        };
      }
    }
  }

  const voice = {
    traits,
    lexicon: {
      allowedWords: [] as string[],
      bannedWords: v1.tone?.bannedWords ?? [],
      bannedPatterns: v1.prohibitedClaims ?? [],
      ctaWhitelist: [] as string[],
      readability: {
        targetGrade: 8,
        maxExclamations: 1,
        allowEmojis: false,
      },
    },
    perChannelOverrides: {},
  };

  const logoUsage = {
    minSizePx: { width: 0, height: 0 },
    minClearSpaceX: Math.max(0, Math.min(5, v1.logoUsage?.minClearSpaceRatio ?? 0)),
    aspectRatioLock: true,
    placementGrid: (v1.logoUsage?.allowedPositions ?? ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']) as Array<
      'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
    >,
    background: {
      minContrastRatio: 4.5,
      invertThresholdLuminance: 0.35,
      maxBackgroundComplexity: 0.25,
      blurOverlayRequiredAboveComplexity: true,
    },
  };

  const claims = {
    bannedPatterns: v1.prohibitedClaims ?? [],
    requiredSubstantiation: [] as Array<{ type: 'clinical_study' | 'survey' | 'internal_data' | 'third_party'; appliesToPatterns: string[] }>,
    disclaimers: (v1.requiredDisclaimers ?? []).map((template) => ({ template, regions: [], channels: [] })),
  };

  const sensitive: BrandRulesInput['sensitive'] = {
    policies: {},
  };
  for (const cat of v1.sensitive?.disallowCategories ?? []) {
    sensitive.policies[cat] = {
      allowed: 'disallowed',
      minAudienceAge: v1.sensitive?.minAudienceAge,
      regions: [],
      channels: [],
      requiresLegalReview: false,
    };
  }

  const accessibility = {
    wcag: {
      minContrastRatio: 4.5,
      minFontSizePx: 14,
      captionsRequired: true,
      altTextRequired: true,
    },
  };

  const platformRules = {};

  const governance = {
    severityDefault: 'hard_fail' as const,
    checks: [] as Array<{ id: string; description: string; severity?: 'hard_fail' | 'soft_warn'; evaluator: any; remediationHint?: string }>,
  };

  return {
    voice,
    logoUsage,
    claims,
    sensitive,
    accessibility,
    platformRules,
    governance,
  };
}


