---
name: react-frontend-design
description: "Aplica buenas prácticas de diseño de interfaz y frontend con React. Úsala cuando el usuario pida crear componentes, layouts, diseño responsive, accesibilidad, optimización visual, patrones de componentes, CSS en React, UX/UI o estructura de carpetas para proyectos React modernos."
user-invocable: true
argument-hint: "[componente, página, layout o problema de UI/UX a resolver]"
---

## Objetivo

Actuar como experto en diseño de interfaces y frontend con React moderno (2025),
aplicando siempre buenas prácticas de: arquitectura de componentes, accesibilidad,
rendimiento visual, diseño responsive y patrones de UI reutilizables.
El stack base asumido es React + Tailwind CSS + JavaScript/TypeScript.

---

## Principios base (siempre aplicar)

1. **Single Responsibility**: cada componente hace UNA sola cosa.
2. **Composición sobre herencia**: construye UIs complejas combinando componentes pequeños.
3. **Mobile-first**: diseña primero para móvil, luego escala a pantallas mayores.
4. **Accesibilidad desde el inicio**: no es un extra, es parte del diseño.
5. **Rendimiento visual**: evita re-renders innecesarios y layout shifts.

---

## Instrucciones para el agente

### Arquitectura y estructura de componentes

- Divide siempre en: componentes de presentación (UI pura) y contenedores (lógica).
- Usa **Custom Hooks** para extraer lógica reutilizable fuera del JSX.
- Aplica el patrón **Compound Components** para UI compleja (Tabs, Modales, Selects).
- Nombra componentes en PascalCase y archivos igual que el componente (`Button.jsx`).
- Estructura de carpetas recomendada:


### Diseño responsive y estilos

- **Usa Tailwind CSS** (preferido en 2025): utility-first, sin runtime overhead.
- Si el proyecto no usa Tailwind, usa **CSS Modules** (`Component.module.css`).
- Evita CSS-in-JS con runtime (styled-components/Emotion) salvo que ya esté en el proyecto.
- Aplica **flexbox** para layouts lineales y **CSS grid** para layouts bidimensionales.
- Breakpoints estándar mobile-first con Tailwind: `sm:`, `md:`, `lg:`, `xl:`.
- Previene **layout shift (CLS)**: define siempre width/height en imágenes y skeletons.

### Accesibilidad (a11y)

- Usa **HTML semántico siempre**: `<button>`, `<nav>`, `<main>`, `<header>`, `<article>`, `<section>`.
- NUNCA uses `<div>` o `<span>` como botones sin agregar `role="button"` + `tabIndex` + `onKeyDown`.
- Agrega `alt` descriptivo en todas las imágenes; si es decorativa: `alt=""`.
- Usa `aria-label`, `aria-expanded`, `aria-hidden` solo cuando el HTML semántico no alcance.
- Asegura contraste mínimo **WCAG AA** (4.5:1 para texto normal, 3:1 para texto grande).
- Toda la UI debe ser navegable con **teclado** (Tab, Enter, Escape, flechas).
- En modales: atrapa el foco (`focus-trap-react`) y cierra con `Escape`.
- Agrega `abel>` asociado a cada `<input>` (nunca uses solo placeholder).

### Rendimiento visual

- Usa `React.lazy()` + `<Suspense>` para code splitting por rutas y componentes pesados.
- Aplica `loading="lazy"` en imágenes off-screen.
- Usa formatos modernos: **WebP o AVIF** (30-50% más ligeros que JPEG).
- Memoiza con `React.memo` solo cuando haya evidencia de re-renders costosos.
- Evita definir funciones u objetos dentro del JSX en cada render; extráelos o usa `useCallback`/`useMemo` con criterio.
- Para listas largas, usa virtualización (`react-window` o `@tanstack/virtual`).

### Patrones de componentes UI

- **Controlled components**: siempre en formularios (`value` + `onChange`).
- **Error Boundaries**: envuelve secciones críticas con `<ErrorBoundary>`.
- **Skeleton loaders**: muestra placeholders del mismo tamaño que el contenido final.
- **Empty states**: diseña siempre el estado vacío de listas/tablas (no solo el estado lleno).
- **Loading / Error / Success states**: todo componente que haga fetch debe manejar los 3 estados.

### UX y micro-interacciones

- Usa transiciones suaves con `transition` CSS (evita animaciones pesadas en JS).
- Prefiere `transform` y `opacity` para animaciones (no afectan el layout, más rápidas).
- Muestra feedback inmediato: deshabilita botones mientras se procesa, muestra spinners.
- No bloquees la UI principal durante operaciones asíncronas.
- Usa `debounce` en inputs de búsqueda/filtro (evita fetch en cada tecla).

---

## Checklist antes de entregar un componente

- [ ] ¿El componente tiene una sola responsabilidad?
- [ ] ¿Es responsive (mobile-first)?
- [ ] ¿Usa HTML semántico?
- [ ] ¿Tiene `alt` en imágenes y `label` en inputs?
- [ ] ¿Es navegable con teclado?
- [ ] ¿Maneja loading, error y estado vacío?
- [ ] ¿Los estilos usan Tailwind o CSS Modules (sin CSS inline largo)?
- [ ] ¿Evita re-renders innecesarios?

---

## Ejemplos de activación

**Input**: "Crea un componente Card para mostrar productos"
**Respuesta esperada**: Card responsive con imagen (WebP, loading lazy, alt), título, precio, botón accesible, skeleton loader, estados loading/error.

**Input**: "Diseña un formulario de login en React"
**Respuesta esperada**: Form controlado, labels asociados, validación, feedback de error accesible (aria-describedby), botón con estado loading.

**Input**: "Cómo estructuro mis carpetas en React"
**Respuesta esperada**: Estructura de carpetas con separación pages/components/hooks/layouts, con justificación por cada capa.

---

## Restricciones

- Nunca uses `<table>` para layouts visuales, solo para datos tabulares.
- No abuses de `useEffect`; si algo puede calcularse en render, no uses efecto.
- No uses `any` en TypeScript si el proyecto lo usa; tipea siempre los props.
- No entregues componentes sin manejar al menos el estado de error y loading.
- No añadas librerías externas sin justificar por qué son necesarias.

---

## Recursos de referencia

- Documentación oficial React: https://react.dev
- Guía WCAG accesibilidad: https://www.w3.org/WAI/WCAG21/quickref/
- Tailwind CSS: https://tailwindcss.com/docs
- React design patterns: https://www.patterns.dev
