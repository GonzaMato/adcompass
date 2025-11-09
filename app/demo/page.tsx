"use client";

import { useEffect, useState } from "react";
import { Brand } from "../types/brand";
import { BrandModal } from "../components/BrandModal";
import { brandsAPI } from "@/lib/api";
import { SelectBrandSection } from "./SelectBrandSection";
import { SelectBrandRulesSection } from "./EvaluateSection";
import { ConfirmDialog } from "../components/ConfirmDialog";

export default function DemoPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<'select-brand' | 'select-rules'>('select-brand');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

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
      setCurrentSection('select-rules');
    }
  };

  const handleCreateBrand = () => {
    setModalMode('create');
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEditBrand = (brand: Brand, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDeleteBrand = (brand: Brand, e: React.MouseEvent) => {
    e.stopPropagation();
    setBrandToDelete(brand);
    setConfirmOpen(true);
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
      await fetchBrands();
      setIsModalOpen(false);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al guardar la marca');
    }
  };

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <div className="relative z-10 p-8">
        {currentSection === 'select-rules' && selectedBrand ? (
          <SelectBrandRulesSection
            selectedBrand={selectedBrand}
            onBack={() => setCurrentSection('select-brand')}
          />
        ) : (
          <SelectBrandSection
            brands={brands}
            selectedBrand={selectedBrand}
            loading={loading}
            error={error}
            onBrandSelect={handleBrandSelect}
            onContinue={handleContinue}
            onCreateBrand={handleCreateBrand}
            onEditBrand={handleEditBrand}
            onDeleteBrand={handleDeleteBrand}
            onRetry={fetchBrands}
            deletingId={deletingId}
          />
        )}
      </div>

      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBrand}
        brand={editingBrand}
        mode={modalMode}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Eliminar marca"
        message={`¿Eliminar la marca "${brandToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={!!deletingId}
        onCancel={() => {
          if (deletingId) return;
          setConfirmOpen(false);
          setBrandToDelete(null);
        }}
        onConfirm={async () => {
          if (!brandToDelete) return;
          try {
            setDeletingId(brandToDelete.id);
            setError(null);
            await brandsAPI.delete(brandToDelete.id);
            await fetchBrands();
            if (selectedBrand?.id === brandToDelete.id) {
              setSelectedBrand(null);
            }
            setConfirmOpen(false);
            setBrandToDelete(null);
          } catch (err) {
            console.error('Error deleting brands:', err);
            setError(err instanceof Error ? err.message : 'Error al eliminar la marca');
          } finally {
            setDeletingId(null);
          }
        }}
      />
    </div>
  );
}
