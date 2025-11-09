import { NextRequest, NextResponse } from 'next/server';
import { brandRulesService } from '../services/brand-rules.service';
import { ValidationError, DatabaseError, NotFoundError, ConflictError } from '../lib/errors';

export class BrandRulesController {
  constructor(private service = brandRulesService) {}

  async create(request: NextRequest, brandId: string): Promise<NextResponse> {
    try {
      const contentType = request.headers.get('content-type');
      const raw = await request.text();
      const created = await this.service.createRules(brandId, raw, contentType);
      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json({ code: 'UNPROCESSABLE_ENTITY', message: error.message }, { status: 422 });
      }
      if (error instanceof DatabaseError) {
        return NextResponse.json({ code: error.code, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, { status: 500 });
    }
  }

  async listByBrand(_request: NextRequest, brandId: string): Promise<NextResponse> {
    try {
      const items = await this.service.listByBrand(brandId);
      return NextResponse.json(items);
    } catch (error) {
      if (error instanceof DatabaseError) {
        return NextResponse.json({ code: error.code, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, { status: 500 });
    }
  }

  async getById(_request: NextRequest, brandId: string, ruleId: string): Promise<NextResponse> {
    try {
      const found = await this.service.getById(brandId, ruleId);
      return NextResponse.json(found);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return NextResponse.json({ code: 'NOT_FOUND', message: error.message }, { status: 404 });
      }
      if (error instanceof DatabaseError) {
        return NextResponse.json({ code: error.code, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, { status: 500 });
    }
  }

  async updateById(request: NextRequest, brandId: string, ruleId: string): Promise<NextResponse> {
    try {
      const contentType = request.headers.get('content-type');
      const raw = await request.text();
      const updated = await this.service.updateById(brandId, ruleId, raw, contentType);
      return NextResponse.json(updated, { status: 200 });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return NextResponse.json({ code: 'NOT_FOUND', message: error.message }, { status: 404 });
      }
      if (error instanceof ValidationError) {
        return NextResponse.json({ code: 'UNPROCESSABLE_ENTITY', message: (error as Error).message }, { status: 422 });
      }
      if (error instanceof DatabaseError) {
        return NextResponse.json({ code: error.code, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, { status: 500 });
    }
  }

  async listAll(): Promise<NextResponse> {
    try {
      const items = await this.service.listAll();
      return NextResponse.json(items);
    } catch (error) {
      if (error instanceof DatabaseError) {
        return NextResponse.json({ code: error.code, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, { status: 500 });
    }
  }

  async deleteById(_request: NextRequest, brandId: string, ruleId: string): Promise<NextResponse> {
    try {
      await this.service.deleteById(brandId, ruleId);
      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return NextResponse.json({ code: 'NOT_FOUND', message: error.message }, { status: 404 });
      }
      if (error instanceof DatabaseError) {
        return NextResponse.json({ code: error.code, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}

export const brandRulesController = new BrandRulesController();


