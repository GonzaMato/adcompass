import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BrandService } from '../../services/brand.service';
import { BrandRepository } from '../../repositories/brand.repository';
import { StorageService } from '../../services/storage.service';
import { ValidationError, NotFoundError } from '../../lib/errors';

// Mock dependencies
let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

jest.mock('../../repositories/brand.repository');
jest.mock('../../services/storage.service');

describe('BrandService', () => {
  let brandService: BrandService;
  let mockRepository: jest.Mocked<BrandRepository>;
  let mockStorage: jest.Mocked<StorageService>;

  beforeEach(() => {
    mockRepository = {
      createWithRelations: jest.fn(),
      updateWithRelations: jest.fn(),
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

  describe('updateBrand', () => {
    it('should keep existing logos by URL and add new ones (combined)', async () => {
      const id = 'brand-id';
      const input = {
        existingLogoUrls: ['https://gcs/brands/brand-id/existing.svg'],
        logos: [{ type: 'primary' as const }],
        logoFiles: [{
          name: 'new.svg',
          type: 'image/svg+xml',
          size: 1000,
          buffer: Buffer.from('x'),
        }],
      };

      (mockRepository.findById as jest.Mock).mockResolvedValue({
        id,
        name: 'Existing',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        colors: [],
        logos: [{
          id: 10,
          brandId: id,
          type: 'primary',
          url: 'https://gcs/brands/brand-id/existing.svg',
          mime: 'image/svg+xml',
          sizeBytes: 100,
          widthPx: null,
          heightPx: null,
          minClearSpaceRatio: null,
          allowedPositions: null,
          bannedBackgrounds: null,
          monochrome: null,
          invertOnDark: null,
        }],
        taglines: [],
      } as any);

      mockStorage.uploadLogo.mockResolvedValue({
        url: 'https://gcs/brands/brand-id/new.svg',
        sizeBytes: 1000,
        mime: 'image/svg+xml',
      });

      mockRepository.updateWithRelations.mockResolvedValue({
        id,
        name: 'Existing',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        colors: [],
        logos: [{
          id: 10, brandId: id, type: 'primary', url: 'https://gcs/brands/brand-id/existing.svg', mime: 'image/svg+xml',
        }, {
          id: 11, brandId: id, type: 'primary', url: 'https://gcs/brands/brand-id/new.svg', mime: 'image/svg+xml',
        }],
        taglines: [],
      } as any);

      const result = await brandService.updateBrand(id, input as any);

      expect(result?.logos.length).toBe(2);
      expect(mockRepository.updateWithRelations).toHaveBeenCalledWith(id, expect.objectContaining({
        logos: expect.arrayContaining([
          expect.objectContaining({ url: 'https://gcs/brands/brand-id/existing.svg' }),
          expect.objectContaining({ url: 'https://gcs/brands/brand-id/new.svg' }),
        ]),
      }));
    });

    it('should throw ValidationError when existingLogoUrls contains unknown url', async () => {
      const id = 'brand-id';
      (mockRepository.findById as jest.Mock).mockResolvedValue({
        id,
        name: 'Existing',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        colors: [], logos: [], taglines: [],
      } as any);

      await expect(brandService.updateBrand(id, {
        existingLogoUrls: ['https://gcs/brands/brand-id/unknown.svg'],
        logoFiles: [],
      } as any)).rejects.toThrow(ValidationError);
    });

    it('should keep logos unchanged when neither existingLogoUrls nor logos provided', async () => {
      const id = 'brand-id';
      (mockRepository.findById as jest.Mock).mockResolvedValue({
        id,
        name: 'Existing',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        colors: [], logos: [], taglines: [],
      } as any);

      mockRepository.updateWithRelations.mockResolvedValue({
        id, name: 'Existing', description: null, createdAt: new Date(), updatedAt: new Date(), colors: [], logos: [], taglines: [],
      } as any);

      await brandService.updateBrand(id, { colors: [], taglinesAllowed: [], logoFiles: [] } as any);

      expect(mockRepository.updateWithRelations).toHaveBeenCalledWith(id, expect.objectContaining({
        logos: undefined,
      }));
    });

    it('should update brand kit successfully', async () => {
      const id = 'test-brand-id';
      const input = {
        colors: [{ hex: '#1A5E63' }],
        logos: [{ type: 'primary' as const }],
        taglinesAllowed: ['New tagline'],
        logoFiles: [
          {
            name: 'logo.svg',
            type: 'image/svg+xml',
            size: 1000,
            buffer: Buffer.from('test'),
          },
        ],
      };

      // brand exists
      (mockRepository.findById as jest.Mock).mockResolvedValue({
        id,
        name: 'Existing',
        description: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
        colors: [], logos: [], taglines: [],
      } as any);

      mockStorage.uploadLogo.mockResolvedValue({
        url: 'https://storage.googleapis.com/bucket/brands/test-brand-id/logo.svg',
        sizeBytes: 1000,
        mime: 'image/svg+xml',
      });

      mockRepository.updateWithRelations.mockResolvedValue({
        id,
        name: 'Existing',
        description: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T01:00:00Z'),
        colors: [{ id: 1, brandId: id, role: null, hex: '#1A5E63', darkVariant: null, allowAsBackground: true }],
        logos: [{
          id: 1,
          brandId: id,
          type: 'primary',
          url: 'https://storage.googleapis.com/bucket/brands/test-brand-id/logo.svg',
          mime: 'image/svg+xml',
          sizeBytes: 1000,
          widthPx: null,
          heightPx: null,
          minClearSpaceRatio: null,
          allowedPositions: null,
          bannedBackgrounds: null,
          monochrome: null,
          invertOnDark: null,
        }],
        taglines: [{ id: 1, brandId: id, text: 'New tagline' }],
      } as any);

      const result = await brandService.updateBrand(id, input);

      expect(result).toBeDefined();
      expect(result?.id).toBe(id);
      expect(mockStorage.uploadLogo).toHaveBeenCalledTimes(1);
      expect(mockRepository.updateWithRelations).toHaveBeenCalledTimes(1);
      expect(mockRepository.updateWithRelations).toHaveBeenCalledWith(id, expect.objectContaining({
        colors: input.colors,
        taglines: input.taglinesAllowed,
      }));
    });

    it('should return null when brand does not exist', async () => {
      const id = 'missing-id';
      (mockRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(brandService.updateBrand(id, {
        logos: [{ type: 'primary' as const }],
        logoFiles: [{
          name: 'logo.svg',
          type: 'image/svg+xml',
          size: 1000,
          buffer: Buffer.from('test'),
        }],
      })).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when logos/files count mismatch', async () => {
      const id = 'brand';
      // Ensure brand exists so the service reaches the mismatch validation
      (mockRepository.findById as jest.Mock).mockResolvedValue({
        id,
        name: 'Existing',
        description: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
        colors: [], logos: [], taglines: [],
      } as any);
      await expect(brandService.updateBrand(id, {
        logos: [{ type: 'primary' as const }, { type: 'stacked' as const }],
        logoFiles: [{
          name: 'logo.svg',
          type: 'image/svg+xml',
          size: 1000,
          buffer: Buffer.from('test'),
        }],
      } as any)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError on invalid color hex', async () => {
      const id = 'brand';
      await expect(brandService.updateBrand(id, {
        colors: [{ hex: 'invalid' } as any],
        logos: [{ type: 'primary' as const }],
        logoFiles: [{
          name: 'logo.svg',
          type: 'image/svg+xml',
          size: 1000,
          buffer: Buffer.from('test'),
        }],
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteBrand', () => {
    it('should delete brand and storage assets', async () => {
      const id = 'brand-id';
      (mockRepository.findById as jest.Mock).mockResolvedValue({ id } as any);

      await brandService.deleteBrand(id);

      expect(mockStorage.deleteLogos).toHaveBeenCalledWith(id);
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundError when brand not found', async () => {
      (mockRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(brandService.deleteBrand('missing')).rejects.toThrow(NotFoundError);
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

