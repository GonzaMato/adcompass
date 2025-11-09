import { NextRequest } from 'next/server';
import { brandController } from '../../../controllers/brand.controller';

// POST /api/brands - Create a new brand
export async function POST(request: NextRequest) {
  return brandController.createBrand(request);
}

// GET /api/brands - Get all brands
export async function GET() {
  return brandController.getAllBrands();
}
