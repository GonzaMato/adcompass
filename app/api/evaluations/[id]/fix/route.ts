import { NextRequest, NextResponse } from 'next/server';
import { fixService } from '../../../../../services/fix.service';
import { DatabaseError, NotFoundError, ValidationError } from '../../../../../lib/errors';

export async function POST(
  _request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id: evaluationId } = await Promise.resolve(context.params);
  try {
    const created = await fixService.fix(evaluationId);
    return NextResponse.json(created, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { code: error.code, message: error.message, field: error.field },
        { status: 400 }
      );
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: 404 }
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

    // Map by code as well (tests may mock generic Errors with code)
    if (code === 'BAD_REQUEST') {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: (error as any)?.message || 'Bad request' },
        { status: 400 }
      );
    }
    if (code === 'NOT_FOUND') {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: (error as any)?.message || 'Not found' },
        { status: 404 }
      );
    }
    if (code === 'DATABASE_ERROR') {
      return NextResponse.json(
        { code: 'DATABASE_ERROR', message: (error as any)?.message || 'Database error' },
        { status: 500 }
      );
    }

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
        { code: 'UPSTREAM_CONFIG_ERROR', message: 'N8N_FIX_URL is not configured' },
        { status: 500 }
      );
    }

    console.error('Unexpected error in POST /api/evaluations/[id]/fix:', error);
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


