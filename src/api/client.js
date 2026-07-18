// ─────────────────────────────────────────────────────────────────────────────
// CAPA 1: EL CLIENTE HTTP CENTRAL
// Único archivo del proyecto donde se llama a fetch(). Todo pasa por aquí:
// URL base, headers, chequeo de errores y lectura del `detail` de FastAPI.
// Si mañana agregas autenticación (un token en los headers), lo tocas SOLO aquí.
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL

// Los PDFs no pasan por `request()`: no son JSON, el navegador los descarga
// o los abre directo. Los servicios que exponen un PDF arman la URL con esto.
export function buildUrl(path) {
  return `${API_URL}${path}`
}

// Error propio para distinguir "falló la API" de cualquier otro error de JS.
// Lleva el status HTTP para que quien lo capture pueda decidir según el código
// (ej: un 404 se muestra distinto a un 400 de stock insuficiente).
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// FastAPI responde errores como { "detail": ... } donde detail puede ser:
//  - un string ("Stock insuficiente")            → errores de negocio (400, 404)
//  - un array de objetos                          → errores de validación (422)
// Esta función normaliza ambos a un string legible.
function extraerDetail(body, status) {
  if (typeof body?.detail === 'string') return body.detail
  if (Array.isArray(body?.detail)) {
    return body.detail
      .map((e) => `${e.loc?.slice(1).join('.') ?? 'campo'}: ${e.msg}`)
      .join(' | ')
  }
  return `Error HTTP ${status}`
}

async function request(path, { body, ...options } = {}) {
  const config = { ...options }

  // El header Content-Type solo se manda cuando hay body. Detalle fino:
  // un GET sin headers "raros" es una petición "simple" y el navegador
  // se ahorra el preflight OPTIONS (lo viste en la Fase 0).
  if (body !== undefined) {
    config.body = JSON.stringify(body)
    config.headers = { 'Content-Type': 'application/json', ...options.headers }
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, config)
  } catch {
    // fetch solo rechaza cuando NO hubo respuesta: servidor caído o CORS.
    throw new ApiError('No se pudo conectar con el servidor. ¿Está corriendo el backend?', 0)
  }

  if (!res.ok) {
    let bodyError = null
    try {
      bodyError = await res.json()
    } catch {
      // el body no era JSON (ej: un 500 con HTML) — seguimos con el mensaje genérico
    }
    throw new ApiError(extraerDetail(bodyError, res.status), res.status)
  }

  // 204 No Content (típico de DELETE): no hay body que parsear.
  if (res.status === 204) return null
  return res.json()
}

// API pública del cliente: los servicios usan estos 4 métodos y nada más.
export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
