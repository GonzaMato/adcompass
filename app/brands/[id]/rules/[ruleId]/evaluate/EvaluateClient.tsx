"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { evaluationAPI, brandsAPI } from "@/lib/api";
import { BackgroundGradient } from "@/app/components/ui/BackgroundGradient";

type Props = {
  brandId: string;
  ruleId: string;
};

export default function EvaluateClient({ brandId, ruleId }: Props) {
  const router = useRouter();

  const [brandName, setBrandName] = useState<string | null>(null);
  const [brandLoading, setBrandLoading] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBrandLoading(true);
        const data = await brandsAPI.get(brandId);
        if (mounted) setBrandName(data?.name ?? null);
      } catch {
        if (mounted) setBrandName(null);
      } finally {
        if (mounted) setBrandLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [brandId]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const isVideo = file?.type?.startsWith("video/") ?? false;
  const isImage = file?.type?.startsWith("image/") ?? false;
  const ruleShort = useMemo(() => (ruleId?.split("-")[0] ?? ruleId), [ruleId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateAndSetFile = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null);
      return;
    }
    setError(null);
    setSuccessMsg(null);

    const isVid = nextFile.type.startsWith("video/");
    const isImg = nextFile.type.startsWith("image/");
    const maxBytes = isVid ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

    if (!isVid && !isImg) {
      setError("Tipo de archivo no soportado. Usa imagen o video.");
      setFile(null);
      return;
    }
    if (nextFile.size > maxBytes) {
      setError(isVid ? "El video supera el límite de 5 MB" : "La imagen supera el límite de 10 MB");
      setFile(null);
      return;
    }

    setFile(nextFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0] || null);
  };

  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const nextFile = e.dataTransfer.files?.[0] || null;
    validateAndSetFile(nextFile);
  };

  const handleDragOver: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Seleccioná un archivo para evaluar.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      await evaluationAPI.evaluateMultipart({
        brandId,
        ruleId,
        file,
        context: context?.trim() ? context.trim() : undefined,
      });

      setSuccessMsg("Evaluación enviada correctamente. Verás el resultado en la sección correspondiente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la evaluación");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-white">Evaluar Asset</h1>
          <p className="mt-2 text-neutral-400">
            Marca: {brandLoading ? "Cargando..." : (brandName ?? brandId)} — Regla: {ruleShort}
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Upload / Preview */}
          <BackgroundGradient>
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="flex flex-col gap-5">
                <div>
                  <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`flex flex-col items-center justify-center gap-3 w-full rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
                      ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-700 hover:border-neutral-600 bg-neutral-950/40'} min-h-[14rem] md:min-h-[16rem]`}
                    tabIndex={0}
                    role="button"
                  >
                    <div className="text-neutral-300">
                      <svg className="w-10 h-10 mx-auto mb-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="font-medium">Arrastrá tu archivo aquí</div>
                      <div className="text-xs text-neutral-500 mt-1">o hacé click para seleccionar</div>
                      <div className="text-xs text-neutral-500 mt-2">Video: máx 5 MB • Imagen: máx 10 MB</div>
                      {file && (
                        <div className="mt-3 text-xs text-neutral-400 break-all">
                          Seleccionado: {file.name}
                        </div>
                      )}
                    </div>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="asset-input"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>

                {previewUrl && (
                  <div className="rounded-lg border border-neutral-800 p-4 bg-neutral-950/40">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-neutral-300">Previsualización</div>
                      <div className="text-xs text-neutral-500">
                        {file?.type?.split("/")[0].toUpperCase()} • {file?.name}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      {isImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-80 object-contain rounded-md"
                        />
                      )}
                      {isVideo && (
                        <video
                          src={previewUrl}
                          controls
                          className="w-full max-h-96 rounded-md"
                        />
                      )}
                    </div>
                    <div className="mt-3 text-xs text-neutral-500 break-all">
                      {(file?.size ?? 0) / 1024 < 1024
                        ? `${Math.round((file?.size ?? 0) / 1024)} KB`
                        : `${((file?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB`}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </BackgroundGradient>

          {/* Context + Submit */}
          <BackgroundGradient>
            <Card className="bg-neutral-900 border-neutral-800 h-full">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Contexto de la evaluación
                  </label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Ej: Publicidad para TikTok en Halloween, audiencia 18-25, tono divertido."
                    className="w-full rounded-md bg-neutral-950/60 border border-neutral-800 text-neutral-200 placeholder-neutral-600 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={8}
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    Opcional, ayuda a dar contexto al evaluador.
                  </p>
                </div>

                {error && (
                  <div className="rounded-md border border-red-800/60 bg-red-950/40 text-red-300 text-sm p-3">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="rounded-md border border-green-800/60 bg-green-950/30 text-green-300 text-sm p-3">
                    {successMsg}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={!file || submitting}
                    className={!file || submitting ? "opacity-60 cursor-not-allowed" : ""}
                  >
                    {submitting ? "Enviando..." : "Evaluar"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setContext("");
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="px-4 py-2 rounded-md text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </Card>
          </BackgroundGradient>
        </div>
      </div>
    </div>
  );
}

