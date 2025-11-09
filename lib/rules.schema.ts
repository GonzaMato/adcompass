import { z } from 'zod';
import YAML from 'yaml';
import { ValidationError } from './errors';

/**
 * Brand Rules V2
 * - Voice defined by quantitative traits (ranges 1..5) and lexicon
 * - Visual constraints for logo/background based on measurable thresholds
 * - Compliance rules (claims, disclaimers, substantiation) by region/channel
 * - Accessibility (WCAG), Platform rules, and Governance metadata
 */

// Helpers
const Range1to5Schema = z
  .tuple([z.number().int().min(1).max(5), z.number().int().min(1).max(5)])
  .refine(([min, max]) => min <= max, { message: 'min must be <= max' });

const PlacementGridEnum = z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']);

const SeverityEnum = z.enum(['hard_fail', 'soft_warn']);

const EvaluatorEnum = z.enum(['contrast', 'regex', 'complexity', 'readability', 'size', 'governance']);

const ChannelId = z.string().min(1);
const RegionId = z.string().min(2).max(3); // e.g., AR, US, EU

// Voice
const VoiceTraitsSchema = z.object({
  formality: Range1to5Schema,
  warmth: Range1to5Schema,
  energy: Range1to5Schema,
  humor: Range1to5Schema,
  confidence: Range1to5Schema,
});

const VoiceReadabilitySchema = z.object({
  targetGrade: z.number().int().min(1).max(14).default(8),
  maxExclamations: z.number().int().min(0).max(5).default(1),
  allowEmojis: z.boolean().default(false),
});

const VoiceLexiconSchema = z.object({
  allowedWords: z.array(z.string()).max(5000).default([]),
  bannedWords: z.array(z.string()).max(5000).default([]),
  bannedPatterns: z.array(z.string()).max(1000).default([]), // regex patterns (as strings)
  ctaWhitelist: z.array(z.string()).max(1000).default([]),
  readability: VoiceReadabilitySchema.default({} as any),
});

const PerChannelOverridesSchema = z
  .record(
    ChannelId,
    z.object({
      traits: VoiceTraitsSchema.partial().optional(),
      lexicon: VoiceLexiconSchema.partial().optional(),
    })
  )
  .default({});

const VoiceSchema = z.object({
  traits: VoiceTraitsSchema,
  lexicon: VoiceLexiconSchema.default({} as any),
  perChannelOverrides: PerChannelOverridesSchema,
});

// Logo / Visual constraints
const MinSizePxSchema = z.object({
  width: z.number().int().min(0).default(0),
  height: z.number().int().min(0).default(0),
});

const BackgroundConstraintsSchema = z.object({
  minContrastRatio: z.number().min(1).max(21).default(4.5),
  invertThresholdLuminance: z.number().min(0).max(1).default(0.35),
  maxBackgroundComplexity: z.number().min(0).max(1).default(0.25),
  blurOverlayRequiredAboveComplexity: z.boolean().default(true),
});

const LogoUsageSchema = z.object({
  minSizePx: MinSizePxSchema.default({} as any),
  minClearSpaceX: z.number().min(0).max(5).default(0),
  aspectRatioLock: z.boolean().default(true),
  placementGrid: z.array(PlacementGridEnum).default(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
  background: BackgroundConstraintsSchema.default({} as any),
});

// Claims / Compliance
const SubstantiationType = z.enum(['clinical_study', 'survey', 'internal_data', 'third_party']);

const RequiredSubstantiationSchema = z.object({
  type: SubstantiationType,
  appliesToPatterns: z.array(z.string()).max(1000).default([]),
});

const DisclaimerSchema = z.object({
  template: z.string().min(1),
  regions: z.array(RegionId).default([]),
  channels: z.array(ChannelId).default([]),
});

const ClaimsSchema = z.object({
  bannedPatterns: z.array(z.string()).max(5000).default([]),
  requiredSubstantiation: z.array(RequiredSubstantiationSchema).default([]),
  disclaimers: z.array(DisclaimerSchema).max(200).default([]),
});

// Sensitive / Policies
const PolicyAllowEnum = z.enum(['allowed', 'conditional', 'disallowed']);

const SensitivePolicySchema = z.object({
  allowed: PolicyAllowEnum.default('conditional'),
  minAudienceAge: z.number().int().min(0).max(120).optional(),
  regions: z.array(RegionId).default([]),
  channels: z.array(ChannelId).default([]),
  requiresLegalReview: z.boolean().default(false),
});

const SensitiveSchema = z.object({
  policies: z.record(z.string(), SensitivePolicySchema).default({}),
});

// Accessibility
const AccessibilitySchema = z.object({
  wcag: z.object({
    minContrastRatio: z.number().min(1).max(21).default(4.5),
    minFontSizePx: z.number().int().min(8).max(72).default(14),
    captionsRequired: z.boolean().default(true),
    altTextRequired: z.boolean().default(true),
  }).default({} as any),
});

// Platform Rules
const PlatformMetaSchema = z.object({
  maxTextOnImagePct: z.number().min(0).max(100).default(20),
  maxHashtags: z.number().int().min(0).max(50).default(5),
});

const PlatformGoogleSchema = z.object({
  headlineCharLimit: z.number().int().min(10).max(90).default(30),
});

const PlatformYouTubeSchema = z.object({
  maxDurationSec: z.number().int().min(1).max(600).default(30),
  captionsRequired: z.boolean().default(true),
});

const PlatformRulesSchema = z.object({
  meta: PlatformMetaSchema.optional(),
  google: PlatformGoogleSchema.optional(),
  youtube: PlatformYouTubeSchema.optional(),
});

// Governance
const GovernanceCheckSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  severity: SeverityEnum.default('hard_fail'),
  evaluator: EvaluatorEnum,
  remediationHint: z.string().min(1).default(''),
});

const GovernanceSchema = z.object({
  severityDefault: SeverityEnum.default('hard_fail'),
  checks: z.array(GovernanceCheckSchema).default([]),
});

export const BrandRulesInputSchema = z.object({
  voice: VoiceSchema,
  logoUsage: LogoUsageSchema,
  claims: ClaimsSchema.default({} as any),
  sensitive: SensitiveSchema.default({} as any),
  accessibility: AccessibilitySchema.default({} as any),
  platformRules: PlatformRulesSchema.default({} as any),
  governance: GovernanceSchema.default({} as any),
});

export type BrandRulesInput = z.infer<typeof BrandRulesInputSchema>;

export function parseRulesBody(rawBody: string, contentType: string | null | undefined): unknown {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('yaml')) {
    return YAML.parse(rawBody);
  }
  // Fallback to JSON
  return JSON.parse(rawBody);
}

export function validateRules(data: unknown): BrandRulesInput {
  const parsed = BrandRulesInputSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new ValidationError(message);
  }
  return parsed.data;
}

