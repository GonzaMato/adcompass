import { NextRequest, NextResponse } from 'next/server';
import { evaluationRepository } from '../../../repositories/evaluation.repository';
import { DatabaseError, NotFoundError, ValidationError } from '../../../lib/errors';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const brandId = searchParams.get('brandId') || undefined;
  const ruleId = searchParams.get('ruleId') || undefined;

  try {
    if (!brandId || typeof brandId !== 'string') {
      throw new ValidationError('Missing or invalid brandId', 'brandId');
    }
    if (!ruleId || typeof ruleId !== 'string') {
      throw new ValidationError('Missing or invalid ruleId', 'ruleId');
    }

    const evaluation = await evaluationRepository.findLatestByBrandAndRule(brandId, ruleId);
    if (!evaluation) {
      throw new NotFoundError('Evaluation not found');
    }

    return NextResponse.json({ evaluation }, { status: 200 });
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

    console.error('Unexpected error in GET /api/evaluations:', error);
    return NextResponse.json(
      { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}



