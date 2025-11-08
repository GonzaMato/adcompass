import { NextRequest, NextResponse } from 'next/server';
import { BrandService, brandService } from '../services/brand.service';
import { ValidationError, StorageError, DatabaseError } from '../lib/errors';
import { CreateBrandDTO, LogoFile } from '../types';

export class BrandController {
  constructor(private service: BrandService = brandService) {}

  async createBrand(request: NextRequest): Promise<NextResponse> {
    try {
      // Parse multipart form data
      const formData = await request.formData();

      // Extract brand data
      const name = formData.get('name') as string;
      const description = formData.get('description') as string | null;
      const colorsJson = formData.get('colors') as string | null;
      const logosJson = formData.get('logos') as string;
      const taglinesJson = formData.get('taglinesAllowed') as string | null;

      // Validate required fields
      if (!name) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Missing field: name' },
          { status: 400 }
        );
      }

      if (!logosJson) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Missing field: logos' },
          { status: 400 }
        );
      }

      // Parse JSON fields
      let colors, logos, taglinesAllowed;
      try {
        colors = colorsJson ? JSON.parse(colorsJson) : undefined;
        logos = JSON.parse(logosJson);
        taglinesAllowed = taglinesJson ? JSON.parse(taglinesJson) : undefined;
      } catch (error) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Invalid JSON format in logos or taglinesAllowed' },
          { status: 400 }
        );
      }

      // Extract logo files
      const logoFiles: LogoFile[] = [];
      
      for (let i = 0; i < logos.length; i++) {
        const file = formData.get(`logoFile${i}`) as File | null;
        if (!file) {
          return NextResponse.json(
            { code: 'BAD_REQUEST', message: `Missing logo file at index ${i}` },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        logoFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          buffer,
        });
      }

      // Call service
      const brand = await this.service.createBrand({
        name,
        description: description || undefined,
        colors,
        logos,
        taglinesAllowed,
        logoFiles,
      });

      return NextResponse.json(brand, { status: 201 });
    } catch (error) {
      console.error('Error in createBrand controller:', error);

      if (error instanceof ValidationError) {
        return NextResponse.json(
          { 
            code: error.code, 
            message: error.message,
            field: error.field 
          },
          { status: 400 }
        );
      }

      if (error instanceof StorageError) {
        return NextResponse.json(
          { code: error.code, message: error.message },
          { status: 500 }
        );
      }

      if (error instanceof DatabaseError) {
        return NextResponse.json(
          { code: error.code, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  }

  async getBrandById(id: string): Promise<NextResponse> {
    try {
      const brand = await this.service.getBrandById(id);
      
      if (!brand) {
        return NextResponse.json(
          { code: 'NOT_FOUND', message: 'Brand not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(brand);
    } catch (error) {
      console.error('Error in getBrandById controller:', error);

      if (error instanceof DatabaseError) {
        return NextResponse.json(
          { code: error.code, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  }

  async getAllBrands(): Promise<NextResponse> {
    try {
      const brands = await this.service.getAllBrands();
      return NextResponse.json(brands);
    } catch (error) {
      console.error('Error in getAllBrands controller:', error);

      if (error instanceof DatabaseError) {
        return NextResponse.json(
          { code: error.code, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  }
}

export const brandController = new BrandController();

