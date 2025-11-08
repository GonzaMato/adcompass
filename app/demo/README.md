# Demo Page - Brand Selection

Esta es la página interactiva de demo donde los usuarios pueden seleccionar una marca antes de evaluar sus ads.

## Estructura

### Archivos creados:

1. **`app/demo/page.tsx`**: Página principal del demo con dos secciones:
   - **Selección de marca**: Muestra todas las marcas disponibles en un grid interactivo
   - **Evaluación** (placeholder): Sección preparada para la siguiente fase

2. **`app/types/brand.ts`**: Tipos TypeScript basados en el schema OpenAPI:
   - `Brand`: Tipo completo de marca
   - `Color`: Tipo para colores con roles y variantes
   - `Logo`: Tipo para logos con metadata

3. **`app/api/brands/route.ts`**: Endpoint real para obtener marcas
   - `GET /api/brands`: Retorna lista de marcas mock
   - `POST /api/brands`: Crear nueva marca

### Modificaciones:

1. **`app/components/Card.tsx`**: 
   - Agregado soporte para eventos HTML (onClick, etc.)
   - Extiende `React.HTMLAttributes<HTMLDivElement>`

2. **`app/page.tsx`**:
   - Agregado Link de Next.js
   - Botón "Try Live Demo" ahora redirige a `/demo`

## Características

### Página de Demo:

✅ **Carga de marcas**
- Fetch automático al cargar la página
- Estados de loading, error y empty
- Retry en caso de error

✅ **Selección visual**
- Grid responsive (1, 2 o 3 columnas según pantalla)
- Animaciones de entrada escalonadas con ScrollReveal
- Indicador visual de marca seleccionada
- Preview de logos y colores

✅ **Información de marca**
- Nombre y descripción
- Logo primario o inicial del nombre
- Preview de paleta de colores
- Cantidad de logos

✅ **Botón de continuar**
- Deshabilitado si no hay marca seleccionada
- Animación y feedback visual
- Transición a siguiente sección

### Datos Mock:

La API incluye 6 marcas de ejemplo:
1. **Belora** - Premium residencial costera
2. **TechFlow** - Tecnología de vanguardia
3. **EcoVerde** - Sostenibilidad ambiental
4. **UrbanStyle** - Moda urbana moderna
5. **CloudPeak** - Servicios en la nube
6. **FreshBite** - Comida saludable

## Próximos pasos

La sección de evaluación está preparada como placeholder. Cuando esté lista:

1. El estado `currentSection` cambia a `'evaluate'`
2. Se muestra la marca seleccionada en el header
3. Botón para volver a la selección
4. Espacio para la UI de evaluación de ads

## Uso

```bash
# Asegúrate de que el servidor esté corriendo
npm run dev

# Navega a:
http://localhost:3000/demo
```

O haz click en el botón "Try Live Demo" en la landing page.
