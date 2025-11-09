import { NextRequest, NextResponse } from 'next/server';
import { evaluationService } from '../../../services/evaluation.service';
import { DatabaseError, ValidationError } from '../../../lib/errors';
import { storageService } from '../../../services/storage.service';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Multipart/form-data branch: expects File, brandId, ruleId
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const brandId = (formData.get('brandId') as string) || '';
      const ruleId = (formData.get('ruleId') as string) || '';
      const file = (formData.get('asset') as File | null) || (formData.get('image') as File | null);

      if (!brandId) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Missing field: brandId' },
          { status: 400 }
        );
      }
      if (!ruleId) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Missing field: ruleId' },
          { status: 400 }
        );
      }
      if (!file) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Missing file field: asset' },
          { status: 400 }
        );
      }

      // Validate file constraints: JPG/PNG <= 10MB
      const maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'File too large. Max 10MB' },
          { status: 400 }
        );
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Unsupported file type. Use JPG or PNG' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uniqueName = `eval_${Date.now()}_${file.name}`;

      // Reuse existing storage service
      const uploaded = await storageService.uploadLogo(buffer, uniqueName, file.type, brandId);
      const imageUrl = uploaded.url;

      const result = await evaluationService.evaluate({ brandId, ruleId, imageUrl });
      return NextResponse.json(result, { status: 200 });
    }

    // JSON branch: fallback for existing clients
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { brandId, ruleId, imageUrl } = body as {
      brandId?: string;
      ruleId?: string;
      imageUrl?: string;
    };

    if (!brandId) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Missing field: brandId' },
        { status: 400 }
      );
    }
    if (!ruleId) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Missing field: ruleId' },
        { status: 400 }
      );
    }
    if (!imageUrl) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Missing field: imageUrl' },
        { status: 400 }
      );
    }

    const result = await evaluationService.evaluate({ brandId, ruleId, imageUrl });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Known domain errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { code: error.code, message: error.message, field: error.field },
        { status: 400 }
      );
    }
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: 500 }
      );
    }

    const code = (error as any)?.code as string | undefined;
    const status = (error as any)?.status as number | undefined;
    const details = (error as any)?.details;

    if (code === 'UPSTREAM_TIMEOUT') {
      return NextResponse.json(
        { code: 'UPSTREAM_TIMEOUT', message: 'Upstream request timed out' },
        { status: 504 }
      );
    }
    if (code === 'UPSTREAM_ERROR') {
      return NextResponse.json(
        {
          code: 'UPSTREAM_ERROR',
          message: 'Upstream service returned an error',
          upstreamStatus: status,
          details,
        },
        { status: 502 }
      );
    }
    if (code === 'UPSTREAM_CONFIG_ERROR') {
      return NextResponse.json(
        { code: 'UPSTREAM_CONFIG_ERROR', message: 'N8N_EVALUATE_URL is not configured' },
        { status: 500 }
      );
    }

    console.error('Unexpected error in /api/evaluate:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


