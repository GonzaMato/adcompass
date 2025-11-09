import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BrandRepository } from '../../repositories/brand.repository';
import { DatabaseError } from '../../lib/errors';

// Mock Prisma Client
let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

const mockPrismaClient = {
  brand: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  color: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  logo: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  tagline: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('BrandRepository', () => {
  let brandRepository: BrandRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    brandRepository = new BrandRepository(mockPrismaClient as any);
  });

  describe('updateWithRelations', () => {
    it('should replace colors, logos and taglines and bump updatedAt', async () => {
      const id = 'brand-1';
      const brandData = {
        colors: [{ hex: '#1A5E63', allowAsBackground: true }],
        logos: [{ type: 'primary', url: 'https://url/logo.svg', mime: 'image/svg+xml' }],
        taglines: ['Hello'],
      };

      const mockResult = {
        id,
        name: 'Brand 1',
        description: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01T01:00:00Z'),
        colors: [{ id: 1, brandId: id, role: null, hex: '#1A5E63', darkVariant: null, allowAsBackground: true }],
        logos: [{ id: 1, brandId: id, type: 'primary', url: 'https://url/logo.svg', mime: 'image/svg+xml', sizeBytes: null, widthPx: null, heightPx: null, minClearSpaceRatio: null, allowedPositions: null, bannedBackgrounds: null, monochrome: null, invertOnDark: null }],
        taglines: [{ id: 1, brandId: id, text: 'Hello' }],
      };

      mockPrismaClient.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          brand: {
            findUnique: jest.fn()
              .mockResolvedValueOnce({ id }) // existence check
              .mockResolvedValueOnce(mockResult), // final fetch
            update: jest.fn().mockResolvedValue({ id }),
          },
          color: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          logo: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          tagline: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return cb(tx);
      });

      const repository = new BrandRepository(mockPrismaClient as any);
      const result = await repository.updateWithRelations(id, brandData as any);

      expect(result).toBeDefined();
      expect(result?.id).toBe(id);
      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
    });

    it('should return null when brand not found', async () => {
      const id = 'missing';

      mockPrismaClient.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          brand: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return cb(tx);
      });

      const repository = new BrandRepository(mockPrismaClient as any);
      const result = await repository.updateWithRelations(id, { logos: [] } as any);

      expect(result).toBeNull();
    });
  });

  describe('createWithRelations', () => {
    it('should create a brand with all relations', async () => {
      const brandData = {
        name: 'Test Brand',
        description: 'Test description',
        colors: [{ hex: '#FF0000', allowAsBackground: true }],
        logos: [
          {
            type: 'primary',
            url: 'https://example.com/logo.svg',
            mime: 'image/svg+xml',
            sizeBytes: 1000,
          },
        ],
        taglines: ['Test tagline'],
      };

      const mockCreatedBrand = {
        id: 'test-brand-id',
        name: 'Test Brand',
        description: 'Test description',
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
            url: 'https://example.com/logo.svg',
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
      };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        return callback({
          brand: {
            create: jest.fn().mockResolvedValue({
              id: 'test-brand-id',
              name: 'Test Brand',
              description: 'Test description',
            }),
            findUnique: jest.fn().mockResolvedValue(mockCreatedBrand),
          },
          color: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          logo: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          tagline: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        });
      });

      const result = await brandRepository.createWithRelations(brandData);

      expect(result).toBeDefined();
      expect(result.id).toBe('test-brand-id');
      expect(result.name).toBe('Test Brand');
      expect(result.colors).toHaveLength(1);
      expect(result.logos).toHaveLength(1);
      expect(result.taglines).toHaveLength(1);
    });

    it('should throw DatabaseError on failure', async () => {
      const brandData = {
        name: 'Test Brand',
        colors: [{ hex: '#FF0000' }],
        logos: [
          {
            type: 'primary',
            url: 'https://example.com/logo.svg',
            mime: 'image/svg+xml',
          },
        ],
      };

      mockPrismaClient.$transaction.mockRejectedValue(new Error('Database error'));

      await expect(brandRepository.createWithRelations(brandData)).rejects.toThrow(DatabaseError);
    });
  });

  describe('findById', () => {
    it('should return a brand by ID', async () => {
      const mockBrand = {
        id: 'test-brand-id',
        name: 'Test Brand',
        description: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        colors: [],
        logos: [],
        taglines: [],
      };

      mockPrismaClient.brand.findUnique.mockResolvedValue(mockBrand);

      const result = await brandRepository.findById('test-brand-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('test-brand-id');
      expect(mockPrismaClient.brand.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-brand-id' },
        include: { colors: true, logos: true, taglines: true },
      });
    });

    it('should return null when brand not found', async () => {
      mockPrismaClient.brand.findUnique.mockResolvedValue(null);

      const result = await brandRepository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw DatabaseError on failure', async () => {
      mockPrismaClient.brand.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(brandRepository.findById('test-brand-id')).rejects.toThrow(DatabaseError);
    });
  });

  describe('findAll', () => {
    it('should return all brands', async () => {
      const mockBrands = [
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
      ];

      mockPrismaClient.brand.findMany.mockResolvedValue(mockBrands);

      const result = await brandRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Brand 1');
      expect(result[1].name).toBe('Brand 2');
    });

    it('should throw DatabaseError on failure', async () => {
      mockPrismaClient.brand.findMany.mockRejectedValue(new Error('Database error'));

      await expect(brandRepository.findAll()).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete', () => {
    it('should delete a brand', async () => {
      mockPrismaClient.brand.delete.mockResolvedValue({
        id: 'test-brand-id',
        name: 'Test Brand',
      } as any);

      await brandRepository.delete('test-brand-id');

      expect(mockPrismaClient.brand.delete).toHaveBeenCalledWith({
        where: { id: 'test-brand-id' },
      });
    });

    it('should throw DatabaseError on failure', async () => {
      mockPrismaClient.brand.delete.mockRejectedValue(new Error('Database error'));

      await expect(brandRepository.delete('test-brand-id')).rejects.toThrow(DatabaseError);
    });
  });
});

