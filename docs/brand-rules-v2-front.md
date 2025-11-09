# Brand Rules V2 - Guía para Front

## Secciones sugeridas de UI

- Voz (voice)
  - Sliders de rango 1–5 para: formality, warmth, energy, humor, confidence.
  - Chips para allowedWords / bannedWords y CTA whitelist.
  - Textarea para bannedPatterns (regex) con previsualización de matches.
  - Readability: select (targetGrade), input numérico (maxExclamations), toggle (allowEmojis).
  - Overrides por canal: selector de canal + mismo formulario pero parcial.

- Logo y fondos
  - minSizePx (width/height), minClearSpaceX.
  - aspectRatioLock (toggle), placementGrid (chips con 5 posiciones).
  - Background: minContrastRatio, invertThresholdLuminance, maxBackgroundComplexity, blurOverlayRequiredAboveComplexity.

- Claims/Compliance
  - bannedPatterns (regex), requiredSubstantiation (tipo + lista de patrones).
  - Disclaimers: template + multi-select de regiones/canales.

- Sensibles (policies)
  - Tabla por categoría: allowed (allowed/conditional/disallowed), minAudienceAge, regiones, canales, requiresLegalReview.

- Accesibilidad y Plataforma
  - WCAG (contraste, tamaño tipografía, captions/alt).
  - Reglas por plataforma (meta/google/youtube).

## Validación

- Reutilizar esquema mediante tipos para el front:
  - Importar `BrandRulesInput` desde `@/types` (re-export del backend).
  - Validar en el cliente con los mismos límites (1..5, 0..1, etc.).

## Persistencia

- Endpoints existentes: `POST/PUT /api/brands/{id}/rules` (payload V2).
  - Soporta `application/json` y `application/x-yaml`.

## UX Tips

- Mostrar ejemplos “Do/Don’t” dentro de Voice (ayuda contextual).
- Para regex, ofrecer presets comunes (superlativos, claims absolutos).
- En Background, mostrar medidor de contraste y complejidad (si hay preview de creatividades).


