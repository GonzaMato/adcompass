import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BrandService } from '../../services/brand.service';
import { BrandRepository } from '../../repositories/brand.repository';
import { StorageService } from '../../services/storage.service';
import { ValidationError } from '../../lib/errors';

// Mock dependencies
jest.mock('../../repositories/brand.repository');
jest.mock('../../services/storage.service');

describe('BrandService', () => {
  let brandService: BrandService;
  let mockRepository: jest.Mocked<BrandRepository>;
  let mockStorage: jest.Mocked<StorageService>;

  beforeEach(() => {
    mockRepository = {
      createWithRelations: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      existsByName: jest.fn(),
    } as any;

    mockStorage = {
      uploadLogo: jest.fn(),
      deleteLogos: jest.fn(),
    } as any;

    brandService = new BrandService(mockRepository, mockStorage);
  });

  describe('createBrand', () => {
    it('should throw ValidationError when brand name already exists', async () => {
      const input = {
        name: 'Existing Brand',
        colors: [{ hex: '#FF0000' }],
        logos: [{ type: 'primary' as const }],
        logoFiles: [
          {
            name: 'logo.svg',
            type: 'image/svg+xml',
            size: 1000,
            buffer: Buffer.from('test'),
          },
        ],
      };

      mockRepository.existsByName.mockResolvedValue(true);

      await expect(brandService.createBrand(input)).rejects.toThrow(ValidationError);
      await expect(brandService.createBrand(input)).rejects.toThrow('A brand with this name already exists');
    });

    it('should create a brand successfully with valid input', async () => {
      const input = {
        name: 'Test Brand',
        description: 'A test brand',
        colors: [{ hex: '#FF0000' }],
        logos: [{ type: 'primary' as const }],
        taglinesAllowed: ['Test tagline'],
        logoFiles: [
          {
            name: 'logo.svg',
            type: 'image/svg+xml',
            size: 1000,
            buffer: Buffer.from('test'),
          },
        ],
      };

      mockRepository.existsByName.mockResolvedValue(false);

      mockStorage.uploadLogo.mockResolvedValue({
        url: 'https://storage.googleapis.com/bucket/brands/test-id/logo.svg',
        sizeBytes: 1000,
        mime: 'image/svg+xml',
      });

      mockRepository.createWithRelations.mockResolvedValue({
        id: 'test-brand-id',
        name: 'Test Brand',
        description: 'A test brand',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        colors: [
          {
            id: 1,
            brandId: 'test-brand-id',
            hex: '#FF0000',
            role: null,
            darkVariant: null,
            allowAsBackground: true,
          },
        ],
        logos: [
          {
            id: 1,
            brandId: 'test-brand-id',
            type: 'primary',
            url: 'https://storage.googleapis.com/bucket/brands/test-id/logo.svg',
            mime: 'image/svg+xml',
            sizeBytes: 1000,
            widthPx: null,
            heightPx: null,
            minClearSpaceRatio: null,
            allowedPositions: null,
            bannedBackgrounds: null,
            monochrome: null,
            invertOnDark: null,
          },
        ],
        taglines: [{ id: 1, brandId: 'test-brand-id', text: 'Test tagline' }],
      } as any);

      const result = await brandService.createBrand(input);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Brand');
      expect(result.id).toBe('test-brand-id');
      expect(mockStorage.uploadLogo).toHaveBeenCalledTimes(1);
      expect(mockRepository.createWithRelations).toHaveBeenCalledTimes(1);
    });

    it('should throw ValidationError when name is missing', async () => {
      const input = {
        name: '',
        colors: [{ hex: '#FF0000' }],
        logos: [{ type: 'primary' as const }],
        logoFiles: [
          {
            name: 'logo.svg',
            type: 'image/svg+xml',
            size: 1000,
            buffer: Buffer.from('test'),
          },
        ],
      };

      await expect(brandService.createBrand(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when hex color is invalid', async () => {
      const input = {
        name: 'Test Brand',
        colors: [{ hex: 'invalid' }],
        logos: [{ type: 'primary' as const }],
        logoFiles: [
          {
            name: 'logo.svg',
            type: 'image/svg+xml',
            size: 1000,
            buffer: Buffer.from('test'),
          },
        ],
      };

      await expect(brandService.createBrand(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when more than 6 logos', async () => {
      const logos = Array(7).fill({ type: 'primary' as const });
      const logoFiles = Array(7).fill({
        name: 'logo.svg',
        type: 'image/svg+xml',
        size: 1000,
        buffer: Buffer.from('test'),
      });

      const input = {
        name: 'Test Brand',
        colors: [{ hex: '#FF0000' }],
        logos,
        logoFiles,
      };

      await expect(brandService.createBrand(input)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when logo file is too large', async () => {
      const input = {
        name: 'Test Brand',
        colors: [{ hex: '#FF0000' }],
        logos: [{ type: 'primary' as const }],
        logoFiles: [
          {
            name: 'logo.svg',
            type: 'image/svg+xml',
            size: 6 * 1024 * 1024, // 6MB - over the limit
            buffer: Buffer.from('test'),
          },
        ],
      };

      await expect(brandService.createBrand(input)).rejects.toThrow(ValidationError);
    });

    it('should create brand without colors (colors optional)', async () => {
      const input = {
        name: 'Test Brand',
        logos: [{ type: 'primary' as const }],
        logoFiles: [
          {
            name: 'logo.svg',
            type: 'image/svg+xml',
            size: 1000,
            buffer: Buffer.from('test'),
          },
        ],
      };

      mockRepository.existsByName.mockResolvedValue(false);

      mockStorage.uploadLogo.mockResolvedValue({
        url: 'https://storage.googleapis.com/bucket/brands/test-id/logo.svg',
        sizeBytes: 1000,
        mime: 'image/svg+xml',
      });

      mockRepository.createWithRelations.mockResolvedValue({
        id: 'test-brand-id',
        name: 'Test Brand',
        description: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        colors: [],
        logos: [
          {
            id: 1,
            brandId: 'test-brand-id',
            type: 'primary',
            url: 'https://storage.googleapis.com/bucket/brands/test-id/logo.svg',
            mime: 'image/svg+xml',
            sizeBytes: 1000,
            widthPx: null,
            heightPx: null,
            minClearSpaceRatio: null,
            allowedPositions: null,
            bannedBackgrounds: null,
            monochrome: null,
            invertOnDark: null,
          },
        ],
        taglines: [],
      } as any);

      const result = await brandService.createBrand(input);

      expect(result).toBeDefined();
      expect(result.colors).toHaveLength(0);
      expect(result.name).toBe('Test Brand');
    });

    it('should throw ValidationError when tagline is too long', async () => {
      const input = {
        name: 'Test Brand',
        colors: [{ hex: '#FF0000' }],
        logos: [{ type: 'primary' as const }],
        taglinesAllowed: ['a'.repeat(121)], // 121 characters - over the limit
        logoFiles: [
          {
            name: 'logo.svg',
            type: 'image/svg+xml',
            size: 1000,
            buffer: Buffer.from('test'),
          },
        ],
      };

      await expect(brandService.createBrand(input)).rejects.toThrow(ValidationError);
    });
  });

  describe('getBrandById', () => {
    it('should return a brand by ID', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'test-brand-id',
        name: 'Test Brand',
        description: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        colors: [],
        logos: [],
        taglines: [],
      } as any);

      const result = await brandService.getBrandById('test-brand-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('test-brand-id');
      expect(mockRepository.findById).toHaveBeenCalledWith('test-brand-id');
    });

    it('should return null when brand not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await brandService.getBrandById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAllBrands', () => {
    it('should return all brands', async () => {
      mockRepository.findAll.mockResolvedValue([
        {
          id: 'brand-1',
          name: 'Brand 1',
          description: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          colors: [],
          logos: [],
          taglines: [],
        },
        {
          id: 'brand-2',
          name: 'Brand 2',
          description: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          colors: [],
          logos: [],
          taglines: [],
        },
      ] as any);

      const result = await brandService.getAllBrands();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Brand 1');
      expect(result[1].name).toBe('Brand 2');
    });
  });
});

