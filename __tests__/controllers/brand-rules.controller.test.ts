import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { BrandRulesController } from '../../controllers/brand-rules.controller';
import { BrandRulesService } from '../../services/brand-rules.service';
import { ConflictError, DatabaseError, NotFoundError, ValidationError } from '../../lib/errors';

let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, 'error');
  consoleErrorSpy.mockImplementation(() => {});
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

jest.mock('../../services/brand-rules.service');

describe('BrandRulesController', () => {
  let controller: BrandRulesController;
  let mockService: jest.Mocked<BrandRulesService>;

  beforeEach(() => {
    mockService = {
      createRules: jest.fn(),
      getRules: jest.fn(),
      updateRules: jest.fn(),
      listAll: jest.fn(),
    } as any;

    controller = new BrandRulesController(mockService);
  });

  const makeRequest = (body: string, contentType = 'application/json') => {
    const headers = new Map<string, string>([['content-type', contentType]]);
    return {
      headers: {
        get: (key: string) => headers.get(key.toLowerCase()) || null,
      },
      text: jest.fn().mockResolvedValue(body),
    } as any as NextRequest;
  };

  describe('create', () => {
    it('should return 201 on success', async () => {
      const req = makeRequest(JSON.stringify({ prohibitedClaims: [], tone: { allowed: [], bannedWords: [] }, logoUsage: { allowedPositions: [], bannedBackgrounds: [], invertOnDark: false, minClearSpaceRatio: 0 }, sensitive: { disallowCategories: [] }, requiredDisclaimers: [] }));
      const record = { id: 'r1', brandId: 'b1', rules: {}, createdAt: new Date(), updatedAt: new Date() } as any;
      mockService.createRules.mockResolvedValue(record);

      const res = await controller.create(req, 'b1');
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.id).toBe('r1');
    });

    it('should map ConflictError to 409', async () => {
      const req = makeRequest('{}');
      mockService.createRules.mockRejectedValue(new ConflictError('Rules already exist for this brand'));

      const res = await controller.create(req, 'b1');
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.code).toBe('CONFLICT');
    });

    it('should map ValidationError to 422', async () => {
      const req = makeRequest('{}');
      mockService.createRules.mockRejectedValue(new ValidationError('Invalid schema'));

      const res = await controller.create(req, 'b1');
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body.code).toBe('UNPROCESSABLE_ENTITY');
    });

    it('should map DatabaseError to 500', async () => {
      const req = makeRequest('{}');
      mockService.createRules.mockRejectedValue(new DatabaseError('db down'));

      const res = await controller.create(req, 'b1');
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.code).toBe('DATABASE_ERROR');
    });
  });

  describe('getOne', () => {
    it('should return 200 when found', async () => {
      mockService.getRules.mockResolvedValue({ id: 'r1' } as any);

      const res = await controller.getOne({} as any, 'b1');
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.id).toBe('r1');
    });

    it('should return 404 when not found', async () => {
      mockService.getRules.mockRejectedValue(new NotFoundError('Brand rules not found'));

      const res = await controller.getOne({} as any, 'b1');
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.code).toBe('NOT_FOUND');
    });
  });

  describe('update', () => {
    it('should return 200 on success', async () => {
      const req = makeRequest('{}');
      mockService.updateRules.mockResolvedValue({ id: 'r1' } as any);

      const res = await controller.update(req, 'b1');
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.id).toBe('r1');
    });

    it('should map NotFoundError to 404', async () => {
      const req = makeRequest('{}');
      mockService.updateRules.mockRejectedValue(new NotFoundError('Brand rules not found'));

      const res = await controller.update(req, 'b1');
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.code).toBe('NOT_FOUND');
    });

    it('should map ValidationError to 422', async () => {
      const req = makeRequest('{}');
      mockService.updateRules.mockRejectedValue(new ValidationError('Bad input'));

      const res = await controller.update(req, 'b1');
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body.code).toBe('UNPROCESSABLE_ENTITY');
    });
  });

  describe('listAll', () => {
    it('should return 200 with list', async () => {
      mockService.listAll.mockResolvedValue([{ id: 'r1' }] as any);

      const res = await controller.listAll();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body[0].id).toBe('r1');
    });

    it('should map DatabaseError to 500', async () => {
      mockService.listAll.mockRejectedValue(new DatabaseError('oops'));

      const res = await controller.listAll();
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.code).toBe('DATABASE_ERROR');
    });
  });
});


