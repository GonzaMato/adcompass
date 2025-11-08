import { NextRequest } from 'next/server';
import { brandController } from '../../../../controllers/brand.controller';

// GET /api/brands/{id} - Get a brand by ID
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return brandController.getBrandById(id);
}

// PUT /api/brands/{id} - Full BrandKit replacement (colors, logos, taglines)
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return brandController.updateBrand(request, id);
}


