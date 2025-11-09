"use client";

import { Brand } from "../types/brand";
import { Badge } from "../components/Badge";
import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { BrandRulesModal } from "../components/BrandRulesModal";

interface BrandRulesResponse {
  id: string;
  brandId: string;
  rules: {
    prohibitedClaims: string[];
    tone: {
      allowed: string[];
      bannedWords: string[];
    };
    logoUsage: {
      allowedPositions: string[];
      bannedBackgrounds: string[];
      invertOnDark: boolean;
      minClearSpaceRatio: number;
    };
    sensitive: {
      disallowCategories: string[];
      minAudienceAge?: number;
    };
    requiredDisclaimers: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface SelectBrandRulesSectionProps {
  selectedBrand: Brand;
  onBack: () => void;
}

export const SelectBrandRulesSection: React.FC<SelectBrandRulesSectionProps> = ({
  selectedBrand,
  onBack,
}) => {
  const [allRules, setAllRules] = useState<BrandRulesResponse[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchRules();
  }, [selectedBrand.id]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/brands/' + selectedBrand.id + '/rules');
      
      if (response.status === 404) {
        setAllRules([]);
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error al obtener reglas' }));
        throw new Error(error.message || 'Error ' + response.status);
      }

      const data = await response.json();
      const rulesArray = Array.isArray(data) ? data : [data];
      setAllRules(rulesArray);
      
      if (rulesArray.length > 0 && !selectedRuleId) {
        setSelectedRuleId(rulesArray[0].id);
      }
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las reglas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRules = async (rulesData: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/brands/' + selectedBrand.id + '/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rulesData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error al crear reglas' }));
        throw new Error(error.message || 'Error ' + response.status);
      }

      await fetchRules();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating rules:', err);
      alert(err instanceof Error ? err.message : 'Error al crear las reglas');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (ruleId: string) => {
    setExpandedRuleId(expandedRuleId === ruleId ? null : ruleId);
  };

  const handleContinue = () => {
    if (selectedRuleId) {
      alert('Continuar con regla: ' + selectedRuleId);
    }
  };

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

      {loading ? (
        <div className="text-center text-neutral-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4">Cargando reglas...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchRules}>Reintentar</Button>
        </div>
      ) : allRules.length > 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Reglas de la Marca ({allRules.length})</h2>
            <Button onClick={() => setShowCreateModal(true)}>
              Crear Nueva Regla
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            {allRules.map((rule) => (
              <Card 
                key={rule.id}
                className={'p-4 cursor-pointer transition-all ' + (selectedRuleId === rule.id ? 'ring-2 ring-blue-500 bg-neutral-800/50' : 'hover:bg-neutral-800/30')}
                onClick={() => setSelectedRuleId(rule.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="radio"
                      checked={selectedRuleId === rule.id}
                      onChange={() => setSelectedRuleId(rule.id)}
                      className="w-4 h-4 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">
                          Regla #{rule.id.slice(0, 8)}
                        </h3>
                        <span className="text-xs text-neutral-500">
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {rule.rules.prohibitedClaims.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
                            {rule.rules.prohibitedClaims.length} prohibiciones
                          </span>
                        )}
                        {rule.rules.tone.allowed.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                            {rule.rules.tone.allowed.length} tonos
                          </span>
                        )}
                        {rule.rules.sensitive.disallowCategories.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                            {rule.rules.sensitive.disallowCategories.length} categorías sensibles
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(rule.id);
                    }}
                    className="text-neutral-400 hover:text-white transition-colors p-2"
                  >
                    <svg 
                      className={'w-5 h-5 transition-transform ' + (expandedRuleId === rule.id ? 'rotate-180' : '')}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {expandedRuleId === rule.id && (
                  <div className="mt-4 pt-4 border-t border-neutral-700 space-y-4">
                    {rule.rules.prohibitedClaims && rule.rules.prohibitedClaims.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Afirmaciones Prohibidas</h4>
                        <div className="flex flex-wrap gap-2">
                          {rule.rules.prohibitedClaims.map((claim, idx) => (
                            <Badge key={idx} variant="danger">{claim}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.rules.tone && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Tono de Comunicación</h4>
                        <div className="space-y-2">
                          {rule.rules.tone.allowed && rule.rules.tone.allowed.length > 0 && (
                            <div>
                              <p className="text-xs text-neutral-400 mb-1">Tonos Permitidos:</p>
                              <div className="flex flex-wrap gap-2">
                                {rule.rules.tone.allowed.map((tone, idx) => (
                                  <Badge key={idx} variant="success">{tone}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {rule.rules.tone.bannedWords && rule.rules.tone.bannedWords.length > 0 && (
                            <div>
                              <p className="text-xs text-neutral-400 mb-1">Palabras Prohibidas:</p>
                              <div className="flex flex-wrap gap-2">
                                {rule.rules.tone.bannedWords.map((word, idx) => (
                                  <Badge key={idx} variant="danger">{word}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

{rule.rules.logoUsage && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Uso del Logo</h4>
                        <div className="space-y-2 text-sm text-neutral-300">
                          {rule.rules.logoUsage.allowedPositions && rule.rules.logoUsage.allowedPositions.length > 0 && (
                            <div>
                              <p className="text-xs text-neutral-400 mb-1">Posiciones Permitidas:</p>
                              <div className="flex flex-wrap gap-2">
                                {rule.rules.logoUsage.allowedPositions.map((pos, idx) => (
                                  <Badge key={idx}>{pos}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {rule.rules.logoUsage.bannedBackgrounds && rule.rules.logoUsage.bannedBackgrounds.length > 0 && (
                            <div>
                              <p className="text-xs text-neutral-400 mb-1">Fondos Prohibidos:</p>
                              <div className="flex flex-wrap gap-2">
                                {rule.rules.logoUsage.bannedBackgrounds.map((bg, idx) => (
                                  <Badge key={idx} variant="danger">{bg}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs">
                            Invertir en fondos oscuros: {rule.rules.logoUsage.invertOnDark ? 'Sí' : 'No'}
                          </p>
                          <p className="text-xs">
                            Espacio libre mínimo: {(rule.rules.logoUsage.minClearSpaceRatio * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    )}
                    
{rule.rules.sensitive && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Contenido Sensible</h4>
                        <div className="space-y-2">
                          {rule.rules.sensitive.disallowCategories && rule.rules.sensitive.disallowCategories.length > 0 && (
                            <div>
                              <p className="text-xs text-neutral-400 mb-1">Categorías No Permitidas:</p>
                              <div className="flex flex-wrap gap-2">
                                {rule.rules.sensitive.disallowCategories.map((cat, idx) => (
                                  <Badge key={idx} variant="danger">{cat}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {rule.rules.sensitive.minAudienceAge && (
                            <p className="text-xs text-neutral-300">
                              Edad mínima de audiencia: {rule.rules.sensitive.minAudienceAge} años
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
{rule.rules.requiredDisclaimers && rule.rules.requiredDisclaimers.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Descargos Requeridos</h4>
                        <ul className="list-disc list-inside space-y-1 text-neutral-300 text-xs">
                          {rule.rules.requiredDisclaimers.map((disclaimer, idx) => (
                            <li key={idx}>{disclaimer}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {selectedRuleId && (
            <div className="flex justify-center">
              <Button onClick={handleContinue} className="px-8">
                Continuar con Regla Seleccionada
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <Card className="p-12 max-w-2xl mx-auto">
            <div className="space-y-4">
              <svg 
                className="w-16 h-16 mx-auto text-neutral-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className="text-xl font-semibold text-white">
                No hay reglas definidas para esta marca
              </h3>
              <p className="text-neutral-400">
                Crea reglas para definir cómo debe usarse esta marca en anuncios
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Crear Reglas
              </Button>
            </div>
          </Card>
        </div>
      )}

      <BrandRulesModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateRules}
        brandName={selectedBrand.name}
      />
    </div>
  );
};
