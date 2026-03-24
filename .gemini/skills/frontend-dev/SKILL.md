---
name: frontend-dev
description: "Skill completa de desarrollo frontend general. Úsala cuando el usuario pida: estructura de proyecto, organización de carpetas, componentes UI, estilos CSS, accesibilidad, rendimiento, convenciones de nombres, patrones de arquitectura (FSD), estrategia de testing, manejo de estado, diseño responsive o cualquier buena práctica de frontend moderno (React, Vue, Svelte, Vanilla JS)."
user-invocable: true
argument-hint: "[tarea frontend: estructura, componente, estilo, test, accesibilidad, rendimiento, etc.]"
---

## Objetivo

Actuar como arquitecto y desarrollador frontend senior. Aplicar las mejores
prácticas de 2025 en: estructura de directorios, arquitectura de componentes,
estilos, accesibilidad, rendimiento, testing y convenciones de código.
El stack base asumido es React + TypeScript + Tailwind CSS + Vite, pero los
principios aplican a cualquier framework moderno.

---

## 1. Estructura de directorios

### Proyecto pequeño / mediano (hasta ~15 features)


mi-proyecto/
├── public/ → archivos estáticos públicos (favicon, robots.txt, og-image)
├── src/
│ ├── app/ → configuración global: router, providers, store, estilos globales
│ │ ├── App.tsx
│ │ ├── router.tsx
│ │ ├── providers.tsx
│ │ └── index.css
│ │
│ ├── pages/ → vistas completas mapeadas a rutas
│ │ ├── Home/
│ │ │ ├── HomePage.tsx
│ │ │ └── index.ts
│ │ └── NotFound/
│ │ └── NotFoundPage.tsx
│ │
│ ├── components/ → componentes reutilizables globales (no ligados a una feature)
│ │ ├── ui/ → átomos y moléculas de UI pura (Button, Input, Modal, Card)
│ │ │ ├── Button/
│ │ │ │ ├── Button.tsx
│ │ │ │ ├── Button.test.tsx
│ │ │ │ └── index.ts
│ │ │ ├── Input/
│ │ │ ├── Modal/
│ │ │ └── Card/
│ │ └── layout/ → estructuras de página (Header, Footer, Sidebar, MainLayout)
│ │ ├── Header/
│ │ ├── Footer/
│ │ └── MainLayout/
│ │
│ ├── features/ → módulos por dominio de negocio (cada uno autocontenido)
│ │ ├── auth/
│ │ │ ├── components/ → componentes exclusivos de esta feature (LoginForm, etc.)
│ │ │ ├── hooks/ → hooks exclusivos (useAuth, useLogin)
│ │ │ ├── services/ → llamadas a API de esta feature (authApi.ts)
│ │ │ ├── store/ → estado local de la feature (authSlice.ts o authStore.ts)
│ │ │ ├── types/ → tipos TypeScript de la feature
│ │ │ └── index.ts → public API: solo exporta lo que otras features pueden usar
│ │ │
│ │ ├── dashboard/
│ │ ├── products/
│ │ └── orders/
│ │
│ ├── hooks/ → custom hooks globales reutilizables entre features
│ │ ├── useDebounce.ts
│ │ ├── useLocalStorage.ts
│ │ ├── useMediaQuery.ts
│ │ └── useFetch.ts
│ │
│ ├── services/ → lógica de comunicación con APIs externas
│ │ ├── api/
│ │ │ ├── client.ts → instancia base de axios/fetch con interceptors
│ │ │ ├── endpoints.ts → constantes de rutas de la API
│ │ │ └── index.ts
│ │ └── storage/
│ │ └── localStorage.ts
│ │
│ ├── store/ → estado global de la app (Zustand / Redux Toolkit)
│ │ ├── index.ts
│ │ └── slices/
│ │
│ ├── types/ → tipos e interfaces TypeScript globales
│ │ ├── api.types.ts
│ │ ├── common.types.ts
│ │ └── index.ts
│ │
│ ├── utils/ → funciones puras de utilidad (sin efectos secundarios)
│ │ ├── formatDate.ts
│ │ ├── formatCurrency.ts
│ │ ├── validators.ts
│ │ └── cn.ts → util para combinar clases Tailwind (clsx + tailwind-merge)
│ │
│ ├── constants/ → valores constantes de la app (rutas, enums, configs)
│ │ ├── routes.ts
│ │ ├── enums.ts
│ │ └── config.ts
│ │
│ └── assets/ → recursos estáticos importados por JS
│ ├── images/
│ ├── icons/
│ └── fonts/
│
├── tests/ → tests E2E y de integración global
│ ├── e2e/
│ └── integration/
│
├── .env → variables de entorno (nunca commitear datos sensibles)
├── .env.example → plantilla pública de variables requeridas
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── package.json


### Proyecto grande / escala (Feature-Sliced Design - FSD)

Para apps grandes con múltiples equipos, usa FSD. La regla clave:
**cada capa solo puede importar de capas inferiores, nunca superiores.**

src/
├── app/ → (capa 1) config global, providers, router, estilos base
├── pages/ → (capa 2) vistas completas, componen widgets
├── widgets/ → (capa 3) bloques complejos de UI (Header con lógica, Sidebar, Feed)
├── features/ → (capa 4) acciones del usuario (AddToCart, LoginForm, SearchBar)
├── entities/ → (capa 5) modelos de negocio (User, Product, Order) con su UI básica
└── shared/ → (capa 6) código sin lógica de negocio: ui/, hooks/, utils/, types/, api/


**Regla de dependencias FSD:**
`app` → `pages` → `widgets` → `features` → `entities` → `shared`
(solo hacia abajo, nunca hacia arriba ni horizontal entre slices del mismo nivel)

---

## 2. Convenciones de nombres

### Archivos y carpetas

| Tipo                        | Convención          | Ejemplo                         |
|-----------------------------|---------------------|---------------------------------|
| Componente React            | PascalCase          | `UserCard.tsx`                  |
| Custom Hook                 | camelCase + `use`   | `useAuthStore.ts`               |
| Servicio / API              | camelCase + Service | `authService.ts`                |
| Utilidad pura               | camelCase           | `formatDate.ts`                 |
| Tipos / Interfaces          | PascalCase + `.types` | `user.types.ts`               |
| Constante global            | UPPER_SNAKE_CASE    | `API_BASE_URL`                  |
| Carpeta de componente       | PascalCase          | `Button/`                       |
| Carpeta de feature          | kebab-case          | `user-profile/`                 |
| Archivo de test             | mismo nombre + `.test` | `Button.test.tsx`           |

### Componentes y props

- Componentes en **PascalCase**: `<ProductCard />`, nunca `<productCard />`.
- Props descriptivos: `isLoading`, `hasError`, `onSubmit`, `onClick`.
- Booleanos con prefijo `is`, `has`, `can`, `should`: `isOpen`, `hasChildren`.
- Handlers con prefijo `on` o `handle`: `onClose`, `handleSubmit`.
- Evita props genéricos como `data`, `info`, `stuff`; sé específico.

---

## 3. Arquitectura de componentes

### Reglas base

- **Single Responsibility**: un componente = una razón para cambiar.
- **Máximo ~150 líneas** por componente; si crece, divide.
- Separa **presentación** (UI pura, sin lógica de negocio) de **contenedores** (lógica + estado).
- Usa **Custom Hooks** para extraer lógica fuera del JSX.
- Aplica **Compound Components** para UI compleja (Tabs, Accordion, Select custom).

### Anatomía de un componente bien estructurado

```tsx
// 1. Imports externos
import { useState, useCallback } from 'react'

// 2. Imports internos (tipos, hooks, utils, componentes)
import type { Product } from '@/types/product.types'
import { useCart } from '@/features/cart/hooks/useCart'
import { formatCurrency } from '@/utils/formatCurrency'
import { Button } from '@/components/ui/Button'

// 3. Tipos e interfaces del componente
interface ProductCardProps {
  product: Product
  onAddToCart?: (id: string) => void
}

// 4. Componente (función nombrada, no arrow function en export)
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // 4a. Estado local
  const [isAdding, setIsAdding] = useState(false)

  // 4b. Hooks
  const { addItem } = useCart()

  // 4c. Handlers
  const handleAdd = useCallback(async () => {
    setIsAdding(true)
    await addItem(product.id)
    setIsAdding(false)
    onAddToCart?.(product.id)
  }, [product.id, addItem, onAddToCart])

  // 4d. JSX
  return (
    <article className="rounded-xl border p-4 shadow-sm">
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        width={300}
        height={200}
        className="w-full rounded-lg object-cover"
      />
      <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-600">{formatCurrency(product.price)}</p>
      <Button
        onClick={handleAdd}
        isLoading={isAdding}
        aria-label={`Agregar ${product.name} al carrito`}
      >
        Agregar al carrito
      </Button>
    </article>
  )
}


4. Estilos y diseño
Stack de estilos recomendado (2025)
Tailwind CSS (primera opción): utility-first, sin runtime, excelente DX.

CSS Modules (Component.module.css): cuando Tailwind no aplica o el equipo lo prefiere.

Evitar: CSS-in-JS con runtime (styled-components, Emotion) salvo que ya esté en el proyecto.

Responsive: mobile-first siempre

// BIEN: mobile-first con Tailwind
<div className="flex flex-col gap-4 md:flex-row md:gap-8 lg:gap-12">

// MAL: desktop primero forzando overrides en mobile
<div className="flex flex-row lg:flex-col">


Breakpoints estándar Tailwind:

sm: → 640px | md: → 768px | lg: → 1024px | xl: → 1280px | 2xl: → 1536px

Tokens de diseño y consistencia
Define colores, tipografía y espaciado en tailwind.config.ts como tokens propios.

Usa la utilidad cn() (clsx + tailwind-merge) para combinar clases condicionalmente:

// utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


Animaciones
Usa transition y transform CSS (no re-layoutean, son más rápidas).

Para animaciones complejas: Framer Motion en React.

Respeta prefers-reduced-motion:

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}


5. Accesibilidad (a11y)
Obligatorio en todo componente
HTML semántico siempre: <button>, <nav>, <main>, <header>, <article>, <section>, <form>.

NUNCA uses <div> como botón sin role="button" + tabIndex={0} + onKeyDown.

Todo <img> con alt descriptivo; si es decorativa: alt="".

Todo <input> con abel> asociado (no solo placeholder).

Contraste mínimo WCAG AA: 4.5:1 texto normal, 3:1 texto grande.

Toda la UI navegable con teclado (Tab, Enter, Escape, flechas).

En modales: atrapa el foco y cierra con Escape (usa focus-trap-react).

Usa aria-label, aria-expanded, aria-describedby solo donde HTML semántico no alcance.

Marca errores de formulario con aria-invalid="true" + aria-describedby apuntando al mensaje.

Herramientas de auditoría
eslint-plugin-jsx-a11y en el linter (detecta errores en desarrollo).

Lighthouse en Chrome DevTools (auditoría automatizada).

axe DevTools (extensión para análisis profundo).

6. Rendimiento
Carga inicial
Code splitting por rutas con React.lazy() + <Suspense>:

const Dashboard = React.lazy(() => import('@/pages/Dashboard/DashboardPage'))


Usa loading="lazy" en imágenes off-screen.

Formatos de imagen: WebP o AVIF (30-50% más ligeros).

Siempre define width y height en imágenes (previene CLS).

Skeleton loaders del mismo tamaño que el contenido real.

Re-renders
React.memo solo cuando haya evidencia de re-renders costosos (mide primero).

useCallback y useMemo con criterio; no los pongas en todos lados.

Para listas largas (+200 items): virtualización con @tanstack/virtual.

Evita crear objetos/funciones inline en JSX en cada render.

Estado
Necesidad	Solución recomendada
Necesidad	Solución recomendada
Estado local de componente	useState / useReducer
Estado compartido pequeño	Context API + useReducer
Estado global complejo	Zustand (ligero) o Redux Toolkit
Estado del servidor / caché	TanStack Query (React Query)
URL como estado	useSearchParams (React Router)
7. Manejo de datos asíncronos
Usa TanStack Query para fetching: caché, revalidación, loading/error automáticos.

Todo componente que haga fetch debe manejar 3 estados: loading, error, éxito.

Siempre diseña el estado vacío (cuando no hay datos que mostrar).

Centraliza la instancia HTTP en services/api/client.ts con interceptors para auth y errores.

// Patrón completo: loading + error + vacío + datos
function ProductList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  if (isLoading) return <ProductListSkeleton />
  if (isError) return <ErrorMessage message="No se pudieron cargar los productos." />
  if (!data?.length) return <EmptyState message="No hay productos disponibles." />

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((product) => (
        >
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}

8. Estrategia de testing
Pirámide de tests

        [E2E]          → Playwright o Cypress (flujos críticos: login, checkout)
      [Integración]    → Testing Library (componentes + hooks + contexto)
    [Unitarios]        → Vitest (utils, hooks puros, lógica de negocio)


Reglas
Tests unitarios: para utils/, hooks/ puros y lógica sin UI.

Tests de integración: componentes con sus dependencias reales (sin mocks innecesarios).

Tests E2E: solo flujos críticos de usuario (login, registro, compra).

Nombra tests describiendo el comportamiento: "muestra error cuando el email es inválido".

Cada componente en components/ui/ debe tener su .test.tsx junto al archivo.

Usa data-testid solo como último recurso; prefiere roles y labels accesibles.

9. Calidad de código y convenciones
Herramientas obligatorias
ESLint con reglas: eslint-plugin-react, eslint-plugin-jsx-a11y, @typescript-eslint.

Prettier para formato consistente (configura formatOnSave en VS Code).

TypeScript en modo estricto ("strict": true en tsconfig.json).

Husky + lint-staged: ejecuta ESLint y Prettier antes de cada commit.

Variables de entorno
Nunca hardcodees URLs, tokens ni claves en el código fuente.

Usa .env (no commitear) y .env.example (sí commitear, sin valores reales).

En Vite: prefijo VITE_ para variables accesibles en el cliente.

Imports: usa alias siempre

// BIEN: alias configurado en vite.config.ts y tsconfig.json
import { Button } from '@/components/ui/Button'

// MAL: rutas relativas largas y frágiles
import { Button } from '../../../../components/ui/Button'


Configura @ apuntando a src/ tanto en vite.config.ts como en tsconfig.json.

10. Checklist de entrega para cada componente o feature
 ¿Sigue la estructura de carpetas del proyecto?

 ¿El componente tiene una sola responsabilidad?

 ¿Es responsive (mobile-first)?

 ¿Usa HTML semántico y es accesible con teclado?

 ¿Todas las imágenes tienen alt y dimensiones definidas?

 ¿Todos los inputs tienen abel> asociado?

 ¿Maneja estados: loading, error y vacío?

 ¿Los estilos usan Tailwind o CSS Modules?

 ¿Tiene al menos un test básico?

 ¿Las variables de entorno están en .env y no hardcodeadas?

 ¿Los imports usan alias @/ en lugar de rutas relativas largas?

Recursos de referencia
React docs: https://react.dev

Feature-Sliced Design: https://feature-sliced.design

TanStack Query: https://tanstack.com/query

Tailwind CSS: https://tailwindcss.com/docs

WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/

Vitest: https://vitest.dev

Playwright: https://playwright.dev