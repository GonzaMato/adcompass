import { z } from 'zod';
import YAML from 'yaml';
import { ValidationError } from './errors';

export const AllowedTones = z.enum(['formal', 'friendly', 'playful', 'authoritative']);
export const AllowedLogoPositions = z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']);
export const AllowedBannedBackgrounds = z.enum(['patterned', 'image', 'video', 'gradient', 'low-contrast']);
export const SensitiveCategories = z.enum(['politics', 'religion', 'health', 'alcohol', 'gambling', 'adult', 'financial']);

export const BrandRulesInputSchema = z.object({
  prohibitedClaims: z.array(z.string()).max(5000).default([]),
  tone: z.object({
    allowed: z.array(AllowedTones).default([]),
    bannedWords: z.array(z.string()).max(5000).default([]),
  }),
  logoUsage: z.object({
    allowedPositions: z.array(AllowedLogoPositions).default([]),
    bannedBackgrounds: z.array(AllowedBannedBackgrounds).default([]),
    invertOnDark: z.boolean().default(false),
    minClearSpaceRatio: z.number().min(0).max(1).default(0),
  }),
  sensitive: z.object({
    disallowCategories: z.array(SensitiveCategories).default([]),
    minAudienceAge: z.number().int().min(0).max(120).optional(),
  }),
  requiredDisclaimers: z.array(z.string()).max(200).optional().default([]),
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
  // Extra guard: arrays > 5000 (already enforced above) and disclaimers <= 200
  return parsed.data;
}


