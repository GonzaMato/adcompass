"use client";

import { useState, useEffect } from "react";
import { Brand, Color } from "../types/brand";
import { Card } from "./Card";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  brand?: Brand | null;
  mode: 'create' | 'edit';
}

interface LogoWithFile {
  type: 'primary' | 'stacked' | 'mark-only' | 'mono' | 'inverted';
  file: File | null;
  preview?: string;
  invertOnDark?: boolean;
}

export const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  onSave,
  brand,
  mode
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState<Color[]>([]);
  const [logos, setLogos] = useState<LogoWithFile[]>([]);
  const [taglines, setTaglines] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newColor, setNewColor] = useState<Color>({
    hex: '#000000',
    role: '',
    allowAsBackground: true
  });

  const [newLogoType, setNewLogoType] = useState<'primary' | 'stacked' | 'mark-only' | 'mono' | 'inverted'>('primary');
  const [newTagline, setNewTagline] = useState('');

  useEffect(() => {
    if (brand && mode === 'edit') {
      setName(brand.name);
      setDescription(brand.description || '');
      setColors(brand.colors || []);
      setTaglines(brand.taglinesAllowed || []);
    } else {
      setName('');
      setDescription('');
      setColors([]);
      setLogos([]);
      setTaglines([]);
    }
  }, [brand, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (mode === 'create' && logos.length === 0) {
      setError('Debes agregar al menos un logo');
      return;
    }

    if (mode === 'create' && logos.some(l => !l.file)) {
      setError('Todos los logos deben tener un archivo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      formData.append('name', name);
      if (description) {
        formData.append('description', description);
      }
      
      if (colors.length > 0) {
        formData.append('colors', JSON.stringify(colors));
      }
      
      const logosMetadata = logos.map(logo => ({
        type: logo.type,
        invertOnDark: logo.invertOnDark || false
      }));
      formData.append('logos', JSON.stringify(logosMetadata));
      
      logos.forEach((logo, index) => {
        if (logo.file) {
          formData.append(`logoFile${index}`, logo.file);
        }
      });
      
      if (taglines.length > 0) {
        formData.append('taglinesAllowed', JSON.stringify(taglines));
      }

      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const addColor = () => {
    if (!newColor.hex.match(/^#[0-9A-F]{6}$/i)) {
      setError('El color debe estar en formato HEX (#RRGGBB)');
      return;
    }
    setColors(prev => [...prev, newColor]);
    setNewColor({ hex: '#000000', role: '', allowAsBackground: true });
    setError(null);
  };

  const removeColor = (index: number) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/svg+xml', 'image/png'].includes(file.type)) {
      setError('Solo se permiten archivos SVG o PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no puede superar 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const newLogo: LogoWithFile = {
        type: newLogoType,
        file,
        preview: event.target?.result as string,
        invertOnDark: false
      };
      setLogos(prev => [...prev, newLogo]);
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeLogo = (index: number) => {
    setLogos(prev => prev.filter((_, i) => i !== index));
  };

  const addTagline = () => {
    if (!newTagline.trim()) {
      setError('El tagline no puede estar vacío');
      return;
    }
    setTaglines(prev => [...prev, newTagline.trim()]);
    setNewTagline('');
    setError(null);
  };

  const removeTagline = (index: number) => {
    setTaglines(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-neutral-900 border-neutral-700">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {mode === 'create' ? 'Crear Nueva Marca' : 'Editar Marca'}
              </h2>
              <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Nombre de la Marca *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ej: Belora"
                  maxLength={80}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Descripción de la marca..."
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Colores</h3>
              {colors.length > 0 && (
                <div className="space-y-2 mb-3">
                  {colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-neutral-800 rounded-lg">
                      <div className="w-10 h-10 rounded border-2 border-neutral-600" style={{ backgroundColor: color.hex }} />
                      <div className="flex-1 text-sm">
                        <div className="text-white font-mono">{color.hex}</div>
                        {color.role && <div className="text-neutral-400">{color.role}</div>}
                      </div>
                      <button type="button" onClick={() => removeColor(index)} className="text-red-400 hover:text-red-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <input
                  type="color"
                  value={newColor.hex}
                  onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value.toUpperCase() }))}
                  className="w-12 h-10 rounded border border-neutral-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={newColor.hex}
                  onChange={(e) => setNewColor(prev => ({ ...prev, hex: e.target.value }))}
                  className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white font-mono text-sm w-24"
                  placeholder="#000000"
                />
                <input
                  type="text"
                  value={newColor.role}
                  onChange={(e) => setNewColor(prev => ({ ...prev, role: e.target.value }))}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm"
                  placeholder="Role (ej: primary)"
                />
                <button type="button" onClick={addColor} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors">
                  + Agregar
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Logos *</h3>
              {logos.length > 0 && (
                <div className="space-y-2 mb-3">
                  {logos.map((logo, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-neutral-800 rounded-lg">
                      <div className="w-16 h-16 bg-neutral-700 rounded flex items-center justify-center overflow-hidden">
                        {logo.preview && <img src={logo.preview} alt="Logo preview" className="max-w-full max-h-full object-contain" />}
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="text-white">{logo.file?.name}</div>
                        <div className="text-neutral-400">{logo.type} • {(logo.file?.size || 0) / 1024} KB</div>
                      </div>
                      <button type="button" onClick={() => removeLogo(index)} className="text-red-400 hover:text-red-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <select
                  value={newLogoType}
                  onChange={(e) => setNewLogoType(e.target.value as typeof newLogoType)}
                  className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm"
                >
                  <option value="primary">Primary</option>
                  <option value="stacked">Stacked</option>
                  <option value="mark-only">Mark Only</option>
                  <option value="mono">Mono</option>
                  <option value="inverted">Inverted</option>
                </select>
                <label className="flex-1 min-w-[200px] px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm cursor-pointer hover:bg-neutral-750 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Subir archivo (SVG o PNG)
                  <input type="file" accept="image/svg+xml,image/png" onChange={handleLogoFileChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-neutral-500 mt-1">Máximo 5MB por archivo</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Taglines Permitidos</h3>
              {taglines.length > 0 && (
                <div className="space-y-2 mb-3">
                  {taglines.map((tagline, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-neutral-800 rounded-lg">
                      <div className="flex-1 text-sm text-white">{tagline}</div>
                      <button type="button" onClick={() => removeTagline(index)} className="text-red-400 hover:text-red-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTagline())}
                  className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white text-sm"
                  placeholder="Ej: Vida slow junto al río"
                  maxLength={120}
                />
                <button type="button" onClick={addTagline} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors">
                  + Agregar
                </button>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-neutral-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </span>
                ) : mode === 'create' ? 'Crear Marca' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
