"use client";

import { Brand } from "../types/brand";
import { Badge } from "../components/Badge";

interface EvaluateSectionProps {
  selectedBrand: Brand;
  onBack: () => void;
}

export const EvaluateSection: React.FC<EvaluateSectionProps> = ({
  selectedBrand,
  onBack,
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
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
        <h1 className="mt-4 text-4xl font-bold text-white">{selectedBrand.name}</h1>
        {selectedBrand.description && (
          <p className="mt-2 text-neutral-400">{selectedBrand.description}</p>
        )}
      </div>

      <div className="text-center text-neutral-400">
        <p className="text-xl">Próximamente: Sección de evaluación de ads</p>
      </div>
    </div>
  );
};
