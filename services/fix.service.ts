import { prisma } from '../lib/prisma';
import { DatabaseError, NotFoundError, ValidationError } from '../lib/errors';
import { EvaluationResultRepository, evaluationResultRepository } from '../repositories/evaluationResult.repository';

interface UpstreamError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
}

export class FixService {
  constructor(private resultsRepo: EvaluationResultRepository = evaluationResultRepository) {}

  async fix(evaluationId: string) {
    if (!evaluationId || typeof evaluationId !== 'string') {
      throw new ValidationError('Missing or invalid evaluationId', 'evaluationId');
    }

    // Load evaluation entity
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
    });
    if (!evaluation) {
      throw new NotFoundError(`Evaluation not found: ${evaluationId}`);
    }

    const n8nUrl = process.env.N8N_FIX_URL;
    if (!n8nUrl) {
      const err: UpstreamError = new Error('N8N_FIX_URL is not configured');
      err.code = 'UPSTREAM_CONFIG_ERROR';
      throw err;
    }

    const timeoutMs = Number(process.env.FIX_TIMEOUT_MS || process.env.EVALUATE_TIMEOUT_MS || 12000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Send full evaluation entity to n8n
      const upstreamResponse = await fetch(n8nUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ evaluation }),
        signal: controller.signal,
      });

      if (!upstreamResponse.ok) {
        const text = await upstreamResponse.text().catch(() => '');
        const err: UpstreamError = new Error('Upstream n8n error');
        err.code = 'UPSTREAM_ERROR';
        err.status = upstreamResponse.status;
        err.details = text;
        throw err;
      }

      const payload = await upstreamResponse.json().catch(() => ({}));
      const resultUrl: string | undefined = payload?.resultUrl || payload?.url;
      if (!resultUrl || typeof resultUrl !== 'string') {
        // Still persist payload, but indicate missing URL clearly
        throw new DatabaseError('Upstream did not return a resultUrl');
      }

      // Persist and return created record
      const created = await this.resultsRepo.create(evaluationId, resultUrl, payload);
      return created;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        const err: UpstreamError = new Error('Upstream request timed out');
        err.code = 'UPSTREAM_TIMEOUT';
        throw err;
      }
      if (error instanceof ValidationError || error instanceof DatabaseError || error instanceof NotFoundError) {
        throw error;
      }
      const err = error as UpstreamError;
      if (!err.code) {
        err.code = 'UPSTREAM_ERROR';
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const fixService = new FixService();


