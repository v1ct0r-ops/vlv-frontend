# VLV — Frontend (Gestión de gas)

Interfaz web para la gestión de distribución de gas: productos, facturas de proveedores, rendiciones de choferes y movimientos de inventario. Consume una API REST construida con **FastAPI**.

## Stack

- **React 19** + **Vite 8** (con HMR)
- **React Router 7** para el ruteo
- **Tailwind CSS 4** + **shadcn/ui** (sobre `@base-ui/react`) para la UI
- **Recharts** para los gráficos de rendiciones
- **ESLint 10** para el linteo

## Módulos

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/productos` | Productos | Listado y edición de productos (precios en CLP) |
| `/facturas` | Facturas | Facturas de proveedores, con detalle y descarga de PDF |
| `/rendiciones` | Rendiciones | Rendiciones de choferes por periodo, con gráficos |
| `/movimientos` | Movimientos | Historial de movimientos de inventario |

El header incluye un **HealthCheck** que verifica en vivo la conexión con el backend.

## Requisitos previos

- **Node.js 18+** (recomendado 20 LTS)
- El **backend (FastAPI)** corriendo y accesible

## Configuración

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` en la raíz con la URL de tu backend:

   ```bash
   VITE_API_URL=http://localhost:8000
   ```

   > El `.env` está en `.gitignore` y **no se commitea** — cada entorno (local, staging, producción) define el suyo.

## Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | Levanta el servidor de desarrollo con HMR |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run preview` | Sirve localmente el build de producción |
| `npm run lint` | Corre ESLint sobre el proyecto |

## Estructura del proyecto

```
src/
├── api/          # Capa HTTP: client central (fetch) + un archivo por recurso
├── components/   # Componentes de dominio (HealthCheck, Pagination, ...)
│   └── ui/       # Componentes base de shadcn/ui
├── hooks/        # Hooks de datos (useProductos, useFacturas, ...)
├── lib/          # Utilidades (formateo CLP/fecha, helpers)
├── pages/        # Una página por módulo
├── assets/       # Imágenes y estáticos importados
├── App.jsx       # Layout + rutas
└── main.jsx      # Punto de entrada
```

**Capa de API:** todas las llamadas pasan por `src/api/client.js` (único lugar con `fetch()`). Ahí viven la URL base, los headers, el manejo de errores y la lectura del `detail` de FastAPI. Si más adelante se agrega autenticación, se toca solo ese archivo.

## Documentación

Documentación técnica adicional en [`docs/`](./docs):

- `API-V2-COMPLETA.md` — referencia de la API
- `FLUJO-REFERENCIA.md` — flujos de la aplicación
- `FASE-0.md` — notas de la fase inicial
- `MIGRACION-V3-SIN-CUENTA.md` — notas de migración
