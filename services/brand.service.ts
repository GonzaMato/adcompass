import { BrandRepository, brandRepository } from '../repositories/brand.repository';
import { StorageService, storageService } from './storage.service';
import { BrandInputSchema, validateLogoFile } from '../lib/validators/brand.validator';
import { ValidationError } from '../lib/errors';
import { ZodError } from 'zod';
import { 
  CreateBrandDTO, 
  BrandResponse, 
  CreateBrandData,
  LogoInput 
} from '../types';

export class BrandService {
  constructor(
    private repository: BrandRepository = brandRepository,
    private storage: StorageService = storageService
  ) {}

  async createBrand(input: CreateBrandDTO): Promise<BrandResponse> {
    // Validate input structure
    try {
      BrandInputSchema.parse({
        name: input.name,
        description: input.description,
        colors: input.colors,
        logos: input.logos,
        taglinesAllowed: input.taglinesAllowed,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        throw new ValidationError(
          firstError.message,
          firstError.path.join('.')
        );
      }
      throw error;
    }

    // Check if brand name already exists
    const nameExists = await this.repository.existsByName(input.name);
    if (nameExists) {
      throw new ValidationError('A brand with this name already exists', 'name');
    }

    // Validate logo files count matches logos array
    if (input.logoFiles.length !== input.logos.length) {
      throw new ValidationError(
        `Expected ${input.logos.length} logo files, but received ${input.logoFiles.length}`
      );
    }

    // Validate each logo file
    for (const file of input.logoFiles) {
      const validation = validateLogoFile(file as any);
      if (!validation.valid) {
        throw new ValidationError(validation.error || 'Invalid logo file');
      }
    }

    // Generate brand ID for GCS path
    const brandId = crypto.randomUUID();

    // Upload logos to GCS
    const uploadedLogos = await Promise.all(
      input.logoFiles.map(async (file, index) => {
        const logoInput = input.logos[index];
        const uploaded = await this.storage.uploadLogo(
          file.buffer,
          file.name,
          file.type,
          brandId
        );

        return {
          type: logoInput.type,
          url: uploaded.url,
          mime: uploaded.mime,
          sizeBytes: uploaded.sizeBytes,
          allowedPositions: logoInput.allowedPositions,
          bannedBackgrounds: logoInput.bannedBackgrounds,
          monochrome: logoInput.monochrome,
          invertOnDark: logoInput.invertOnDark,
          minClearSpaceRatio: logoInput.minClearSpaceRatio,
        };
      })
    );

    // Create brand in database
    const brandData: CreateBrandData = {
      name: input.name,
      description: input.description,
      colors: input.colors,
      logos: uploadedLogos,
      taglines: input.taglinesAllowed,
    };

    const brand = await this.repository.createWithRelations(brandData);

    // Transform to API response format
    return this.transformToResponse(brand);
  }

  async getBrandById(id: string): Promise<BrandResponse | null> {
    const brand = await this.repository.findById(id);
    if (!brand) {
      return null;
    }
    return this.transformToResponse(brand);
  }

  async getAllBrands(): Promise<BrandResponse[]> {
    const brands = await this.repository.findAll();
    return brands.map((brand) => this.transformToResponse(brand));
  }

  private transformToResponse(brand: any): BrandResponse {
    return {
      id: brand.id,
      name: brand.name,
      description: brand.description || undefined,
      colors: brand.colors.map((color: any) => ({
        role: color.role || undefined,
        hex: color.hex,
        darkVariant: color.darkVariant || undefined,
        allowAsBackground: color.allowAsBackground,
      })),
      logos: brand.logos.map((logo: any) => ({
        id: `lg_${logo.id}`,
        type: logo.type,
        url: logo.url,
        mime: logo.mime,
        sizeBytes: logo.sizeBytes || undefined,
        widthPx: logo.widthPx || undefined,
        heightPx: logo.heightPx || undefined,
        minClearSpaceRatio: logo.minClearSpaceRatio || undefined,
        allowedPositions: logo.allowedPositions || undefined,
        bannedBackgrounds: logo.bannedBackgrounds || undefined,
        monochrome: logo.monochrome || undefined,
        invertOnDark: logo.invertOnDark || undefined,
      })),
      taglinesAllowed: brand.taglines.map((t: any) => t.text),
      createdAt: brand.createdAt.toISOString(),
      updatedAt: brand.updatedAt.toISOString(),
    };
  }
}

export const brandService = new BrandService();

