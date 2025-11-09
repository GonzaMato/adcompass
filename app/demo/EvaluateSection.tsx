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
    voice: {
      traits: {
        formality: number | [number, number];
        warmth: number | [number, number];
        energy: number | [number, number];
        humor: number | [number, number];
        confidence: number | [number, number];
      };
      lexicon: {
        allowedWords: string[];
        bannedWords: string[];
        bannedPhrases?: string[];
        bannedPatterns?: string[];
        ctaWhitelist: string[];
        readability: {
          targetGrade: number;
          maxExclamations: number;
          allowEmojis: boolean;
        };
      };
    };
    logoUsage: {
      minSizePx: {
        width: number;
        height: number;
      };
      minClearSpaceX: number;
      aspectRatioLock: boolean;
      placementGrid: string[];
      background: {
        minContrastRatio: number;
        invertThresholdLuminance: number;
        maxBackgroundComplexity: number;
        blurOverlayRequiredAboveComplexity: boolean;
      };
    };
    claims: {
      bannedPhrases?: string[];
      bannedPatterns?: string[];
      requiredSubstantiation: any[];
      disclaimers: any[];
    };
    sensitive: {
      policies: Record<string, any>;
    };
    accessibility: {
      wcag: {
        minContrastRatio: number;
        minFontSizePx: number;
        captionsRequired: boolean;
        altTextRequired: boolean;
      };
    };
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

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error al obtener reglas' }));
        throw new Error(error.message || 'Error ' + response.status);
      }

      const data = await response.json();
      // La API siempre devuelve un array
      setAllRules(data);
      
      // Seleccionar automáticamente la primera regla si existe y no hay ninguna seleccionada
      if (data.length > 0 && !selectedRuleId) {
        setSelectedRuleId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las reglas');
      setAllRules([]);
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

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta regla?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/brands/' + selectedBrand.id + '/rules/' + ruleId, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error al eliminar regla' }));
        throw new Error(error.message || 'Error ' + response.status);
      }

      // Si la regla eliminada era la seleccionada, limpiar la selección
      if (selectedRuleId === ruleId) {
        setSelectedRuleId(null);
      }

      await fetchRules();
    } catch (err) {
      console.error('Error deleting rule:', err);
      alert(err instanceof Error ? err.message : 'Error al eliminar la regla');
    } finally {
      setLoading(false);
    }
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
                        {(rule.rules.claims.bannedPhrases?.length ?? rule.rules.claims.bannedPatterns?.length ?? 0) > 0 && (
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
                            {(rule.rules.claims.bannedPhrases ?? rule.rules.claims.bannedPatterns ?? []).length} claims prohibidos
                          </span>
                        )}
                        {rule.rules.voice.lexicon.bannedWords.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                            {rule.rules.voice.lexicon.bannedWords.length} palabras prohibidas
                          </span>
                        )}
                        {rule.rules.logoUsage.placementGrid.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                            {rule.rules.logoUsage.placementGrid.length} posiciones logo
                          </span>
                        )}
                        {Object.keys(rule.rules.sensitive.policies).length > 0 && (
                          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                            {Object.keys(rule.rules.sensitive.policies).length} políticas sensibles
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRule(rule.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                      title="Eliminar regla"
                    >
                      <svg 
                        className="w-5 h-5"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
                </div>

                {expandedRuleId === rule.id && (
                  <div className="mt-6 pt-6 border-t border-neutral-700/50">
                    <div className="grid gap-6">
                      {/* Voice Traits */}
                      <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/50">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <h4 className="text-sm font-semibold text-white">Voz de Marca</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[
                            { label: 'Formalidad', value: rule.rules.voice.traits.formality, icon: '📐' },
                            { label: 'Calidez', value: rule.rules.voice.traits.warmth, icon: '🔥' },
                            { label: 'Energía', value: rule.rules.voice.traits.energy, icon: '⚡' },
                            { label: 'Humor', value: rule.rules.voice.traits.humor, icon: '😄' },
                            { label: 'Confianza', value: rule.rules.voice.traits.confidence, icon: '💪' },
                          ].map((trait, idx) => (
                            <div key={idx} className="bg-neutral-900/50 rounded-lg p-3 text-center">
                              <div className="text-lg mb-1">{trait.icon}</div>
                              <div className="text-xs text-neutral-400 mb-1">{trait.label}</div>
                              <div className="text-lg font-bold text-white">
                                {(() => {
                                  const v = trait.value as number | [number, number];
                                  const normalized = typeof v === 'number' ? v : Math.round(((v[0] + v[1]) / 2) * 2);
                                  return normalized;
                                })()}
                              </div>
                              <div className="text-xs text-neutral-500 mt-1">de 10</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Readability */}
                        <div className="mt-4 pt-4 border-t border-neutral-700/50">
                          <h5 className="text-xs font-semibold text-neutral-400 mb-3">Legibilidad</h5>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="bg-neutral-900/50 rounded p-2">
                              <div className="text-neutral-500 mb-1">Nivel de lectura</div>
                              <div className="text-white font-medium">{rule.rules.voice.lexicon.readability.targetGrade}</div>
                            </div>
                            <div className="bg-neutral-900/50 rounded p-2">
                              <div className="text-neutral-500 mb-1">Máx. exclamaciones</div>
                              <div className="text-white font-medium">{rule.rules.voice.lexicon.readability.maxExclamations}</div>
                            </div>
                            <div className="bg-neutral-900/50 rounded p-2">
                              <div className="text-neutral-500 mb-1">Emojis</div>
                              <div className="text-white font-medium">{rule.rules.voice.lexicon.readability.allowEmojis ? '✅ Sí' : '❌ No'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Voice Lexicon */}
                      {(rule.rules.voice.lexicon.bannedWords.length > 0 || (rule.rules.voice.lexicon.bannedPhrases?.length ?? rule.rules.voice.lexicon.bannedPatterns?.length ?? 0) > 0) && (
                        <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
                          <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <h4 className="text-sm font-semibold text-white">Restricciones de Lenguaje</h4>
                          </div>
                          <div className="space-y-3">
                            {rule.rules.voice.lexicon.bannedWords.length > 0 && (
                              <div>
                                <p className="text-xs text-neutral-400 mb-2 font-medium">🚫 Palabras Prohibidas ({rule.rules.voice.lexicon.bannedWords.length})</p>
                                <div className="flex flex-wrap gap-2">
                                  {rule.rules.voice.lexicon.bannedWords.slice(0, 10).map((word, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-red-500/20 text-red-300 rounded-md text-xs font-medium border border-red-500/30">
                                      {word}
                                    </span>
                                  ))}
                                  {rule.rules.voice.lexicon.bannedWords.length > 10 && (
                                    <span className="px-2.5 py-1 bg-neutral-700 text-neutral-400 rounded-md text-xs">
                                      +{rule.rules.voice.lexicon.bannedWords.length - 10} más
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            {(rule.rules.voice.lexicon.bannedPhrases?.length ?? rule.rules.voice.lexicon.bannedPatterns?.length ?? 0) > 0 && (
                              <div>
                                <p className="text-xs text-neutral-400 mb-2 font-medium">🔍 Frases Prohibidas ({(rule.rules.voice.lexicon.bannedPhrases ?? rule.rules.voice.lexicon.bannedPatterns ?? []).length})</p>
                                <div className="flex flex-wrap gap-2">
                                  {(rule.rules.voice.lexicon.bannedPhrases ?? rule.rules.voice.lexicon.bannedPatterns ?? []).slice(0, 8).map((phrase, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-orange-500/20 text-orange-300 rounded-md text-xs font-medium border border-orange-500/30">
                                      {phrase}
                                    </span>
                                  ))}
                                  {(rule.rules.voice.lexicon.bannedPhrases ?? rule.rules.voice.lexicon.bannedPatterns ?? []).length > 8 && (
                                    <span className="px-2.5 py-1 bg-neutral-700 text-neutral-400 rounded-md text-xs">
                                      +{(rule.rules.voice.lexicon.bannedPhrases ?? rule.rules.voice.lexicon.bannedPatterns ?? []).length - 8} más
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Logo Usage */}
                      <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h4 className="text-sm font-semibold text-white">Uso del Logo</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                                📏
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Tamaño Mínimo</div>
                                <div className="text-sm text-white font-medium">
                                  {rule.rules.logoUsage.minSizePx.width} × {rule.rules.logoUsage.minSizePx.height} px
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                                ↔️
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Espacio Libre</div>
                                <div className="text-sm text-white font-medium">
                                  {rule.rules.logoUsage.minClearSpaceX}× del logo
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                                {rule.rules.logoUsage.aspectRatioLock ? '🔒' : '🔓'}
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Aspecto</div>
                                <div className="text-sm text-white font-medium">
                                  {rule.rules.logoUsage.aspectRatioLock ? 'Bloqueado' : 'Libre'}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                                🎨
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Contraste Mínimo</div>
                                <div className="text-sm text-white font-medium">
                                  {rule.rules.logoUsage.background.minContrastRatio}:1
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                                💫
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Complejidad Máx.</div>
                                <div className="text-sm text-white font-medium">
                                  {(rule.rules.logoUsage.background.maxBackgroundComplexity * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                                🌫️
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Blur Overlay</div>
                                <div className="text-sm text-white font-medium">
                                  {rule.rules.logoUsage.background.blurOverlayRequiredAboveComplexity ? '✅ Requerido' : '❌ No'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {rule.rules.logoUsage.placementGrid.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-purple-500/20">
                            <p className="text-xs text-neutral-400 mb-2 font-medium">📍 Posiciones Permitidas</p>
                            <div className="flex flex-wrap gap-2">
                              {rule.rules.logoUsage.placementGrid.map((pos, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-md text-xs font-medium border border-purple-500/30">
                                  {pos}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Claims */}
                      {(rule.rules.claims.bannedPhrases?.length ?? rule.rules.claims.bannedPatterns?.length ?? 0) > 0 && (
                        <div className="bg-yellow-500/5 rounded-lg p-4 border border-yellow-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h4 className="text-sm font-semibold text-white">Claims Prohibidos</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(rule.rules.claims.bannedPhrases ?? rule.rules.claims.bannedPatterns ?? []).slice(0, 12).map((phrase, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-yellow-500/20 text-yellow-300 rounded-md text-xs font-medium border border-yellow-500/30">
                                {phrase}
                              </span>
                            ))}
                            {(rule.rules.claims.bannedPhrases ?? rule.rules.claims.bannedPatterns ?? []).length > 12 && (
                              <span className="px-2.5 py-1 bg-neutral-700 text-neutral-400 rounded-md text-xs">
                                +{(rule.rules.claims.bannedPhrases ?? rule.rules.claims.bannedPatterns ?? []).length - 12} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Accessibility */}
                      <div className="bg-green-500/5 rounded-lg p-4 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <h4 className="text-sm font-semibold text-white">Accesibilidad (WCAG)</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-green-500/10 rounded-lg p-3">
                            <div className="text-xs text-green-400 mb-1">Contraste</div>
                            <div className="text-lg font-bold text-white">{rule.rules.accessibility.wcag.minContrastRatio}:1</div>
                          </div>
                          <div className="bg-green-500/10 rounded-lg p-3">
                            <div className="text-xs text-green-400 mb-1">Fuente Mín.</div>
                            <div className="text-lg font-bold text-white">{rule.rules.accessibility.wcag.minFontSizePx}px</div>
                          </div>
                          <div className="bg-green-500/10 rounded-lg p-3">
                            <div className="text-xs text-green-400 mb-1">Subtítulos</div>
                            <div className="text-lg font-bold text-white">{rule.rules.accessibility.wcag.captionsRequired ? '✓' : '✗'}</div>
                          </div>
                          <div className="bg-green-500/10 rounded-lg p-3">
                            <div className="text-xs text-green-400 mb-1">Alt Text</div>
                            <div className="text-lg font-bold text-white">{rule.rules.accessibility.wcag.altTextRequired ? '✓' : '✗'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Sensitive Policies */}
                      {Object.keys(rule.rules.sensitive.policies).length > 0 && (
                        <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <h4 className="text-sm font-semibold text-white">Políticas Sensibles</h4>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(rule.rules.sensitive.policies).map(([key, policy]: [string, any]) => (
                              <div key={key} className="flex items-center justify-between bg-neutral-900/50 rounded-lg p-3">
                                <span className="text-sm text-neutral-300 font-medium">{key}</span>
                                <span className={'px-3 py-1 rounded-md text-xs font-medium ' + (
                                  policy.allowed === 'allowed' 
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                    : policy.allowed === 'disallowed' 
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                )}>
                                  {policy.allowed === 'allowed' ? '✓ Permitido' : policy.allowed === 'disallowed' ? '✗ No Permitido' : '⚠ Condicional'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
