import { z } from 'zod';

// HEX color validation pattern
const hexColorRegex = /^#[0-9A-F]{6}$/;

export const HexColorSchema = z.string().regex(hexColorRegex, {
  message: 'Invalid HEX color format. Must be #RRGGBB with uppercase letters',
});

export const ColorInputSchema = z.object({
  role: z.string().optional(),
  hex: HexColorSchema,
  darkVariant: HexColorSchema.optional(),
  allowAsBackground: z.boolean().default(true),
});

export const LogoTypeSchema = z.enum(['primary', 'stacked', 'mark-only', 'mono', 'inverted']);

export const LogoInputSchema = z.object({
  type: LogoTypeSchema,
  allowedPositions: z.array(z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'])).optional(),
  bannedBackgrounds: z.array(z.string()).optional(),
  monochrome: z.object({
    allowed: z.boolean(),
    hex: HexColorSchema.optional(),
  }).optional(),
  invertOnDark: z.boolean().optional(),
  minClearSpaceRatio: z.number().min(0).max(0.2).optional(),
});

export const BrandInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name must be 80 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  colors: z.array(ColorInputSchema).max(12, 'Maximum 12 colors allowed').optional(),
  logos: z.array(LogoInputSchema).min(1, 'At least one logo is required').max(6, 'Maximum 6 logos allowed'),
  taglinesAllowed: z.array(z.string().min(1).max(120)).max(50, 'Maximum 50 taglines allowed').optional(),
});

export type BrandInput = z.infer<typeof BrandInputSchema>;
export type ColorInput = z.infer<typeof ColorInputSchema>;
export type LogoInput = z.infer<typeof LogoInputSchema>;

// File validation
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = ['image/svg+xml', 'image/png'];

export function validateLogoFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File ${file.name} exceeds 5MB limit` };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `File ${file.name} must be SVG or PNG` };
  }

  return { valid: true };
}

// ============================================
// Update Brand Input (PUT /brands/{id})
// ============================================
export const BrandUpdateInputSchema = z.object({
  colors: z.array(ColorInputSchema).max(12, 'Maximum 12 colors allowed').default([]),
  logos: z.array(LogoInputSchema).min(1, 'At least one logo is required').max(6, 'Maximum 6 logos allowed').optional(),
  taglinesAllowed: z.array(z.string().min(1).max(120)).max(50, 'Maximum 50 taglines allowed').default([]),
});

