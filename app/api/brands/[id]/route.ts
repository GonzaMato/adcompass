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

// DELETE /api/brands/{id} - Delete a brand and its assets
export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return brandController.deleteBrand(id);
}


