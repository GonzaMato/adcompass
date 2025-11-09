"use client";

import { useState } from "react";
import { Button } from "./Button";

interface BrandRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: any) => Promise<void>;
  brandName: string;
}

const ALLOWED_TONES = ['formal', 'friendly', 'playful', 'authoritative'];
const ALLOWED_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
const BANNED_BACKGROUNDS = ['patterned', 'image', 'video', 'gradient', 'low-contrast'];
const SENSITIVE_CATEGORIES = ['politics', 'religion', 'health', 'alcohol', 'gambling', 'adult', 'financial'];

export const BrandRulesModal: React.FC<BrandRulesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  brandName,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [prohibitedClaims, setProhibitedClaims] = useState<string[]>([]);
  const [claimInput, setClaimInput] = useState("");

  const [allowedTones, setAllowedTones] = useState<string[]>([]);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [wordInput, setWordInput] = useState("");

  const [allowedPositions, setAllowedPositions] = useState<string[]>([]);
  const [bannedBackgroundTypes, setBannedBackgroundTypes] = useState<string[]>([]);
  const [invertOnDark, setInvertOnDark] = useState(false);
  const [minClearSpaceRatio, setMinClearSpaceRatio] = useState(0);

  const [disallowCategories, setDisallowCategories] = useState<string[]>([]);
  const [minAudienceAge, setMinAudienceAge] = useState<string>("");

  const [requiredDisclaimers, setRequiredDisclaimers] = useState<string[]>([]);
  const [disclaimerInput, setDisclaimerInput] = useState("");

  if (!isOpen) return null;

  const handleAddClaim = () => {
    if (claimInput.trim() && prohibitedClaims.length < 5000) {
      setProhibitedClaims([...prohibitedClaims, claimInput.trim()]);
      setClaimInput("");
    }
  };

  const handleRemoveClaim = (index: number) => {
    setProhibitedClaims(prohibitedClaims.filter((_, i) => i !== index));
  };

  const handleAddWord = () => {
    if (wordInput.trim() && bannedWords.length < 5000) {
      setBannedWords([...bannedWords, wordInput.trim()]);
      setWordInput("");
    }
  };

  const handleRemoveWord = (index: number) => {
    setBannedWords(bannedWords.filter((_, i) => i !== index));
  };

  const handleAddDisclaimer = () => {
    if (disclaimerInput.trim() && requiredDisclaimers.length < 200) {
      setRequiredDisclaimers([...requiredDisclaimers, disclaimerInput.trim()]);
      setDisclaimerInput("");
    }
  };

  const handleRemoveDisclaimer = (index: number) => {
    setRequiredDisclaimers(requiredDisclaimers.filter((_, i) => i !== index));
  };

  const toggleTone = (tone: string) => {
    setAllowedTones(prev =>
      prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]
    );
  };

  const togglePosition = (position: string) => {
    setAllowedPositions(prev =>
      prev.includes(position) ? prev.filter(p => p !== position) : [...prev, position]
    );
  };

  const toggleBackground = (background: string) => {
    setBannedBackgroundTypes(prev =>
      prev.includes(background) ? prev.filter(b => b !== background) : [...prev, background]
    );
  };

  const toggleCategory = (category: string) => {
    setDisallowCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const rulesData = {
        prohibitedClaims,
        tone: {
          allowed: allowedTones,
          bannedWords,
        },
        logoUsage: {
          allowedPositions,
          bannedBackgrounds: bannedBackgroundTypes,
          invertOnDark,
          minClearSpaceRatio,
        },
        sensitive: {
          disallowCategories,
          ...(minAudienceAge ? { minAudienceAge: parseInt(minAudienceAge) } : {}),
        },
        requiredDisclaimers,
      };

      await onSave(rulesData);
      // Resetear form si es exitoso
      setProhibitedClaims([]);
      setAllowedTones([]);
      setBannedWords([]);
      setAllowedPositions([]);
      setBannedBackgroundTypes([]);
      setInvertOnDark(false);
      setMinClearSpaceRatio(0);
      setDisallowCategories([]);
      setMinAudienceAge("");
      setRequiredDisclaimers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reglas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-neutral-900 rounded-lg p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Crear Reglas</h2>
        <p className="text-neutral-400 mb-6">
          Define las reglas de uso para la marca: {brandName}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Prohibited Claims */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Afirmaciones Prohibidas
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={claimInput}
                onChange={(e) => setClaimInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddClaim())}
                placeholder="Ej: 'El mejor producto del mercado'"
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
              <Button onClick={handleAddClaim} disabled={!claimInput.trim()}>
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {prohibitedClaims.map((claim, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 rounded text-sm">
                  {claim}
                  <button onClick={() => handleRemoveClaim(idx)} className="hover:text-red-100">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Tone Section */}
          <div className="border-t border-neutral-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tono de Comunicación</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Tonos Permitidos
              </label>
              <div className="flex flex-wrap gap-2">
                {ALLOWED_TONES.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => toggleTone(tone)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      allowedTones.includes(tone)
                        ? 'bg-green-500/20 text-green-300 border border-green-500'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Palabras Prohibidas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWord())}
                  placeholder="Ej: 'barato', 'gratis'"
                  className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
                <Button onClick={handleAddWord} disabled={!wordInput.trim()}>
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {bannedWords.map((word, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 rounded text-sm">
                    {word}
                    <button onClick={() => handleRemoveWord(idx)} className="hover:text-red-100">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Logo Usage Section */}
          <div className="border-t border-neutral-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Uso del Logo</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Posiciones Permitidas
              </label>
              <div className="flex flex-wrap gap-2">
                {ALLOWED_POSITIONS.map((position) => (
                  <button
                    key={position}
                    onClick={() => togglePosition(position)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      allowedPositions.includes(position)
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Fondos Prohibidos
              </label>
              <div className="flex flex-wrap gap-2">
                {BANNED_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => toggleBackground(bg)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      bannedBackgroundTypes.includes(bg)
                        ? 'bg-red-500/20 text-red-300 border border-red-500'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={invertOnDark}
                  onChange={(e) => setInvertOnDark(e.target.checked)}
                  className="w-4 h-4"
                />
                Invertir logo en fondos oscuros
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Espacio libre mínimo alrededor del logo (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={minClearSpaceRatio}
                onChange={(e) => setMinClearSpaceRatio(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-neutral-500 mt-1">
                {(minClearSpaceRatio * 100).toFixed(0)}% del tamaño del logo
              </p>
            </div>
          </div>

          {/* Sensitive Content Section */}
          <div className="border-t border-neutral-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contenido Sensible</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Categorías No Permitidas
              </label>
              <div className="flex flex-wrap gap-2">
                {SENSITIVE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      disallowCategories.includes(category)
                        ? 'bg-red-500/20 text-red-300 border border-red-500'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Edad Mínima de Audiencia (opcional)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={minAudienceAge}
                onChange={(e) => setMinAudienceAge(e.target.value)}
                placeholder="Ej: 18"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Required Disclaimers */}
          <div className="border-t border-neutral-800 pt-6">
            <label className="block text-sm font-medium text-white mb-2">
              Descargos Requeridos (opcional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={disclaimerInput}
                onChange={(e) => setDisclaimerInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDisclaimer())}
                placeholder="Ej: 'Consulte a su médico antes de usar'"
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
              <Button onClick={handleAddDisclaimer} disabled={!disclaimerInput.trim()}>
                Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {requiredDisclaimers.map((disclaimer, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-neutral-800 rounded">
                  <span className="flex-1 text-sm text-neutral-300">{disclaimer}</span>
                  <button
                    onClick={() => handleRemoveDisclaimer(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
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
  );
};
