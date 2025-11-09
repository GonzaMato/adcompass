"use client";

import { Card } from "@/app/components/Card";
import { BackgroundGradient } from "@/app/components/ui/BackgroundGradient";
import { Badge } from "@/app/components/Badge";

type Props = {
  brandName: string | null;
  brandId: string;
  ruleShort: string;
  evaluationResult: any;
  onStartOver: () => void;
  onBack: () => void;
};

type EvaluationData = {
  evaluation_id?: string;
  timestamp?: string;
  scores?: {
    BrandFit?: number;
    VisualQuality?: number;
    Clarity?: number;
    Safety?: number;
    OverallScore?: number;
  };
  violations?: Array<{
    type: string;
    severity: string;
    message: string;
    dimension?: string;
    confidence?: number;
    detected_text?: string | string[];
    expected_product_category?: string;
    detected_product_category?: string;
    detected_theme?: string;
    expected_theme?: string;
    detected_area?: number;
    threshold?: number;
  }>;
  blockers?: Array<any>;
  warnings?: Array<any>;
  evidence?: Array<{
    observation: string;
    source: string;
    confidence?: number;
    dimension?: string;
  }>;
  recommendations?: Array<{
    action: string;
    expected_impact?: string;
    dimension?: string;
  }>;
  metadata?: {
    brand_id?: string;
    brand_name?: string;
    total_processing_time_ms?: number;
    critical_violations?: number;
  };
};

export default function ResultsScreenImage({
  brandName,
  brandId,
  ruleShort,
  evaluationResult,
  onStartOver,
  onBack,
}: Props) {
  // Parse evaluation data
  const parseEvaluationData = (): EvaluationData => {
    if (!evaluationResult) return {};
    
    if (typeof evaluationResult === 'string') {
      try {
        return JSON.parse(evaluationResult);
      } catch {
        return {};
      }
    }
    
    return evaluationResult;
  };

  const data = parseEvaluationData();
  
  // Extract scores
  const overallScore = data.scores?.OverallScore 
    ? Math.round(data.scores.OverallScore * 100) 
    : 0;
  
  const dimensionScores = [
    { name: "Brand Fit", score: data.scores?.BrandFit, icon: "🏷️", key: "BrandFit" },
    { name: "Visual Quality", score: data.scores?.VisualQuality, icon: "🖼️", key: "VisualQuality" },
    { name: "Clarity", score: data.scores?.Clarity, icon: "📝", key: "Clarity" },
    { name: "Safety", score: data.scores?.Safety, icon: "🛡️", key: "Safety" },
  ].filter(d => d.score !== undefined).map(d => ({
    ...d,
    score: Math.round(d.score! * 100)
  }));

  // Count violations by severity
  const violationsBySeverity = {
    high: data.violations?.filter(v => v.severity === 'high').length || 0,
    medium: data.violations?.filter(v => v.severity === 'medium').length || 0,
    low: data.violations?.filter(v => v.severity === 'low').length || 0,
  };
  
  const totalViolations = Object.values(violationsBySeverity).reduce((a, b) => a + b, 0);
  const totalBlockers = data.blockers?.length || 0;
  const totalWarnings = data.warnings?.length || 0;
  const totalEvidence = data.evidence?.length || 0;
  const totalRecommendations = data.recommendations?.length || 0;

  // Group violations by dimension
  const violationsByDimension = (data.violations || []).reduce((acc, violation) => {
    const dim = violation.dimension || 'General';
    if (!acc[dim]) acc[dim] = [];
    acc[dim].push(violation);
    return acc;
  }, {} as Record<string, typeof data.violations>);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-yellow-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return "from-green-600 to-green-400";
    if (score >= 75) return "from-yellow-600 to-yellow-400";
    if (score >= 60) return "from-orange-600 to-orange-400";
    return "from-red-600 to-red-400";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/20 text-red-300 border-red-500/50";
      case "medium": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "low": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      default: return "bg-neutral-500/20 text-neutral-300 border-neutral-500/50";
    }
  };

  const getSeverityBadgeText = (severity: string) => {
    switch (severity) {
      case "high": return "Alta Prioridad";
      case "medium": return "Media Prioridad";
      case "low": return "Baja Prioridad";
      default: return severity;
    }
  };

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Nueva Evaluación
          </button>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Reporte
            </button>
            <button
              onClick={onBack}
              className="text-neutral-400 hover:text-white transition-colors text-sm"
            >
              Volver al listado
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="success">Evaluación Completada</Badge>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-white mb-2">
            Análisis de Imagen
          </h1>
          <p className="text-neutral-400 text-lg">
            {brandName ?? brandId} — Regla: {ruleShort}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-neutral-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {data.timestamp 
              ? `Evaluado el ${new Date(data.timestamp).toLocaleString('es-AR')}`
              : `Evaluado el ${new Date().toLocaleString('es-AR')}`
            }
          </div>
          {data.evaluation_id && (
            <div className="text-xs text-neutral-600 mt-2">
              ID: {data.evaluation_id}
            </div>
          )}
        </div>

        {/* Score Overview */}
        <div className="mb-12">
          <BackgroundGradient>
            <Card className="bg-neutral-900 border-neutral-800 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Score Circle */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-neutral-800"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        strokeDasharray={`${overallScore * 5.53} 553`}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" className={`${overallScore >= 75 ? 'text-green-600' : 'text-orange-600'}`} stopColor="currentColor" />
                          <stop offset="100%" className={`${overallScore >= 75 ? 'text-green-400' : 'text-orange-400'}`} stopColor="currentColor" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                        {overallScore}
                      </div>
                      <div className="text-sm text-neutral-400 mt-1">de 100</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-400">{violationsBySeverity.high}</div>
                    <div className="text-xs text-neutral-400 mt-1">Alta Prioridad</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{violationsBySeverity.medium}</div>
                    <div className="text-xs text-neutral-400 mt-1">Media Prioridad</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">{violationsBySeverity.low}</div>
                    <div className="text-xs text-neutral-400 mt-1">Baja Prioridad</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400">{totalViolations}</div>
                    <div className="text-xs text-neutral-400 mt-1">Total Problemas</div>
                  </div>
                </div>
              </div>

              {/* Additional Stats Row */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                {totalBlockers > 0 && (
                  <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-red-400">{totalBlockers}</div>
                    <div className="text-xs text-neutral-400 mt-1">🚫 Críticos</div>
                  </div>
                )}
                {totalWarnings > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-yellow-400">{totalWarnings}</div>
                    <div className="text-xs text-neutral-400 mt-1">⚡ Advertencias</div>
                  </div>
                )}
                {totalEvidence > 0 && (
                  <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-blue-400">{totalEvidence}</div>
                    <div className="text-xs text-neutral-400 mt-1">🔍 Evidencias</div>
                  </div>
                )}
                {totalRecommendations > 0 && (
                  <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-green-400">{totalRecommendations}</div>
                    <div className="text-xs text-neutral-400 mt-1">💡 Recomendaciones</div>
                  </div>
                )}
                {dimensionScores.length > 0 && (
                  <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-purple-400">{dimensionScores.length}</div>
                    <div className="text-xs text-neutral-400 mt-1">📊 Dimensiones</div>
                  </div>
                )}
              </div>

              {/* Progress message */}
              <div className="mt-6 text-center">
                <p className="text-neutral-300">
                  {overallScore >= 90 && "¡Excelente! Tu imagen cumple casi a la perfección con las guías de marca."}
                  {overallScore >= 75 && overallScore < 90 && "Muy bien! Tu imagen está alineada con la marca, con pequeñas mejoras sugeridas."}
                  {overallScore >= 60 && overallScore < 75 && "Buen trabajo, pero hay algunos aspectos importantes a mejorar."}
                  {overallScore < 60 && "Tu imagen necesita ajustes significativos para alinearse con la marca."}
                </p>
              </div>

              {/* Processing time and metadata */}
              <div className="mt-4 text-center space-y-1">
                {data.metadata?.total_processing_time_ms && (
                  <div className="text-xs text-neutral-500">
                    ⚡ Procesado en {(data.metadata.total_processing_time_ms / 1000).toFixed(2)}s
                  </div>
                )}
              </div>
            </Card>
          </BackgroundGradient>
        </div>

        {/* Dimension Scores */}
        {dimensionScores.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Análisis por Dimensión
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dimensionScores.map((dimension, index) => (
                <BackgroundGradient key={index}>
                  <Card className="bg-neutral-900 border-neutral-800 p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-2xl mb-2">{dimension.icon}</div>
                        <h3 className="text-lg font-semibold text-white">{dimension.name}</h3>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(dimension.score)}`}>
                        {dimension.score}
                      </div>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(dimension.score)} transition-all duration-1000`}
                        style={{ width: `${dimension.score}%` }}
                      ></div>
                    </div>
                    <div className="mt-3 text-xs text-neutral-500">
                      {violationsByDimension[dimension.key]?.length || 0} problemas detectados
                    </div>
                  </Card>
                </BackgroundGradient>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              Advertencias ({data.warnings.length})
            </h2>
            <div className="space-y-4">
              {data.warnings.map((warning: any, index: number) => (
                <BackgroundGradient key={index}>
                  <Card className="bg-yellow-950/30 border-yellow-800/50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {warning.dimension && (
                              <div className="text-xs text-yellow-400 mb-1">{warning.dimension}</div>
                            )}
                            <h3 className="text-lg font-semibold text-white">
                              {warning.type?.replace(/_/g, ' ').toUpperCase() || 'Advertencia'}
                            </h3>
                          </div>
                          {warning.confidence && (
                            <div className="text-xs text-neutral-500">
                              {Math.round(warning.confidence * 100)}% confianza
                            </div>
                          )}
                        </div>
                        <p className="text-neutral-300">{warning.message}</p>
                      </div>
                    </div>
                  </Card>
                </BackgroundGradient>
              ))}
            </div>
          </div>
        )}

        {/* Blockers */}
        {totalBlockers > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🚫</span>
              Problemas Críticos ({totalBlockers})
            </h2>
            <div className="space-y-4">
              {data.blockers?.map((blocker, index) => (
                <BackgroundGradient key={index}>
                  <Card className="bg-red-950/30 border-red-800/50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-xs text-red-400 mb-1">{blocker.dimension || 'General'}</div>
                            <h3 className="text-lg font-semibold text-white">{blocker.type?.replace(/_/g, ' ').toUpperCase() || 'Problema Crítico'}</h3>
                          </div>
                          {blocker.confidence && (
                            <div className="text-xs text-neutral-500">
                              {Math.round(blocker.confidence * 100)}% confianza
                            </div>
                          )}
                        </div>
                        <p className="text-neutral-300">{blocker.message}</p>
                      </div>
                    </div>
                  </Card>
                </BackgroundGradient>
              ))}
            </div>
          </div>
        )}

        {/* Violations by Dimension */}
        {totalViolations > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              Problemas Detectados ({totalViolations})
            </h2>
            
            {Object.entries(violationsByDimension).map(([dimension, violations]) => (
              <div key={dimension} className="mb-8">
                <h3 className="text-xl font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                  <span className="text-2xl">
                    {dimension === 'BrandFit' && '🏷️'}
                    {dimension === 'VisualQuality' && '🖼️'}
                    {dimension === 'Clarity' && '📝'}
                    {dimension === 'Safety' && '🛡️'}
                    {dimension === 'General' && '📊'}
                  </span>
                  {dimension}
                  <span className="text-sm text-neutral-500">({violations?.length || 0})</span>
                </h3>
                <div className="space-y-4">
                  {violations?.map((violation, index) => (
                    <BackgroundGradient key={index}>
                      <Card className="bg-neutral-900 border-neutral-800 p-6">
                        <div className="flex items-start gap-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(violation.severity)}`}>
                            {getSeverityBadgeText(violation.severity)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-1">
                                  {violation.type?.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </h4>
                              </div>
                              {violation.confidence && (
                                <div className="text-xs text-neutral-500">
                                  {Math.round(violation.confidence * 100)}% confianza
                                </div>
                              )}
                            </div>
                            <p className="text-neutral-400 mb-3">{violation.message}</p>
                            
                            <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                              {violation.expected_product_category && (
                                <div className="bg-neutral-800 px-2 py-1 rounded">
                                  Esperado: {violation.expected_product_category}
                                </div>
                              )}
                              {violation.detected_product_category && (
                                <div className="bg-neutral-800 px-2 py-1 rounded">
                                  Detectado: {violation.detected_product_category}
                                </div>
                              )}
                              {violation.expected_theme && (
                                <div className="bg-neutral-800 px-2 py-1 rounded">
                                  Tema esperado: {violation.expected_theme}
                                </div>
                              )}
                              {violation.detected_theme && (
                                <div className="bg-neutral-800 px-2 py-1 rounded">
                                  Tema detectado: {violation.detected_theme}
                                </div>
                              )}
                              {violation.detected_area !== undefined && (
                                <div className="bg-neutral-800 px-2 py-1 rounded">
                                  Área detectada: {Math.round(violation.detected_area * 100)}%
                                </div>
                              )}
                              {violation.threshold !== undefined && (
                                <div className="bg-neutral-800 px-2 py-1 rounded">
                                  Umbral: {violation.threshold}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </BackgroundGradient>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Evidence Section */}
        {data.evidence && data.evidence.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              Evidencias ({data.evidence.length})
            </h2>
            
            {/* Group evidence by dimension */}
            {Object.entries(
              data.evidence.reduce((acc, ev) => {
                const dim = ev.dimension || 'General';
                if (!acc[dim]) acc[dim] = [];
                acc[dim].push(ev);
                return acc;
              }, {} as Record<string, typeof data.evidence>)
            ).map(([dimension, evidences]) => (
              <div key={dimension} className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                  <span className="text-xl">
                    {dimension === 'BrandFit' && '🏷️'}
                    {dimension === 'VisualQuality' && '🖼️'}
                    {dimension === 'Clarity' && '📝'}
                    {dimension === 'Safety' && '🛡️'}
                    {dimension === 'General' && '📊'}
                  </span>
                  {dimension}
                  <span className="text-sm text-neutral-500">({evidences?.length || 0})</span>
                </h3>
                <div className="space-y-3">
                  {evidences?.map((evidence, index) => (
                    <BackgroundGradient key={index}>
                      <Card className="bg-neutral-900 border-neutral-800 p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-neutral-300 mb-3">{evidence.observation}</p>
                            
                            <div className="flex flex-wrap gap-3 text-xs">
                              <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-400">
                                📍 {evidence.source}
                              </span>
                              {evidence.confidence && (
                                <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded">
                                  ✓ {Math.round(evidence.confidence * 100)}% confianza
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </BackgroundGradient>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">💡</span>
              Recomendaciones ({data.recommendations.length})
            </h2>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <BackgroundGradient key={index}>
                  <Card className="bg-neutral-900 border-neutral-800 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-neutral-300 mb-2">{rec.action}</p>
                        <div className="flex items-center gap-4 text-xs">
                          {rec.dimension && (
                            <span className="text-neutral-500">📊 {rec.dimension}</span>
                          )}
                          {rec.expected_impact && (
                            <span className="text-green-400">⬆️ {rec.expected_impact}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </BackgroundGradient>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Summary */}
        {data.metadata && Object.keys(data.metadata).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Información de la Evaluación
            </h2>
            <BackgroundGradient>
              <Card className="bg-neutral-900 border-neutral-800 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.metadata.brand_id && (
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Brand ID</div>
                      <div className="text-neutral-300 font-mono text-sm">{data.metadata.brand_id}</div>
                    </div>
                  )}
                  {data.metadata.brand_name && (
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Marca</div>
                      <div className="text-neutral-300 font-semibold">{data.metadata.brand_name}</div>
                    </div>
                  )}
                  {data.evaluation_id && (
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Evaluation ID</div>
                      <div className="text-neutral-300 font-mono text-sm">{data.evaluation_id}</div>
                    </div>
                  )}
                  {data.metadata.total_processing_time_ms && (
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Tiempo de Procesamiento</div>
                      <div className="text-neutral-300">
                        {(data.metadata.total_processing_time_ms / 1000).toFixed(2)}s
                        <span className="text-neutral-500 text-xs ml-2">
                          ({data.metadata.total_processing_time_ms}ms)
                        </span>
                      </div>
                    </div>
                  )}
                  {data.metadata.critical_violations !== undefined && (
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Violaciones Críticas</div>
                      <div className={data.metadata.critical_violations > 0 ? "text-red-400 font-bold" : "text-green-400"}>
                        {data.metadata.critical_violations}
                      </div>
                    </div>
                  )}
                  {data.timestamp && (
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Fecha/Hora</div>
                      <div className="text-neutral-300 text-sm">
                        {new Date(data.timestamp).toLocaleString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </BackgroundGradient>
          </div>
        )}

        {/* Debug Info */}
        <details className="mb-8">
          <summary className="cursor-pointer text-neutral-500 hover:text-neutral-300 transition-colors text-sm mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Ver JSON completo de la respuesta
          </summary>
          <BackgroundGradient>
            <Card className="bg-neutral-900 border-neutral-800 p-6">
              <pre className="text-xs text-neutral-500 bg-neutral-950/60 p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </Card>
          </BackgroundGradient>
        </details>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onStartOver}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Evaluar Otra Imagen
          </button>
        </div>
      </div>
    </div>
  );
}
