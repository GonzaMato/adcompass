"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { brandsAPI, evaluationAPI } from "@/lib/api";
import EvaluationForm from "./EvaluationForm";
import LoadingScreen from "./LoadingScreen";
import ResultsScreen from "./ResultsScreen";
import ResultsScreenImage from "./ResultsScreenImage";

type Props = {
  brandId: string;
  ruleId: string;
};

type EvaluationStep = "form" | "loading" | "results";

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
  
  // Control de flujo
  const [currentStep, setCurrentStep] = useState<EvaluationStep>("form");
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [assetType, setAssetType] = useState<"video" | "image" | null>(null);

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
      setError("Unsupported file type. Use image or video.");
      setFile(null);
      return;
    }
    if (nextFile.size > maxBytes) {
      setError(isVid ? "Video exceeds 5 MB limit" : "Image exceeds 10 MB limit");
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
      setError("Select a file to evaluate.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      // Cambiar a pantalla de carga
      setCurrentStep("loading");
      setLoadingProgress(0);

      // Simular progreso mientras se evalúa
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      // Real evaluation request
      const result = await evaluationAPI.evaluateMultipart({
        brandId,
        ruleId,
        file,
        context: context?.trim() ? context.trim() : undefined,
      });

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setEvaluationResult(result);
      setAssetType(isImage ? "image" : "video");
      setCurrentStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting evaluation");
      setCurrentStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep("form");
    setFile(null);
    setContext("");
    setError(null);
    setSuccessMsg(null);
    setEvaluationResult(null);
    setLoadingProgress(0);
  };

  const handleClear = () => {
    setFile(null);
    setContext("");
    setError(null);
    setSuccessMsg(null);
  };

  // Removed mock loaders (video/image). Now always uses real API results.

  // Renderizar según el paso actual
  if (currentStep === "loading") {
    return <LoadingScreen />;
  }

  if (currentStep === "results") {
    // Renderizar componente según el tipo de asset
    const ResultComponent = assetType === "image" ? ResultsScreenImage : ResultsScreen;
    
    return (
      <ResultComponent
        brandName={brandName}
        brandId={brandId}
        ruleShort={ruleShort}
        evaluationResult={evaluationResult}
        onStartOver={handleStartOver}
        onBack={() => router.back()}
      />
    );
  }

  // Renderizar formulario (paso por defecto)
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
            Back
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-white">Evaluate Asset</h1>
          <p className="mt-2 text-neutral-400">
            Brand: {brandLoading ? "Loading..." : (brandName ?? brandId)} — Rule: {ruleShort}
          </p>
        </div>

        {/* Content */}
        <EvaluationForm
          file={file}
          context={context}
          error={error}
          successMsg={successMsg}
          isDragging={isDragging}
          submitting={submitting}
          previewUrl={previewUrl}
          isImage={isImage}
          isVideo={isVideo}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onContextChange={setContext}
          onSubmit={handleSubmit}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}

