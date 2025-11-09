import { GET } from '@/app/api/evaluations/[id]/results/route';

jest.mock('@/repositories/evaluationResult.repository', () => ({
  evaluationResultRepository: {
    listByEvaluationId: jest.fn(),
  },
}));

const { evaluationResultRepository } = require('@/repositories/evaluationResult.repository');

describe('GET /api/evaluations/[id]/results', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('returns 200 with results array', async () => {
    const rows = [
      { id: 'r1', evaluationId: 'eval-1', url: 'https://a', createdAt: new Date().toISOString() },
      { id: 'r2', evaluationId: 'eval-1', url: 'https://b', createdAt: new Date().toISOString() },
    ];
    evaluationResultRepository.listByEvaluationId.mockResolvedValueOnce(rows);
    const res = await GET({} as any, { params: { id: 'eval-1' } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBe(2);
  });

  test('returns 400 for missing id', async () => {
    const res = await GET({} as any, { params: { id: '' } });
    expect(res.status).toBe(400);
  });

  test('returns 500 for repository error', async () => {
    const err = new Error('db') as any;
    err.code = 'DATABASE_ERROR';
    evaluationResultRepository.listByEvaluationId.mockRejectedValueOnce(err);
    const res = await GET({} as any, { params: { id: 'eval-1' } });
    expect(res.status).toBe(500);
  });
});


