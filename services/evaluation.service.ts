import { EvaluationRepository, evaluationRepository } from '../repositories/evaluation.repository';
import { DatabaseError, ValidationError } from '../lib/errors';
import { EvaluateRequestDTO } from '../types/evaluation.types';

interface UpstreamError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
}

export class EvaluationService {
  constructor(private repo: EvaluationRepository = evaluationRepository) {}

  async evaluate(input: EvaluateRequestDTO): Promise<unknown> {
    // Normalize legacy fields
    const normalizedAssetUrl = input.assetUrl || input.imageUrl;
    const normalizedAssetType = input.assetType || (input.imageUrl ? 'IMAGE' : undefined);

    // Validate input
    const { brandId, ruleId, context } = input || ({} as any);
    if (!brandId || typeof brandId !== 'string') {
      throw new ValidationError('Missing or invalid brandId', 'brandId');
    }
    if (!ruleId || typeof ruleId !== 'string') {
      throw new ValidationError('Missing or invalid ruleId', 'ruleId');
    }
    if (!normalizedAssetUrl || typeof normalizedAssetUrl !== 'string') {
      throw new ValidationError('Missing or invalid assetUrl', 'assetUrl');
    }
    if (!normalizedAssetType || (normalizedAssetType !== 'IMAGE' && normalizedAssetType !== 'VIDEO')) {
      throw new ValidationError('Missing or invalid assetType', 'assetType');
    }

    const n8nUrl = process.env.N8N_EVALUATE_URL;
    if (!n8nUrl) {
      const err: UpstreamError = new Error('N8N_EVALUATE_URL is not configured');
      err.code = 'UPSTREAM_CONFIG_ERROR';
      throw err;
    }

    const timeoutMs = Number(process.env.EVALUATE_TIMEOUT_MS || 12000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const upstreamResponse = await fetch(n8nUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          brandId,
          ruleId,
          // New fields
          assetUrl: normalizedAssetUrl,
          assetType: normalizedAssetType,
          context,
          // Legacy field for backward compatibility
          image: normalizedAssetUrl,
        }),
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

      const payload = await upstreamResponse.json();

      // Persist result
      await this.repo.create(input, payload);

      // Return upstream JSON as-is
      return payload;
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        const err: UpstreamError = new Error('Upstream request timed out');
        err.code = 'UPSTREAM_TIMEOUT';
        throw err;
      }
      if (error instanceof ValidationError || error instanceof DatabaseError) {
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

export const evaluationService = new EvaluationService();


