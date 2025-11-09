import { FixService } from '@/services/fix.service';

// Mock prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    evaluation: {
      findUnique: jest.fn(),
    },
  },
}));

const mockedPrisma = require('@/lib/prisma').prisma as {
  evaluation: { findUnique: jest.Mock };
};

describe('FixService', () => {
  const originalEnv = process.env;
  let fixService: FixService;
  let resultsRepoMock: any;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, N8N_FIX_URL: 'https://n8n.example.com/fix' };
    // mock global fetch
    global.fetch = jest.fn() as any;

    resultsRepoMock = {
      create: jest.fn().mockResolvedValue({
        id: 'res-1',
        evaluationId: 'eval-1',
        url: 'https://cdn.example.com/fixed.mp4',
        payload: { resultUrl: 'https://cdn.example.com/fixed.mp4' },
        createdAt: new Date(),
      }),
    };
    fixService = new FixService(resultsRepoMock);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  test('throws ValidationError for missing id', async () => {
    await expect(fixService.fix('' as any)).rejects.toHaveProperty('code', 'BAD_REQUEST');
  });

  test('throws NotFoundError when evaluation not found', async () => {
    mockedPrisma.evaluation.findUnique.mockResolvedValueOnce(null);
    await expect(fixService.fix('eval-404')).rejects.toHaveProperty('code', 'NOT_FOUND');
  });

  test('throws config error when N8N_FIX_URL missing', async () => {
    process.env.N8N_FIX_URL = '';
    mockedPrisma.evaluation.findUnique.mockResolvedValueOnce({ id: 'eval-1' });
    await expect(fixService.fix('eval-1')).rejects.toHaveProperty('code', 'UPSTREAM_CONFIG_ERROR');
  });

  test('propagates upstream error with status', async () => {
    mockedPrisma.evaluation.findUnique.mockResolvedValueOnce({ id: 'eval-1' });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: async () => 'bad gateway',
    });
    await expect(fixService.fix('eval-1')).rejects.toMatchObject({
      code: 'UPSTREAM_ERROR',
      status: 502,
    });
  });

  test('creates EvaluationResult on success', async () => {
    mockedPrisma.evaluation.findUnique.mockResolvedValueOnce({
      id: 'eval-1',
      brandId: 'brand-1',
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ resultUrl: 'https://cdn.example.com/fixed.mp4', extra: true }),
    });
    const created = await fixService.fix('eval-1');
    expect(resultsRepoMock.create).toHaveBeenCalledWith(
      'eval-1',
      'https://cdn.example.com/fixed.mp4',
      { resultUrl: 'https://cdn.example.com/fixed.mp4', extra: true }
    );
    expect(created).toHaveProperty('url', 'https://cdn.example.com/fixed.mp4');
  });
});


