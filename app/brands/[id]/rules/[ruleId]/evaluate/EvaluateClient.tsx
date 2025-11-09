"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { brandsAPI } from "@/lib/api";
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

      // TODO: Implementar la llamada a la API de evaluación
      // const result = await evaluationAPI.evaluateMultipart({
      //   brandId,
      //   ruleId,
      //   file,
      //   context: context?.trim() ? context.trim() : undefined,
      // });

      // Simular una evaluación por 3-5 segundos
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Esperar un momento para mostrar 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Resultado con datos completos del JSON de ejemplo
      const mockResult = {
        evaluation_id: "eval_20240728120000",
        timestamp: "2024-07-28T12:00:00Z",
        scores: {
          Audio: 0.73,
          BrandFit: 0.46,
          VisualQuality: 0.53,
          Clarity: 0.65,
          Safety: 0.7,
          OverallScore: 0.6
        },
        violations: [
          {
            type: "cta_missing",
            severity: "high",
            message: "No explicit Call-To-Action (e.g., 'Shop Now', 'Visit Nike.com') was detected visually or in audio, despite 'cta_present' being a required element in the brand kit.",
            first_appearance_timestamp: null,
            threshold: null,
            confidence: 0.98,
            dimension: "BrandFit"
          },
          {
            type: "audio_missing",
            severity: "high",
            message: "A dedicated voiceover is missing from the ad, which is a required element ('audio_voiceover') according to the brand kit. Only background music with vocal samples is present.",
            first_appearance_timestamp: null,
            threshold: null,
            confidence: 0.95,
            dimension: "BrandFit"
          },
          {
            type: "text_duration_too_short",
            severity: "high",
            message: "The text 'NIKE' is visible for only 0.5 seconds (4.50s-5.00s), and 'JUST DO IT' for only 0.5 seconds (4.50s-5.00s). This is insufficient time for the average viewer to read and process.",
            detected_text: "NIKE / JUST DO IT",
            appearance_timestamp: 4.5,
            duration_seconds: 0.5,
            threshold: 1.5,
            confidence: 0.98,
            dimension: "VisualQuality"
          },
          {
            type: "pacing_too_fast",
            severity: "high",
            message: "The video's average scene duration is approximately 1.0 second (5 scenes over 5 seconds). This is too fast for optimal message absorption.",
            average_scene_duration: 1,
            threshold: 1.5,
            confidence: 0.95,
            dimension: "VisualQuality"
          },
          {
            type: "tagline_too_brief",
            severity: "medium",
            message: "The tagline 'JUST DO IT' is visible for only 1.0 second (from 0:03.7 to 0:04.7), which is below the recommended minimum of 2 seconds.",
            detected_text: "JUST DO IT",
            appearance_timestamp: 3.7,
            duration_seconds: 1,
            confidence: 0.97,
            dimension: "BrandFit"
          },
          {
            type: "text_duration_too_short",
            severity: "medium",
            message: "On-screen text elements 'RUN' and 'FASTER' are displayed for only 1.0 second each, making them too brief for easy reading.",
            detected_text: ["RUN", "FASTER"],
            appearance_timestamp: [0, 2],
            duration_seconds: [1, 1],
            confidence: 0.96,
            dimension: "BrandFit"
          },
          {
            type: "tagline_not_spoken",
            severity: "medium",
            message: "The brand's primary tagline 'Just Do It' appears visually on screen but is not spoken in the audio.",
            timestamp_start: "00:04.2",
            timestamp_end: "00:05.0",
            detected_value: "not spoken",
            expected_value: "Just Do It",
            confidence: 0.95,
            dimension: "Audio"
          },
          {
            type: "lack_of_diversity",
            severity: "medium",
            message: "Based on AI-generated sports content, there's a risk of insufficient representation of various demographic groups throughout the video.",
            timestamps: [0, 15],
            confidence: 0.75,
            dimension: "Safety"
          },
          {
            type: "script_mismatch",
            severity: "low",
            message: "The song lyrics are generic pop and do not directly align with Nike's core brand voice as effectively as a dedicated voiceover could.",
            timestamp_start: "00:00.0",
            timestamp_end: "00:05.0",
            detected_value: "Generic pop lyrics",
            expected_value: "Athletic/empowering themes",
            confidence: 0.75,
            dimension: "Audio"
          }
        ],
        blockers: [
          {
            type: "lack_of_diversity",
            severity: "medium",
            message: "Insufficient representation of various demographic groups (gender, ethnicity, age, body type) throughout the video. This contrasts with Nike's stated values of inclusivity.",
            timestamps: [0, 15],
            confidence: 0.75,
            dimension: "Safety"
          },
          {
            type: "flashing_lights",
            severity: "medium",
            message: "The fast-paced nature combined with dynamic transitions carries a risk of exceeding the safe threshold of 2-3 flashes per second.",
            timestamps: [0, 15],
            flash_rate: "potential 2.5-3.0 flashes/sec",
            threshold: 3,
            confidence: 0.7,
            dimension: "Safety"
          }
        ],
        warnings: [
          {
            type: "audio_balance",
            severity: "low",
            message: "Background music peaks at -8dB while voiceover averages -10dB. Consider increasing voiceover prominence.",
            dimension: "Audio",
            confidence: 0.89
          }
        ],
        evidence: [
          {
            observation: "Background music is energetic electronic pop with a driving beat, estimated tempo ~135 BPM.",
            source: "audio_analysis",
            confidence: 0.9,
            dimension: "Audio"
          },
          {
            observation: "Female vocal performance is energetic and confident, matching the upbeat music.",
            source: "speech_analysis",
            confidence: 0.88,
            dimension: "Audio"
          },
          {
            observation: "Object detection tracked 'running shoe' objects appearing from 0.0s and remaining visible throughout 100% of the video. Shoes are prominent, occupying 30-50% of frame area.",
            source: "video_object_tracking",
            timestamps: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5],
            confidence: 0.98,
            dimension: "BrandFit"
          },
          {
            observation: "OCR detected the Nike swoosh logo on the shoes from 0:00.0 to 0:04.7. The text 'NIKE' also appears prominently from 0:03.0 to 0:04.7.",
            source: "logo_detection_temporal",
            confidence: 0.96,
            dimension: "BrandFit"
          },
          {
            observation: "Nike running shoes are visible from 0.00s to 5.00s (100% of video duration), appearing prominently in the lower frame (estimated 25-35% of frame area).",
            source: "video_object_tracking",
            timestamps: [0, 1.5, 2.5, 3.5, 4.5],
            confidence: 0.99,
            dimension: "VisualQuality"
          },
          {
            observation: "SafeSearch analysis: adult=VERY_UNLIKELY, violence=VERY_UNLIKELY, racy=VERY_UNLIKELY. No direct content safety issues detected.",
            source: "google_safesearch_temporal_simulated",
            frames_analyzed: 30,
            confidence: 0.95,
            dimension: "Safety"
          },
          {
            observation: "Audio transcription: 'Experience the power of movement. Just Do It.' Perspective API: TOXICITY=0.03, IDENTITY_ATTACK=0.01. Audio content is entirely positive and motivational.",
            source: "perspective_api_audio",
            confidence: 0.98,
            dimension: "Safety"
          },
          {
            observation: "Scene detection identified cuts at approximately 0:01, 0:03, 0:04, 0:05, resulting in 5-6 distinct scenes over 6 seconds with average duration of 1.0-1.2 seconds.",
            source: "scene_detection",
            confidence: 0.93,
            dimension: "Clarity"
          }
        ],
        recommendations: [
          {
            priority: "high",
            action: "Add a clear Call-To-Action (e.g., 'Shop Now', 'Visit Nike.com') in the final 2-3 seconds, ensuring it remains visible until the end of the video.",
            expected_impact: "+0.25 Clarity score",
            dimension: "VisualQuality"
          },
          {
            priority: "high",
            action: "Integrate a concise voiceover (2-3 seconds) to convey key product benefits or brand messaging, as 'audio_voiceover' is a required element in the brand kit.",
            expected_impact: "+0.10 Clarity score",
            dimension: "BrandFit"
          },
          {
            priority: "medium",
            action: "Add a clear voiceover of the 'Just Do It' tagline when it appears on screen to reinforce brand messaging.",
            expected_impact: "+0.08 Audio score",
            dimension: "Audio"
          },
          {
            priority: "medium",
            action: "Increase the duration of on-screen text to at least 2 seconds for the tagline and 1.5 seconds for other text elements.",
            expected_impact: "+0.15 VisualQuality score",
            dimension: "VisualQuality"
          },
          {
            priority: "low",
            action: "Consider slowing down the pacing slightly by increasing average scene duration to 1.5-2 seconds for better message absorption.",
            expected_impact: "+0.05 Clarity score",
            dimension: "Clarity"
          }
        ],
        metadata: {
          brand_id: brandId,
          brand_name: brandName || "Nike",
          total_processing_time_ms: 34700,
          critical_violations: 2,
          agents_processed: 5,
          agents_failed: 0
        }
      };
      
      setEvaluationResult(mockResult);
      setCurrentStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la evaluación");
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

  const handleLoadMockDataVideo = () => {
    setAssetType("video");
    setCurrentStep("loading");
    setLoadingProgress(0);

    // Simular carga progresiva
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    // Cargar datos mock después de 2 segundos
    setTimeout(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setTimeout(() => {
        const mockResult = {
          evaluation_id: "eval_20240728120000",
          timestamp: "2024-07-28T12:00:00Z",
          scores: {
            Audio: 0.73,
            BrandFit: 0.46,
            VisualQuality: 0.53,
            Clarity: 0.65,
            Safety: 0.7,
            OverallScore: 0.6
          },
          violations: [
            {
              type: "cta_missing",
              severity: "high",
              message: "No explicit Call-To-Action (e.g., 'Shop Now', 'Visit Nike.com') was detected visually or in audio, despite 'cta_present' being a required element in the brand kit.",
              first_appearance_timestamp: null,
              threshold: null,
              confidence: 0.98,
              dimension: "BrandFit"
            },
            {
              type: "audio_missing",
              severity: "high",
              message: "A dedicated voiceover is missing from the ad, which is a required element ('audio_voiceover') according to the brand kit. Only background music with vocal samples is present.",
              first_appearance_timestamp: null,
              threshold: null,
              confidence: 0.95,
              dimension: "BrandFit"
            },
            {
              type: "text_duration_too_short",
              severity: "high",
              message: "The text 'NIKE' is visible for only 0.5 seconds (4.50s-5.00s), and 'JUST DO IT' for only 0.5 seconds (4.50s-5.00s). This is insufficient time for the average viewer to read and process.",
              detected_text: "NIKE / JUST DO IT",
              appearance_timestamp: 4.5,
              duration_seconds: 0.5,
              threshold: 1.5,
              confidence: 0.98,
              dimension: "VisualQuality"
            },
            {
              type: "pacing_too_fast",
              severity: "high",
              message: "The video's average scene duration is approximately 1.0 second (5 scenes over 5 seconds). This is too fast for optimal message absorption.",
              average_scene_duration: 1,
              threshold: 1.5,
              confidence: 0.95,
              dimension: "VisualQuality"
            },
            {
              type: "tagline_too_brief",
              severity: "medium",
              message: "The tagline 'JUST DO IT' is visible for only 1.0 second (from 0:03.7 to 0:04.7), which is below the recommended minimum of 2 seconds.",
              detected_text: "JUST DO IT",
              appearance_timestamp: 3.7,
              duration_seconds: 1,
              confidence: 0.97,
              dimension: "BrandFit"
            },
            {
              type: "text_duration_too_short",
              severity: "medium",
              message: "On-screen text elements 'RUN' and 'FASTER' are displayed for only 1.0 second each, making them too brief for easy reading.",
              detected_text: ["RUN", "FASTER"],
              appearance_timestamp: [0, 2],
              duration_seconds: [1, 1],
              confidence: 0.96,
              dimension: "BrandFit"
            },
            {
              type: "tagline_not_spoken",
              severity: "medium",
              message: "The brand's primary tagline 'Just Do It' appears visually on screen but is not spoken in the audio.",
              timestamp_start: "00:04.2",
              timestamp_end: "00:05.0",
              detected_value: "not spoken",
              expected_value: "Just Do It",
              confidence: 0.95,
              dimension: "Audio"
            },
            {
              type: "lack_of_diversity",
              severity: "medium",
              message: "Based on AI-generated sports content, there's a risk of insufficient representation of various demographic groups throughout the video.",
              timestamps: [0, 15],
              confidence: 0.75,
              dimension: "Safety"
            },
            {
              type: "script_mismatch",
              severity: "low",
              message: "The song lyrics are generic pop and do not directly align with Nike's core brand voice as effectively as a dedicated voiceover could.",
              timestamp_start: "00:00.0",
              timestamp_end: "00:05.0",
              detected_value: "Generic pop lyrics",
              expected_value: "Athletic/empowering themes",
              confidence: 0.75,
              dimension: "Audio"
            }
          ],
          blockers: [
            {
              type: "lack_of_diversity",
              severity: "medium",
              message: "Insufficient representation of various demographic groups (gender, ethnicity, age, body type) throughout the video. This contrasts with Nike's stated values of inclusivity.",
              timestamps: [0, 15],
              confidence: 0.75,
              dimension: "Safety"
            },
            {
              type: "flashing_lights",
              severity: "medium",
              message: "The fast-paced nature combined with dynamic transitions carries a risk of exceeding the safe threshold of 2-3 flashes per second.",
              timestamps: [0, 15],
              flash_rate: "potential 2.5-3.0 flashes/sec",
              threshold: 3,
              confidence: 0.7,
              dimension: "Safety"
            }
          ],
          warnings: [
            {
              type: "audio_balance",
              severity: "low",
              message: "Background music peaks at -8dB while voiceover averages -10dB. Consider increasing voiceover prominence.",
              dimension: "Audio",
              confidence: 0.89
            }
          ],
          evidence: [
            {
              observation: "Background music is energetic electronic pop with a driving beat, estimated tempo ~135 BPM.",
              source: "audio_analysis",
              confidence: 0.9,
              dimension: "Audio"
            },
            {
              observation: "Female vocal performance is energetic and confident, matching the upbeat music.",
              source: "speech_analysis",
              confidence: 0.88,
              dimension: "Audio"
            },
            {
              observation: "Object detection tracked 'running shoe' objects appearing from 0.0s and remaining visible throughout 100% of the video. Shoes are prominent, occupying 30-50% of frame area.",
              source: "video_object_tracking",
              timestamps: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5],
              confidence: 0.98,
              dimension: "BrandFit"
            },
            {
              observation: "OCR detected the Nike swoosh logo on the shoes from 0:00.0 to 0:04.7. The text 'NIKE' also appears prominently from 0:03.0 to 0:04.7.",
              source: "logo_detection_temporal",
              confidence: 0.96,
              dimension: "BrandFit"
            },
            {
              observation: "Nike running shoes are visible from 0.00s to 5.00s (100% of video duration), appearing prominently in the lower frame (estimated 25-35% of frame area).",
              source: "video_object_tracking",
              timestamps: [0, 1.5, 2.5, 3.5, 4.5],
              confidence: 0.99,
              dimension: "VisualQuality"
            },
            {
              observation: "SafeSearch analysis: adult=VERY_UNLIKELY, violence=VERY_UNLIKELY, racy=VERY_UNLIKELY. No direct content safety issues detected.",
              source: "google_safesearch_temporal_simulated",
              frames_analyzed: 30,
              confidence: 0.95,
              dimension: "Safety"
            },
            {
              observation: "Audio transcription: 'Experience the power of movement. Just Do It.' Perspective API: TOXICITY=0.03, IDENTITY_ATTACK=0.01. Audio content is entirely positive and motivational.",
              source: "perspective_api_audio",
              confidence: 0.98,
              dimension: "Safety"
            },
            {
              observation: "Scene detection identified cuts at approximately 0:01, 0:03, 0:04, 0:05, resulting in 5-6 distinct scenes over 6 seconds with average duration of 1.0-1.2 seconds.",
              source: "scene_detection",
              confidence: 0.93,
              dimension: "Clarity"
            }
          ],
          recommendations: [
            {
              priority: "high",
              action: "Add a clear Call-To-Action (e.g., 'Shop Now', 'Visit Nike.com') in the final 2-3 seconds, ensuring it remains visible until the end of the video.",
              expected_impact: "+0.25 Clarity score",
              dimension: "VisualQuality"
            },
            {
              priority: "high",
              action: "Integrate a concise voiceover (2-3 seconds) to convey key product benefits or brand messaging, as 'audio_voiceover' is a required element in the brand kit.",
              expected_impact: "+0.10 Clarity score",
              dimension: "BrandFit"
            },
            {
              priority: "medium",
              action: "Add a clear voiceover of the 'Just Do It' tagline when it appears on screen to reinforce brand messaging.",
              expected_impact: "+0.08 Audio score",
              dimension: "Audio"
            },
            {
              priority: "medium",
              action: "Increase the duration of on-screen text to at least 2 seconds for the tagline and 1.5 seconds for other text elements.",
              expected_impact: "+0.15 VisualQuality score",
              dimension: "VisualQuality"
            },
            {
              priority: "low",
              action: "Consider slowing down the pacing slightly by increasing average scene duration to 1.5-2 seconds for better message absorption.",
              expected_impact: "+0.05 Clarity score",
              dimension: "Clarity"
            }
          ],
          metadata: {
            brand_id: brandId,
            brand_name: brandName || "Nike",
            total_processing_time_ms: 34700,
            critical_violations: 2,
            agents_processed: 5,
            agents_failed: 0
          }
        };
        
        setEvaluationResult(mockResult);
        setCurrentStep("results");
      }, 500);
    }, 2000);
  };

  const handleLoadMockDataImage = () => {
    setAssetType("image");
    setCurrentStep("loading");
    setLoadingProgress(0);

    // Simular carga progresiva
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    // Cargar datos mock de imagen después de 2 segundos
    setTimeout(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setTimeout(() => {
        const mockResult = {
          evaluation_id: "eval_20231027100000",
          timestamp: "2023-10-27T10:00:00Z",
          scores: {
            BrandFit: 0.69,
            VisualQuality: 0.45,
            Clarity: 0.63,
            Safety: 0.8,
            OverallScore: 0.65
          },
          violations: [
            {
              dimension: "VisualQuality",
              type: "product_missing",
              severity: "high",
              message: "The advertised product (running shoes for spring collection) is not visible in the image. A basketball is shown instead.",
              expected_product_category: "running shoes",
              detected_product_category: "basketball",
              confidence: 0.95
            },
            {
              dimension: "VisualQuality",
              type: "cta_missing",
              severity: "high",
              message: "No clear call-to-action detected, which is a required element according to the brand kit.",
              confidence: 0.9
            },
            {
              dimension: "VisualQuality",
              type: "message_contradictory",
              severity: "high",
              message: "The image promotes basketball, which contradicts the campaign brief to 'Promote new Air Max running shoes'.",
              detected_theme: "basketball",
              expected_theme: "running shoes",
              confidence: 0.92
            },
            {
              dimension: "Clarity",
              type: "cta_missing",
              severity: "high",
              message: "No clear call-to-action detected. The ad provides no explicit next step for the viewer.",
              confidence: 0.9
            },
            {
              dimension: "BrandFit",
              type: "cta_missing",
              severity: "medium",
              message: "No clear call-to-action detected to guide viewer's next step.",
              confidence: 0.95
            },
            {
              dimension: "Clarity",
              type: "product_not_prominent",
              severity: "medium",
              message: "The primary product (basketball) is visible but occupies a small portion of the frame (~8-10%) and is not the dominant focal point for a product advertisement.",
              detected_area: 0.09,
              threshold: 0.15,
              confidence: 0.85
            },
            {
              dimension: "Safety",
              type: "gender_stereotype",
              severity: "low",
              message: "Only male athletes are depicted; consider more diverse gender representation in future ads to align with inclusivity values.",
              confidence: 0.7
            }
          ],
          blockers: [],
          warnings: [],
          evidence: [
            {
              dimension: "BrandFit",
              observation: "Object detection identified a basketball as a product. It occupies approximately 15% of the frame, held by the model.",
              source: "object_detection",
              confidence: 0.9
            },
            {
              dimension: "BrandFit",
              observation: "OCR detected the text 'JUST DO IT' prominently displayed across the lower half of the image. This exact phrase matches an approved tagline.",
              source: "google_vision_ocr",
              confidence: 0.98
            },
            {
              dimension: "BrandFit",
              observation: "No text resembling a Call-To-Action (e.g., 'Shop Now', 'Learn More') was detected.",
              source: "ocr_analysis",
              confidence: 0.95
            },
            {
              dimension: "BrandFit",
              observation: "The text 'JUST DO IT' is very large, in stark contrast against the concrete background, ensuring excellent legibility.",
              source: "text_analysis",
              confidence: 0.98
            },
            {
              dimension: "BrandFit",
              observation: "The Nike swoosh logo is clearly visible in the top right corner.",
              source: "logo_detection",
              confidence: 0.97
            },
            {
              dimension: "VisualQuality",
              observation: "Object detection identified a basketball as the primary sports product, not running shoes.",
              source: "object_detection",
              confidence: 0.95
            },
            {
              dimension: "VisualQuality",
              observation: "OCR detected the tagline 'JUST DO IT' prominently displayed, matching an approved tagline.",
              source: "google_vision_ocr",
              confidence: 0.98
            },
            {
              dimension: "VisualQuality",
              observation: "No text or button serving as an explicit call-to-action (e.g., 'Shop Now', 'Learn More') was found.",
              source: "ocr_analysis",
              confidence: 0.9
            },
            {
              dimension: "VisualQuality",
              observation: "The main text 'JUST DO IT' is large, clear, and has high contrast against the concrete background.",
              source: "contrast_analysis",
              confidence: 0.97
            },
            {
              dimension: "VisualQuality",
              observation: "The Nike swoosh logo is clearly visible and prominent in the top right.",
              source: "logo_detection",
              confidence: 0.96
            },
            {
              dimension: "VisualQuality",
              observation: "The ad's visual content is centered around a basketball player and a basketball, not running activities or footwear.",
              source: "image_content_analysis",
              confidence: 0.92
            },
            {
              dimension: "Clarity",
              observation: "OCR detected large, prominent text: 'JUST DO IT' across the bottom half of the image.",
              source: "google_vision_ocr",
              confidence: 0.98
            },
            {
              dimension: "Clarity",
              observation: "OCR detected small text on the basketball, including 'NIKE' logo and 'COURTS'.",
              source: "google_vision_ocr",
              confidence: 0.88
            },
            {
              dimension: "Clarity",
              observation: "Object detection identified a basketball held by the athlete, estimated to occupy approximately 9% of the total frame area.",
              source: "google_vision_object_detection",
              confidence: 0.85
            },
            {
              dimension: "Clarity",
              observation: "No explicit call-to-action phrases (e.g., 'Shop Now', 'Learn More') or interactive buttons were detected.",
              source: "ocr_analysis",
              confidence: 0.9
            },
            {
              dimension: "Clarity",
              observation: "Nike swoosh logo prominently displayed in the top right corner.",
              source: "logo_detection",
              confidence: 0.95
            },
            {
              dimension: "Clarity",
              observation: "The text 'JUST DO IT' has excellent contrast against the concrete background (black text on light grey).",
              source: "contrast_analysis",
              confidence: 0.97
            },
            {
              dimension: "Safety",
              observation: "Google SafeSearch: adult=VERY_UNLIKELY, violence=VERY_UNLIKELY, racy=VERY_UNLIKELY, medical=VERY_UNLIKELY",
              source: "google_safesearch",
              confidence: 0.98
            },
            {
              dimension: "Safety",
              observation: "Detected text: 'JUST DO IT'. Perspective API (simulated): TOXICITY=0.01, IDENTITY_ATTACK=0.01, THREAT=0.01, INSULT=0.01, SEVERE_TOXICITY=0.01.",
              source: "perspective_api",
              confidence: 0.95
            },
            {
              dimension: "Safety",
              observation: "No forbidden claims detected in text 'JUST DO IT' against policy 'lose 20kg in 1 week'.",
              source: "claim_validator",
              confidence: 0.92
            },
            {
              dimension: "Safety",
              observation: "Image features one male athlete, no female athletes are visible.",
              source: "diversity_analysis",
              confidence: 0.85
            },
            {
              dimension: "Safety",
              observation: "No cultural insensitivity or inappropriate content for a general audience detected.",
              source: "ethics_evaluator",
              confidence: 0.9
            }
          ],
          recommendations: [
            {
              dimension: "BrandFit",
              action: "Add a clear and strong Call-To-Action (e.g., 'Shop Basketball Gear' or 'Find Your Courts') to guide user engagement.",
              expected_impact: "+0.15 Clarity score"
            },
            {
              dimension: "VisualQuality",
              action: "Replace the image with one prominently featuring 'new Air Max running shoes' to align with the campaign brief and brand kit product category.",
              expected_impact: "+0.18 Clarity score (Product Visibility) and +0.06 Clarity score (Message Coherence)"
            },
            {
              dimension: "VisualQuality",
              action: "Add a clear and strong Call-To-Action (e.g., 'Shop Air Max Now') visually distinct, perhaps in a button format, to guide the audience.",
              expected_impact: "+0.25 Clarity score (CTA Strength)"
            },
            {
              dimension: "VisualQuality",
              action: "Ensure all campaign elements (visuals, text, CTA) consistently promote the 'Air Max running shoes' to create a unified and coherent message.",
              expected_impact: "+0.04 Clarity score (Message Coherence)"
            },
            {
              dimension: "Clarity",
              action: "Add a clear and prominent call-to-action (e.g., 'Shop Now', 'Explore Basketball Gear') to guide the viewer on the desired next step.",
              expected_impact: "+0.15 Clarity score"
            }
          ],
          metadata: {
            brand_id: brandId,
            brand_name: brandName || "Nike",
            total_processing_time_ms: 10450,
            critical_violations: 0
          }
        };
        
        setEvaluationResult(mockResult);
        setCurrentStep("results");
      }, 500);
    }, 2000);
  };

  // Renderizar según el paso actual
  if (currentStep === "loading") {
    return <LoadingScreen loadingProgress={loadingProgress} />;
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
            Volver
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-white">Evaluar Asset</h1>
          <p className="mt-2 text-neutral-400">
            Marca: {brandLoading ? "Cargando..." : (brandName ?? brandId)} — Regla: {ruleShort}
          </p>
          {/* Botones de desarrollo para cargar datos mock */}
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={handleLoadMockDataVideo}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Ver Demo Video
            </button>
            <button
              onClick={handleLoadMockDataImage}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Ver Demo Imagen
            </button>
          </div>
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

