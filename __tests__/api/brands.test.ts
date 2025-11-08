import { describe, it, expect } from '@jest/globals';
import { BrandInputSchema, ColorInputSchema, LogoInputSchema } from '../../lib/validators/brand.validator';

describe('Brand API Validation', () => {
  describe('BrandInputSchema', () => {
    it('should validate a valid brand input', () => {
      const validInput = {
        name: 'Test Brand',
        description: 'A test brand',
        colors: [{ hex: '#FF0000' }],
        logos: [{ type: 'primary' }],
        taglinesAllowed: ['Test tagline'],
      };

      const result = BrandInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject when name is missing', () => {
      const invalidInput = {
        colors: [{ hex: '#FF0000' }],
        logos: [{ type: 'primary' }],
      };

      const result = BrandInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject when name is too long', () => {
      const invalidInput = {
        name: 'a'.repeat(81),
        colors: [{ hex: '#FF0000' }],
        logos: [{ type: 'primary' }],
      };

      const result = BrandInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept when colors array is empty or undefined (optional)', () => {
      const validInput = {
        name: 'Test Brand',
        logos: [{ type: 'primary' }],
      };

      const result = BrandInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject when more than 12 colors', () => {
      const invalidInput = {
        name: 'Test Brand',
        colors: Array(13).fill({ hex: '#FF0000' }),
        logos: [{ type: 'primary' }],
      };

      const result = BrandInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject when logos array is empty', () => {
      const invalidInput = {
        name: 'Test Brand',
        colors: [{ hex: '#FF0000' }],
        logos: [],
      };

      const result = BrandInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject when more than 6 logos', () => {
      const invalidInput = {
        name: 'Test Brand',
        colors: [{ hex: '#FF0000' }],
        logos: Array(7).fill({ type: 'primary' }),
      };

      const result = BrandInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject when more than 50 taglines', () => {
      const invalidInput = {
        name: 'Test Brand',
        colors: [{ hex: '#FF0000' }],
        logos: [{ type: 'primary' }],
        taglinesAllowed: Array(51).fill('test'),
      };

      const result = BrandInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('ColorInputSchema', () => {
    it('should validate a valid color', () => {
      const validColor = { hex: '#FF0000' };
      const result = ColorInputSchema.safeParse(validColor);
      expect(result.success).toBe(true);
    });

    it('should reject invalid HEX format', () => {
      const invalidColor = { hex: 'red' };
      const result = ColorInputSchema.safeParse(invalidColor);
      expect(result.success).toBe(false);
    });

    it('should reject lowercase HEX', () => {
      const invalidColor = { hex: '#ff0000' };
      const result = ColorInputSchema.safeParse(invalidColor);
      expect(result.success).toBe(false);
    });

    it('should reject short HEX', () => {
      const invalidColor = { hex: '#F00' };
      const result = ColorInputSchema.safeParse(invalidColor);
      expect(result.success).toBe(false);
    });

    it('should accept valid darkVariant', () => {
      const validColor = { hex: '#FF0000', darkVariant: '#AA0000' };
      const result = ColorInputSchema.safeParse(validColor);
      expect(result.success).toBe(true);
    });
  });

  describe('LogoInputSchema', () => {
    it('should validate a valid logo', () => {
      const validLogo = { type: 'primary' };
      const result = LogoInputSchema.safeParse(validLogo);
      expect(result.success).toBe(true);
    });

    it('should accept all valid logo types', () => {
      const types = ['primary', 'stacked', 'mark-only', 'mono', 'inverted'];
      
      types.forEach((type) => {
        const logo = { type };
        const result = LogoInputSchema.safeParse(logo);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid logo type', () => {
      const invalidLogo = { type: 'invalid-type' };
      const result = LogoInputSchema.safeParse(invalidLogo);
      expect(result.success).toBe(false);
    });

    it('should validate minClearSpaceRatio range', () => {
      const validLogo = { type: 'primary', minClearSpaceRatio: 0.05 };
      const result = LogoInputSchema.safeParse(validLogo);
      expect(result.success).toBe(true);
    });

    it('should reject minClearSpaceRatio out of range', () => {
      const invalidLogo = { type: 'primary', minClearSpaceRatio: 0.25 };
      const result = LogoInputSchema.safeParse(invalidLogo);
      expect(result.success).toBe(false);
    });
  });
});

