"use client";

import { useEffect, useState } from "react";
import { Brand } from "../types/brand";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { ScrollReveal } from "../components/ScrollReveal";
import { BackgroundBeams } from "../components/ui/BackgroundBeams";
import { BackgroundGradient } from "../components/ui/BackgroundGradient";
import { BrandModal } from "../components/BrandModal";
import { brandsAPI } from "@/lib/api";

export default function DemoPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<'select-brand' | 'evaluate'>('select-brand');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await brandsAPI.list();
      setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las marcas');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
  };

  const handleContinue = () => {
    if (selectedBrand) {
      setCurrentSection('evaluate');
    }
  };

  const getPrimaryLogo = (brand: Brand) => {
    return brand.logos?.find(logo => logo.type === 'primary')?.url;
  };

  const getPrimaryColor = (brand: Brand) => {
    const primaryColor = brand.colors?.find(color => color.role === 'primary');
    return primaryColor?.hex || '#8B5CF6';
  };

  const handleCreateBrand = () => {
    setModalMode('create');
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEditBrand = (brand: Brand, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    setModalMode('edit');
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (formData: FormData) => {
    try {
      if (modalMode === 'create') {
        await brandsAPI.create(formData);
      } else {
        if (!editingBrand?.id) {
          throw new Error('No se encontró el ID de la marca a editar');
        }
        await brandsAPI.update(editingBrand.id, formData);
      }

      // Refresh brands list
      await fetchBrands();
      setIsModalOpen(false);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al guardar la marca');
    }
  };

  const handleDeleteBrand = async (brandId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
      return;
    }

    try {
      await brandsAPI.delete(brandId);

      // Refresh brands list
      await fetchBrands();
      
      // Deselect if was selected
      if (selectedBrand?.id === brandId) {
        setSelectedBrand(null);
      }
    } catch (err) {
      console.error('Error deleting brand:', err);
      alert('Error al eliminar la marca');
    }
  };

  if (currentSection === 'evaluate') {
    return (
      <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentSection('select-brand')}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a selección de marca
            </button>
          </div>

          <div className="text-center mb-12">
            <Badge variant="success">Marca Seleccionada</Badge>
            <h1 className="mt-4 text-4xl font-bold text-white">{selectedBrand?.name}</h1>
            {selectedBrand?.description && (
              <p className="mt-2 text-neutral-400">{selectedBrand.description}</p>
            )}
          </div>

          <div className="text-center text-neutral-400">
            <p className="text-xl">Próximamente: Sección de evaluación de ads</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal animation="fade">
            <div className="text-center mb-8">
              <Badge variant="primary">Demo Interactivo</Badge>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-white">
                Selecciona una Marca
              </h1>
              <p className="mt-4 text-xl text-neutral-400 max-w-2xl mx-auto">
                Elige una marca para comenzar a evaluar tus ads generados por IA
              </p>
            </div>
          </ScrollReveal>

          {/* Create Brand Button */}
          <ScrollReveal animation="fade" delay={100}>
            <div className="flex justify-center mb-8">
              <button
                onClick={handleCreateBrand}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/50"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Nueva Marca
              </button>
            </div>
          </ScrollReveal>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-neutral-400 text-lg">Cargando marcas...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <ScrollReveal animation="fade">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-red-950/50 border-red-800/50">
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-red-400 mb-2">Error al cargar marcas</h3>
                    <p className="text-neutral-400 mb-4">{error}</p>
                    <button
                      onClick={fetchBrands}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                </Card>
              </div>
            </ScrollReveal>
          )}

          {/* Brands Grid */}
          {!loading && !error && brands.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {brands.map((brand, index) => {
                  const isSelected = selectedBrand?.id === brand.id;
                  const primaryColor = getPrimaryColor(brand);
                  const logo = getPrimaryLogo(brand);

                  return (
                    <ScrollReveal key={brand.id} animation="slide-up" delay={index * 100}>
                      <BackgroundGradient
                        className={`transition-all duration-300 ${
                          isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black' : ''
                        }`}
                      >
                        <Card
                          hover
                          className={`cursor-pointer h-full relative overflow-hidden ${
                            isSelected ? 'bg-neutral-800' : 'bg-neutral-900'
                          }`}
                          onClick={() => handleBrandSelect(brand)}
                        >
                          {/* Action Buttons */}
                          <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <button
                              onClick={(e) => handleEditBrand(brand, e)}
                              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors shadow-lg"
                              title="Editar marca"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>

                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute top-4 left-4 z-10">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Brand Content */}
                          <div className="space-y-4">
                            {/* Logo Area */}
                            <div 
                              className="h-32 rounded-lg flex items-center justify-center relative"
                              style={{
                                backgroundColor: `${primaryColor}20`,
                                border: `1px solid ${primaryColor}40`
                              }}
                            >
                              {logo ? (
                                <img 
                                  src={logo} 
                                  alt={`${brand.name} logo`}
                                  className="max-h-20 max-w-[80%] object-contain"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div 
                                  className="text-4xl font-bold"
                                  style={{ color: primaryColor }}
                                >
                                  {brand.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            {/* Brand Info */}
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">{brand.name}</h3>
                              {brand.description && (
                                <p className="text-sm text-neutral-400 line-clamp-2">
                                  {brand.description}
                                </p>
                              )}
                            </div>

                            {/* Brand Details */}
                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                              {brand.colors && brand.colors.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="flex -space-x-1">
                                    {brand.colors.slice(0, 3).map((color, i) => (
                                      <div
                                        key={i}
                                        className="w-5 h-5 rounded-full border-2 border-neutral-800"
                                        style={{ backgroundColor: color.hex }}
                                        title={color.hex}
                                      />
                                    ))}
                                  </div>
                                  <span>{brand.colors.length} colores</span>
                                </div>
                              )}
                              {brand.logos && brand.logos.length > 0 && (
                                <div>
                                  <span>{brand.logos.length} logos</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </BackgroundGradient>
                    </ScrollReveal>
                  );
                })}
              </div>

              {/* Continue Button */}
              <ScrollReveal animation="slide-up" delay={brands.length * 100}>
                <div className="text-center">
                  <button
                    onClick={handleContinue}
                    disabled={!selectedBrand}
                    className={`group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                      selectedBrand
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-purple-500/50'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Continuar con {selectedBrand?.name || 'marca seleccionada'}</span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${selectedBrand ? 'group-hover:translate-x-1' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  
                  {!selectedBrand && (
                    <p className="mt-4 text-sm text-neutral-500">
                      Selecciona una marca para continuar
                    </p>
                  )}
                </div>
              </ScrollReveal>
            </>
          )}

          {/* Empty State */}
          {!loading && !error && brands.length === 0 && (
            <ScrollReveal animation="fade">
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto mb-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-xl font-semibold text-neutral-400 mb-2">No hay marcas disponibles</h3>
                <p className="text-neutral-500">Agrega marcas para comenzar a evaluar ads</p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>

      {/* Brand Modal */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBrand}
        brand={editingBrand}
        mode={modalMode}
      />
    </div>
  );
}
