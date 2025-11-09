"use client";

import { Brand } from "../types/brand";
import { Badge } from "../components/Badge";
import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { BrandRulesModal } from "../components/BrandRulesModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { brandRulesAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [allRules, setAllRules] = useState<BrandRulesResponse[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal (create/edit)
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRule, setEditingRule] = useState<BrandRulesResponse | null>(null);

  // Delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, [selectedBrand.id]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandRulesAPI.list(selectedBrand.id);
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
      await brandRulesAPI.create(selectedBrand.id, rulesData);
      await fetchRules();
      setIsRulesModalOpen(false);
    } catch (err) {
      console.error('Error creating rules:', err);
      alert(err instanceof Error ? err.message : 'Error al crear las reglas');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRules = async (rulesData: any) => {
    if (!editingRule) return;
    try {
      setLoading(true);
      await brandRulesAPI.update(selectedBrand.id, editingRule.id, rulesData);
      await fetchRules();
      setIsRulesModalOpen(false);
      setEditingRule(null);
    } catch (err) {
      console.error('Error updating rules:', err);
      alert(err instanceof Error ? err.message : 'Error al actualizar las reglas');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (ruleId: string) => {
    setExpandedRuleId(expandedRuleId === ruleId ? null : ruleId);
  };

  const handleAskDeleteRule = (ruleId: string) => {
    setDeletingRuleId(ruleId);
    setConfirmOpen(true);
  };

  const handleContinue = () => {
    if (selectedRuleId) {
      router.push(`/brands/${selectedBrand.id}/rules/${selectedRuleId}/evaluate`);
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
          Back to Brand Selection
        </button>
      </div>

      <div className="text-center mb-12">
        <Badge variant="success">Selected Brand</Badge>
        <h1 className="mt-4 text-4xl font-bold text-white">{selectedBrand.name}</h1>
        {selectedBrand.description && (
          <p className="mt-2 text-neutral-400">{selectedBrand.description}</p>
        )}
      </div>

      {loading ? (
        <div className="text-center text-neutral-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4">Loading rules...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchRules}>Retry</Button>
        </div>
      ) : allRules.length > 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Brand Rules ({allRules.length})</h2>
            <Button onClick={() => { setModalMode('create'); setEditingRule(null); setIsRulesModalOpen(true); }}>
              Create New Rule
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
                          Rule #{rule.id.slice(0, 8)}
                        </h3>
                        <span className="text-xs text-neutral-500">
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(rule.rules.claims.bannedPhrases?.length ?? rule.rules.claims.bannedPatterns?.length ?? 0) > 0 && (
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
                            {(rule.rules.claims.bannedPhrases ?? rule.rules.claims.bannedPatterns ?? []).length} banned claims
                          </span>
                        )}
                        {rule.rules.voice.lexicon.bannedWords.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                            {rule.rules.voice.lexicon.bannedWords.length} banned words
                          </span>
                        )}
                        {rule.rules.logoUsage.placementGrid.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                            {rule.rules.logoUsage.placementGrid.length} logo positions
                          </span>
                        )}
                        {Object.keys(rule.rules.sensitive.policies).length > 0 && (
                          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                            {Object.keys(rule.rules.sensitive.policies).length} sensitive policies
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalMode('edit');
                        setEditingRule(rule);
                        setIsRulesModalOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                      title="Edit rule"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m2 0h.01M4 13V7a2 2 0 012-2h4m10 6v6a2 2 0 01-2 2h-6M7 21h.01M16.5 3.5a2.121 2.121 0 013 3L9 17l-4 1 1-4 10.5-10.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAskDeleteRule(rule.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                      title="Delete rule"
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
                          <h4 className="text-sm font-semibold text-white">Brand Voice</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[
                            { label: 'Formality', value: rule.rules.voice.traits.formality, icon: '📐' },
                            { label: 'Warmth', value: rule.rules.voice.traits.warmth, icon: '🔥' },
                            { label: 'Energy', value: rule.rules.voice.traits.energy, icon: '⚡' },
                            { label: 'Humor', value: rule.rules.voice.traits.humor, icon: '😄' },
                            { label: 'Confidence', value: rule.rules.voice.traits.confidence, icon: '💪' },
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
                              <div className="text-xs text-neutral-500 mt-1">of 10</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Readability */}
                        <div className="mt-4 pt-4 border-t border-neutral-700/50">
                          <h5 className="text-xs font-semibold text-neutral-400 mb-3">Readability</h5>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="bg-neutral-900/50 rounded p-2">
                              <div className="text-neutral-500 mb-1">Reading Level</div>
                              <div className="text-white font-medium">{rule.rules.voice.lexicon.readability.targetGrade}</div>
                            </div>
                            <div className="bg-neutral-900/50 rounded p-2">
                              <div className="text-neutral-500 mb-1">Max. Exclamations</div>
                              <div className="text-white font-medium">{rule.rules.voice.lexicon.readability.maxExclamations}</div>
                            </div>
                            <div className="bg-neutral-900/50 rounded p-2">
                              <div className="text-neutral-500 mb-1">Emojis</div>
                              <div className="text-white font-medium">{rule.rules.voice.lexicon.readability.allowEmojis ? '✅ Yes' : '❌ No'}</div>
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
                            <h4 className="text-sm font-semibold text-white">Language Restrictions</h4>
                          </div>
                          <div className="space-y-3">
                            {rule.rules.voice.lexicon.bannedWords.length > 0 && (
                              <div>
                                <p className="text-xs text-neutral-400 mb-2 font-medium">🚫 Banned Words ({rule.rules.voice.lexicon.bannedWords.length})</p>
                                <div className="flex flex-wrap gap-2">
                                  {rule.rules.voice.lexicon.bannedWords.slice(0, 10).map((word, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-red-500/20 text-red-300 rounded-md text-xs font-medium border border-red-500/30">
                                      {word}
                                    </span>
                                  ))}
                                  {rule.rules.voice.lexicon.bannedWords.length > 10 && (
                                    <span className="px-2.5 py-1 bg-neutral-700 text-neutral-400 rounded-md text-xs">
                                      +{rule.rules.voice.lexicon.bannedWords.length - 10} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            {(rule.rules.voice.lexicon.bannedPhrases?.length ?? rule.rules.voice.lexicon.bannedPatterns?.length ?? 0) > 0 && (
                              <div>
                                <p className="text-xs text-neutral-400 mb-2 font-medium">🔍 Banned Phrases ({(rule.rules.voice.lexicon.bannedPhrases ?? rule.rules.voice.lexicon.bannedPatterns ?? []).length})</p>
                                <div className="flex flex-wrap gap-2">
                                  {(rule.rules.voice.lexicon.bannedPhrases ?? rule.rules.voice.lexicon.bannedPatterns ?? []).slice(0, 8).map((phrase, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-orange-500/20 text-orange-300 rounded-md text-xs font-medium border border-orange-500/30">
                                      {phrase}
                                    </span>
                                  ))}
                                  {(rule.rules.voice.lexicon.bannedPhrases ?? rule.rules.voice.lexicon.bannedPatterns ?? []).length > 8 && (
                                    <span className="px-2.5 py-1 bg-neutral-700 text-neutral-400 rounded-md text-xs">
                                      +{(rule.rules.voice.lexicon.bannedPhrases ?? rule.rules.voice.lexicon.bannedPatterns ?? []).length - 8} more
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
                          <h4 className="text-sm font-semibold text-white">Logo Usage</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                                📏
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Minimum Size</div>
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
                                <div className="text-xs text-neutral-400">Clear Space</div>
                                <div className="text-sm text-white font-medium">
                                  {rule.rules.logoUsage.minClearSpaceX}× of logo
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                                {rule.rules.logoUsage.aspectRatioLock ? '🔒' : '🔓'}
                              </div>
                              <div>
                                <div className="text-xs text-neutral-400">Aspect Ratio</div>
                                <div className="text-sm text-white font-medium">
                                  {rule.rules.logoUsage.aspectRatioLock ? 'Locked' : 'Free'}
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
                                <div className="text-xs text-neutral-400">Min. Contrast</div>
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
                                <div className="text-xs text-neutral-400">Max. Complexity</div>
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
                                  {rule.rules.logoUsage.background.blurOverlayRequiredAboveComplexity ? '✅ Required' : '❌ No'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {rule.rules.logoUsage.placementGrid.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-purple-500/20">
                            <p className="text-xs text-neutral-400 mb-2 font-medium">📍 Allowed Positions</p>
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
                            <h4 className="text-sm font-semibold text-white">Banned Claims</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(rule.rules.claims.bannedPhrases ?? rule.rules.claims.bannedPatterns ?? []).slice(0, 12).map((phrase, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-yellow-500/20 text-yellow-300 rounded-md text-xs font-medium border border-yellow-500/30">
                                {phrase}
                              </span>
                            ))}
                            {(rule.rules.claims.bannedPhrases ?? rule.rules.claims.bannedPatterns ?? []).length > 12 && (
                              <span className="px-2.5 py-1 bg-neutral-700 text-neutral-400 rounded-md text-xs">
                                +{(rule.rules.claims.bannedPhrases ?? rule.rules.claims.bannedPatterns ?? []).length - 12} more
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
                          <h4 className="text-sm font-semibold text-white">Accessibility (WCAG)</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-green-500/10 rounded-lg p-3">
                            <div className="text-xs text-green-400 mb-1">Contrast</div>
                            <div className="text-lg font-bold text-white">{rule.rules.accessibility.wcag.minContrastRatio}:1</div>
                          </div>
                          <div className="bg-green-500/10 rounded-lg p-3">
                            <div className="text-xs text-green-400 mb-1">Min. Font</div>
                            <div className="text-lg font-bold text-white">{rule.rules.accessibility.wcag.minFontSizePx}px</div>
                          </div>
                          <div className="bg-green-500/10 rounded-lg p-3">
                            <div className="text-xs text-green-400 mb-1">Captions</div>
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
                            <h4 className="text-sm font-semibold text-white">Sensitive Policies</h4>
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
                                  {policy.allowed === 'allowed' ? '✓ Allowed' : policy.allowed === 'disallowed' ? '✗ Not Allowed' : '⚠ Conditional'}
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
                Continue with Selected Rule
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
                No rules defined for this brand
              </h3>
              <p className="text-neutral-400">
                Create rules to define how this brand should be used in ads
              </p>
              <Button onClick={() => { setModalMode('create'); setEditingRule(null); setIsRulesModalOpen(true); }}>
                Create Rules
              </Button>
            </div>
          </Card>
        </div>
      )}

      <BrandRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => { setIsRulesModalOpen(false); setEditingRule(null); }}
        onSave={modalMode === 'edit' ? handleUpdateRules : handleCreateRules}
        brandName={selectedBrand.name}
        initialRules={editingRule?.rules}
        mode={modalMode}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete rule"
        message={`Delete rule ${deletingRuleId ? '#' + deletingRuleId.slice(0, 8) : ''}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={loading && !!deletingRuleId}
        onCancel={() => {
          if (loading && deletingRuleId) return;
          setConfirmOpen(false);
          setDeletingRuleId(null);
        }}
        onConfirm={async () => {
          const ruleId = deletingRuleId;
          if (!ruleId) return;
          try {
            setLoading(true);
            await brandRulesAPI.delete(selectedBrand.id, ruleId);
            if (selectedRuleId === ruleId) {
              setSelectedRuleId(null);
            }
            await fetchRules();
            setConfirmOpen(false);
            setDeletingRuleId(null);
          } catch (err) {
            console.error('Error deleting rule:', err);
            alert(err instanceof Error ? err.message : 'Error deleting the rule');
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
};
