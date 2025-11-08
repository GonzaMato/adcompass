import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { BrandController } from '../../controllers/brand.controller';
import { BrandService } from '../../services/brand.service';
import { ValidationError, StorageError, DatabaseError } from '../../lib/errors';

// Mock the service
jest.mock('../../services/brand.service');

describe('BrandController', () => {
  let brandController: BrandController;
  let mockService: jest.Mocked<BrandService>;

  beforeEach(() => {
    mockService = {
      createBrand: jest.fn(),
      getBrandById: jest.fn(),
      getAllBrands: jest.fn(),
    } as any;

    brandController = new BrandController(mockService);
  });

  describe('createBrand', () => {
    it('should return 400 when name is missing', async () => {
      const formData = new FormData();
      formData.append('colors', JSON.stringify([{ hex: '#FF0000' }]));
      formData.append('logos', JSON.stringify([{ type: 'primary' }]));

      const request = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any as NextRequest;

      const response = await brandController.createBrand(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.code).toBe('BAD_REQUEST');
      expect(body.message).toContain('name');
    });

    it('should return 400 when logo file is missing', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Brand');
      formData.append('colors', JSON.stringify([{ hex: '#FF0000' }]));
      formData.append('logos', JSON.stringify([{ type: 'primary' }]));
      // Not including logoFile0

      const request = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any as NextRequest;

      const response = await brandController.createBrand(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.code).toBe('BAD_REQUEST');
      expect(body.message).toContain('Missing logo file at index 0');
    });

    it('should return 400 when logos is missing', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Brand');
      formData.append('colors', JSON.stringify([{ hex: '#FF0000' }]));

      const request = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any as NextRequest;

      const response = await brandController.createBrand(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.code).toBe('BAD_REQUEST');
      expect(body.message).toContain('logos');
    });

    it('should return 400 when ValidationError is thrown', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Brand');
      formData.append('colors', JSON.stringify([{ hex: '#FF0000' }]));
      formData.append('logos', JSON.stringify([{ type: 'primary' }]));

      // Mock file
      const file = new File(['test'], 'logo.svg', { type: 'image/svg+xml' });
      formData.append('logoFile0', file);

      const request = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any as NextRequest;

      mockService.createBrand.mockRejectedValue(
        new ValidationError('Invalid HEX color', 'colors.0.hex')
      );

      const response = await brandController.createBrand(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.code).toBe('BAD_REQUEST');
      expect(body.message).toContain('Invalid HEX color');
    });

    it('should return 500 when StorageError is thrown', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Brand');
      formData.append('colors', JSON.stringify([{ hex: '#FF0000' }]));
      formData.append('logos', JSON.stringify([{ type: 'primary' }]));

      const file = new File(['test'], 'logo.svg', { type: 'image/svg+xml' });
      formData.append('logoFile0', file);

      const request = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any as NextRequest;

      mockService.createBrand.mockRejectedValue(
        new StorageError('Failed to upload to GCS')
      );

      const response = await brandController.createBrand(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.code).toBe('STORAGE_ERROR');
    });

    it('should return 500 when DatabaseError is thrown', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Brand');
      formData.append('colors', JSON.stringify([{ hex: '#FF0000' }]));
      formData.append('logos', JSON.stringify([{ type: 'primary' }]));

      const file = new File(['test'], 'logo.svg', { type: 'image/svg+xml' });
      formData.append('logoFile0', file);

      const request = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any as NextRequest;

      mockService.createBrand.mockRejectedValue(
        new DatabaseError('Failed to create brand')
      );

      const response = await brandController.createBrand(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.code).toBe('DATABASE_ERROR');
    });

    it('should return 201 with brand data on success', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Brand');
      formData.append('description', 'Test description');
      formData.append('colors', JSON.stringify([{ hex: '#FF0000' }]));
      formData.append('logos', JSON.stringify([{ type: 'primary' }]));
      formData.append('taglinesAllowed', JSON.stringify(['Test tagline']));

      const file = new File(['test'], 'logo.svg', { type: 'image/svg+xml' });
      formData.append('logoFile0', file);

      const request = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any as NextRequest;

      const mockBrand = {
        id: 'test-brand-id',
        name: 'Test Brand',
        description: 'Test description',
        colors: [{ hex: '#FF0000', allowAsBackground: true }],
        logos: [
          {
            id: 'lg_1',
            type: 'primary',
            url: 'https://storage.googleapis.com/bucket/brands/test-id/logo.svg',
            mime: 'image/svg+xml',
          },
        ],
        taglinesAllowed: ['Test tagline'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockService.createBrand.mockResolvedValue(mockBrand);

      const response = await brandController.createBrand(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.id).toBe('test-brand-id');
      expect(body.name).toBe('Test Brand');
    });
  });

  describe('getBrandById', () => {
    it('should return 404 when brand not found', async () => {
      mockService.getBrandById.mockResolvedValue(null);

      const response = await brandController.getBrandById('non-existent-id');
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.code).toBe('NOT_FOUND');
    });

    it('should return brand data when found', async () => {
      const mockBrand = {
        id: 'test-brand-id',
        name: 'Test Brand',
        colors: [],
        logos: [],
        taglinesAllowed: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockService.getBrandById.mockResolvedValue(mockBrand);

      const response = await brandController.getBrandById('test-brand-id');
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.id).toBe('test-brand-id');
    });
  });

  describe('getAllBrands', () => {
    it('should return all brands', async () => {
      const mockBrands = [
        {
          id: 'brand-1',
          name: 'Brand 1',
          colors: [],
          logos: [],
          taglinesAllowed: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'brand-2',
          name: 'Brand 2',
          colors: [],
          logos: [],
          taglinesAllowed: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockService.getAllBrands.mockResolvedValue(mockBrands);

      const response = await brandController.getAllBrands();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveLength(2);
    });
  });
});

