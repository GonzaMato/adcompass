"use client";

import { useState } from "react";
import { Button } from "./Button";

interface BrandRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: any) => Promise<void>;
  brandName: string;
}

// Estilos para el slider con el punto más visible
const sliderStyles = `
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #60a5fa;
    cursor: pointer;
    border: 2px solid #3b82f6;
    box-shadow: 0 0 8px rgba(96, 165, 250, 0.5);
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #60a5fa;
    cursor: pointer;
    border: 2px solid #3b82f6;
    box-shadow: 0 0 8px rgba(96, 165, 250, 0.5);
  }
  
  input[type="range"]::-webkit-slider-thumb:hover {
    background: #93c5fd;
    box-shadow: 0 0 12px rgba(96, 165, 250, 0.8);
  }
  
  input[type="range"]::-moz-range-thumb:hover {
    background: #93c5fd;
    box-shadow: 0 0 12px rgba(96, 165, 250, 0.8);
  }
`;

const PLACEMENT_GRID_OPTIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const;

type RangeTuple = [number, number];

export const BrandRulesModal: React.FC<BrandRulesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  brandName,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice - Traits (1-5 según schema)
  const [formality, setFormality] = useState<number>(3);
  const [warmth, setWarmth] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [humor, setHumor] = useState<number>(3);
  const [confidence, setConfidence] = useState<number>(3);

  // Voice - Lexicon
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [bannedWordInput, setBannedWordInput] = useState("");
  const [bannedPatterns, setBannedPatterns] = useState<string[]>([]);
  const [bannedPatternInput, setBannedPatternInput] = useState("");
  
  // Voice - Readability
  const [targetGrade, setTargetGrade] = useState<number>(8);
  const [maxExclamations, setMaxExclamations] = useState<number>(1);
  const [allowEmojis, setAllowEmojis] = useState<boolean>(false);

  // Logo Usage
  const [minWidthPx, setMinWidthPx] = useState(100);
  const [minHeightPx, setMinHeightPx] = useState(100);
  const [minClearSpaceX, setMinClearSpaceX] = useState(0.1);
  const [aspectRatioLock, setAspectRatioLock] = useState(true);
  const [placementGrid, setPlacementGrid] = useState<string[]>(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']);
  
  // Logo - Background constraints
  const [minContrastRatio, setMinContrastRatio] = useState(4.5);
  const [invertThresholdLuminance, setInvertThresholdLuminance] = useState(0.35);
  const [maxBackgroundComplexity, setMaxBackgroundComplexity] = useState(0.25);
  const [blurOverlayRequired, setBlurOverlayRequired] = useState(true);

  // Claims
  const [claimBannedPatterns, setClaimBannedPatterns] = useState<string[]>([]);
  const [claimPatternInput, setClaimPatternInput] = useState("");

  if (!isOpen) return null;

  const handleAddBannedWord = () => {
    if (bannedWordInput.trim() && bannedWords.length < 5000) {
      setBannedWords([...bannedWords, bannedWordInput.trim()]);
      setBannedWordInput("");
    }
  };

  const handleRemoveBannedWord = (index: number) => {
    setBannedWords(bannedWords.filter((_, i) => i !== index));
  };

  const handleAddBannedPattern = () => {
    if (bannedPatternInput.trim() && bannedPatterns.length < 1000) {
      setBannedPatterns([...bannedPatterns, bannedPatternInput.trim()]);
      setBannedPatternInput("");
    }
  };

  const handleRemoveBannedPattern = (index: number) => {
    setBannedPatterns(bannedPatterns.filter((_, i) => i !== index));
  };

  const handleAddClaimPattern = () => {
    if (claimPatternInput.trim() && claimBannedPatterns.length < 5000) {
      setClaimBannedPatterns([...claimBannedPatterns, claimPatternInput.trim()]);
      setClaimPatternInput("");
    }
  };

  const handleRemoveClaimPattern = (index: number) => {
    setClaimBannedPatterns(claimBannedPatterns.filter((_, i) => i !== index));
  };

  const togglePlacement = (placement: string) => {
    setPlacementGrid(prev =>
      prev.includes(placement) ? prev.filter(p => p !== placement) : [...prev, placement]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const rulesData = {
        voice: {
          traits: {
            formality: [formality, formality] as RangeTuple,
            warmth: [warmth, warmth] as RangeTuple,
            energy: [energy, energy] as RangeTuple,
            humor: [humor, humor] as RangeTuple,
            confidence: [confidence, confidence] as RangeTuple,
          },
          lexicon: {
            allowedWords: [],
            bannedWords,
            bannedPatterns,
            ctaWhitelist: [],
            readability: {
              targetGrade,
              maxExclamations,
              allowEmojis,
            },
          },
          perChannelOverrides: {},
        },
        logoUsage: {
          minSizePx: {
            width: minWidthPx,
            height: minHeightPx,
          },
          minClearSpaceX,
          aspectRatioLock,
          placementGrid,
          background: {
            minContrastRatio,
            invertThresholdLuminance,
            maxBackgroundComplexity,
            blurOverlayRequiredAboveComplexity: blurOverlayRequired,
          },
        },
        claims: {
          bannedPatterns: claimBannedPatterns,
          requiredSubstantiation: [],
          disclaimers: [],
        },
        sensitive: {
          policies: {},
        },
        accessibility: {
          wcag: {
            minContrastRatio: 4.5,
            minFontSizePx: 14,
            captionsRequired: true,
            altTextRequired: true,
          },
        },
        platformRules: {},
        governance: {
          severityDefault: 'hard_fail' as const,
          checks: [],
        },
      };

      await onSave(rulesData);
      
      // Reset form
      setFormality(3);
      setWarmth(3);
      setEnergy(3);
      setHumor(3);
      setConfidence(3);
      setBannedWords([]);
      setBannedPatterns([]);
      setTargetGrade(8);
      setMaxExclamations(1);
      setAllowEmojis(false);
      setClaimBannedPatterns([]);
      setMinWidthPx(100);
      setMinHeightPx(100);
      setMinClearSpaceX(0.1);
      setAspectRatioLock(true);
      setPlacementGrid(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']);
      setMinContrastRatio(4.5);
      setInvertThresholdLuminance(0.35);
      setMaxBackgroundComplexity(0.25);
      setBlurOverlayRequired(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reglas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{sliderStyles}</style>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-neutral-900 rounded-lg p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Crear Reglas de Marca</h2>
        <p className="text-neutral-400 mb-6">
          Define las reglas de uso para: {brandName}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Voice Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Voz de Marca (Traits)</h3>
            
            <div className="space-y-5 mb-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-white">
                    Formalidad
                  </label>
                  <span className="text-sm font-semibold text-blue-400">
                    {formality}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formality}
                  onChange={(e) => setFormality(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                  <span>1 (Informal)</span>
                  <span>5 (Formal)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-white">
                    Calidez
                  </label>
                  <span className="text-sm font-semibold text-blue-400">
                    {warmth}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={warmth}
                  onChange={(e) => setWarmth(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                  <span>1 (Frío)</span>
                  <span>5 (Cálido)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-white">
                    Energía
                  </label>
                  <span className="text-sm font-semibold text-blue-400">
                    {energy}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                  <span>1 (Calmado)</span>
                  <span>5 (Enérgico)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-white">
                    Humor
                  </label>
                  <span className="text-sm font-semibold text-blue-400">
                    {humor}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={humor}
                  onChange={(e) => setHumor(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                  <span>1 (Serio)</span>
                  <span>5 (Humorístico)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-white">
                    Confianza
                  </label>
                  <span className="text-sm font-semibold text-blue-400">
                    {confidence}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                  <span>1 (Cauteloso)</span>
                  <span>5 (Confiado)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-700 pt-6 mb-6">
              <h4 className="text-md font-semibold text-white mb-4">Legibilidad</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nivel de Lectura (1-14)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(Math.min(14, Math.max(1, parseInt(e.target.value) || 8)))}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                  />
                  <p className="text-xs text-neutral-500 mt-1">8 = educación secundaria</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Máx. Exclamaciones (0-5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={maxExclamations}
                    onChange={(e) => setMaxExclamations(Math.min(5, Math.max(0, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Por texto</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Permitir Emojis
                  </label>
                  <button
                    type="button"
                    onClick={() => setAllowEmojis(!allowEmojis)}
                    className={`w-full px-3 py-2 rounded transition-colors ${
                      allowEmojis 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500' 
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {allowEmojis ? '✓ Permitido' : '✗ No permitido'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Palabras Prohibidas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={bannedWordInput}
                  onChange={(e) => setBannedWordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBannedWord())}
                  placeholder="Ej: 'barato', 'gratis'"
                  className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
                <Button onClick={handleAddBannedWord} disabled={!bannedWordInput.trim()}>
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {bannedWords.map((word, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 rounded text-sm">
                    {word}
                    <button onClick={() => handleRemoveBannedWord(idx)} className="hover:text-red-100">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Patrones Prohibidos (Regex)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={bannedPatternInput}
                  onChange={(e) => setBannedPatternInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBannedPattern())}
                  placeholder="Ej: '^100%', 'garantizado'"
                  className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
                <Button onClick={handleAddBannedPattern} disabled={!bannedPatternInput.trim()}>
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {bannedPatterns.map((pattern, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-300 rounded text-sm font-mono">
                    {pattern}
                    <button onClick={() => handleRemoveBannedPattern(idx)} className="hover:text-orange-100">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Logo Usage Section */}
          <div className="border-t border-neutral-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Uso del Logo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tamaño Mínimo (píxeles)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minWidthPx}
                    onChange={(e) => setMinWidthPx(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="Ancho"
                    className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                  />
                  <span className="text-neutral-500 self-center">×</span>
                  <input
                    type="number"
                    min="0"
                    value={minHeightPx}
                    onChange={(e) => setMinHeightPx(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="Alto"
                    className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Espacio Libre Mínimo (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={minClearSpaceX}
                  onChange={(e) => setMinClearSpaceX(Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {minClearSpaceX}× del tamaño del logo
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                <span className="flex items-center gap-2">
                  Bloquear Aspecto (Aspect Ratio)
                  <button
                    type="button"
                    onClick={() => setAspectRatioLock(!aspectRatioLock)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      aspectRatioLock 
                        ? 'bg-green-500/20 text-green-300 border border-green-500' 
                        : 'bg-neutral-700 text-neutral-400 border border-neutral-600'
                    }`}
                  >
                    {aspectRatioLock ? '🔒 Bloqueado' : '🔓 Libre'}
                  </button>
                </span>
              </label>
              <p className="text-xs text-neutral-500">
                {aspectRatioLock ? 'El logo debe mantener sus proporciones originales' : 'Se permite distorsionar el logo'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Posiciones Permitidas
              </label>
              <div className="flex flex-wrap gap-2">
                {PLACEMENT_GRID_OPTIONS.map((placement) => (
                  <button
                    key={placement}
                    type="button"
                    onClick={() => togglePlacement(placement)}
                    className={'px-3 py-1 rounded text-sm transition-colors ' + (
                      placementGrid.includes(placement)
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600'
                    )}
                  >
                    {placement}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-700 pt-4">
              <h4 className="text-md font-semibold text-white mb-4">Restricciones de Fondo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Contraste Mínimo (1-21)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="21"
                    step="0.1"
                    value={minContrastRatio}
                    onChange={(e) => setMinContrastRatio(Math.min(21, Math.max(1, parseFloat(e.target.value) || 4.5)))}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    WCAG: 4.5 recomendado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Umbral Inversión (0-1)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={invertThresholdLuminance}
                    onChange={(e) => setInvertThresholdLuminance(Math.min(1, Math.max(0, parseFloat(e.target.value) || 0.35)))}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Luminancia para invertir colores del logo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Máx. Complejidad Fondo (0-1)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={maxBackgroundComplexity}
                    onChange={(e) => setMaxBackgroundComplexity(Math.min(1, Math.max(0, parseFloat(e.target.value) || 0.25)))}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Complejidad máxima permitida del fondo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Blur si Fondo Complejo
                  </label>
                  <button
                    type="button"
                    onClick={() => setBlurOverlayRequired(!blurOverlayRequired)}
                    className={`w-full px-3 py-2 rounded transition-colors ${
                      blurOverlayRequired 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500' 
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {blurOverlayRequired ? '✓ Requerido' : '✗ No requerido'}
                  </button>
                  <p className="text-xs text-neutral-500 mt-1">
                    Aplicar blur sobre fondos complejos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Claims Section */}
          <div className="border-t border-neutral-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Afirmaciones (Claims)</h3>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Patrones de Claims Prohibidos (Regex)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={claimPatternInput}
                  onChange={(e) => setClaimPatternInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddClaimPattern())}
                  placeholder="Ej: 'el mejor', 'garantizado 100%'"
                  className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
                <Button onClick={handleAddClaimPattern} disabled={!claimPatternInput.trim()}>
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {claimBannedPatterns.map((pattern, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 rounded text-sm">
                    {pattern}
                    <button onClick={() => handleRemoveClaimPattern(idx)} className="hover:text-red-100">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-neutral-800">
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Crear Reglas'}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};
