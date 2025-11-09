import { POST } from '@/app/api/evaluations/[id]/fix/route';

jest.mock('@/services/fix.service', () => ({
  fixService: {
    fix: jest.fn(),
  },
}));

const { fixService } = require('@/services/fix.service');

describe('POST /api/evaluations/[id]/fix', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('returns 200 with created result', async () => {
    const created = { id: 'res-1', evaluationId: 'eval-1', url: 'https://u', createdAt: new Date().toISOString() };
    fixService.fix.mockResolvedValueOnce(created);
    const res = await POST({} as any, { params: { id: 'eval-1' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject(created);
  });

  test('maps ValidationError to 400', async () => {
    const err = new Error('bad') as any;
    err.code = 'BAD_REQUEST';
    fixService.fix.mockRejectedValueOnce(err);
    const res = await POST({} as any, { params: { id: '' } });
    expect(res.status).toBe(400);
  });

  test('maps NotFoundError to 404', async () => {
    const err = new Error('not found') as any;
    err.code = 'NOT_FOUND';
    fixService.fix.mockRejectedValueOnce(err);
    const res = await POST({} as any, { params: { id: 'missing' } });
    expect(res.status).toBe(404);
  });

  test('maps DatabaseError to 500', async () => {
    const err = new Error('db') as any;
    err.code = 'DATABASE_ERROR';
    fixService.fix.mockRejectedValueOnce(err);
    const res = await POST({} as any, { params: { id: 'eval-1' } });
    expect(res.status).toBe(500);
  });

  test('maps upstream timeout to 504', async () => {
    const err = new Error('timeout') as any;
    err.code = 'UPSTREAM_TIMEOUT';
    fixService.fix.mockRejectedValueOnce(err);
    const res = await POST({} as any, { params: { id: 'eval-1' } });
    expect(res.status).toBe(504);
  });

  test('maps upstream error to 502', async () => {
    const err = new Error('upstream') as any;
    err.code = 'UPSTREAM_ERROR';
    err.status = 502;
    fixService.fix.mockRejectedValueOnce(err);
    const res = await POST({} as any, { params: { id: 'eval-1' } });
    expect(res.status).toBe(502);
  });

  test('maps config error to 500 with UPSTREAM_CONFIG_ERROR', async () => {
    const err = new Error('config') as any;
    err.code = 'UPSTREAM_CONFIG_ERROR';
    fixService.fix.mockRejectedValueOnce(err);
    const res = await POST({} as any, { params: { id: 'eval-1' } });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe('UPSTREAM_CONFIG_ERROR');
  });
});


