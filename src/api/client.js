
//  EL CLIENTE HTTP CENTRAL
// Único archivo del proyecto donde se llama a fetch(). Todo pasa por aquí:
// URL base, headers, chequeo de errores y lectura del `detail` de FastAPI.
// Si mañana agregas autenticación (un token en los headers), lo tocas SOLO aquí.


const API_URL = import.meta.env.VITE_API_URL

// ─── SESIÓN / TOKEN ──────────────────────────────────────────────────────────
// Único lugar del proyecto que conoce el token. Se guarda en memoria (rápido)
// y se espeja en sessionStorage para sobrevivir un F5. Usamos sessionStorage y
// NO localStorage: muere al cerrar la pestaña y reduce la exposición a XSS
// (lo recomienda el contrato de la API).
const TOKEN_KEY = 'vlv_token'
let authToken = sessionStorage.getItem(TOKEN_KEY) || null

export function setToken(token) {
  authToken = token
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export function getToken() {
  return authToken
}

export function clearToken() {
  setToken(null)
}

// Cuando la API responde 401 (token ausente/expirado), este cliente NO sabe de
// React ni de rutas. Limpia el token y avisa por un evento global; el
// AuthContext lo escucha y decide redirigir a /login sin romper el SPA.
const SESION_EXPIRADA = 'vlv:sesion-expirada'
function notificarSesionExpirada() {
  window.dispatchEvent(new CustomEvent(SESION_EXPIRADA))
}
export function onSesionExpirada(handler) {
  window.addEventListener(SESION_EXPIRADA, handler)
  return () => window.removeEventListener(SESION_EXPIRADA, handler)
}

// Los servicios que exponen un PDF arman la URL con esto.
export function buildUrl(path) {
  return `${API_URL}${path}`
}

export async function download(path, filename) {
  const config = {}
  if (authToken) config.headers = { Authorization: `Bearer ${authToken}` }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, config)
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0)
  }

  if (!res.ok) {
    if (res.status === 401) { clearToken(); notificarSesionExpirada() }
    throw new ApiError(`Error ${res.status} al descargar`, res.status)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)   // URL temporal en memoria del navegador
  const a = document.createElement('a')
  a.href = url
  a.download = filename                   // fuerza descarga con este nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)                // libera la memoria del blob
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

  // Autenticación: si hay token, va en cada request protegido. El backend
  // resuelve la empresa desde el token (multi-tenant) — nunca mandamos empresa_id.
  if (authToken) {
    config.headers = { ...config.headers, Authorization: `Bearer ${authToken}` }
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
    // 401 = token ausente/inválido/expirado → cerramos sesión y avisamos al
    // árbol de React. OJO: el 403 (rol insuficiente / desactivado) NO desloguea;
    // se propaga como ApiError normal para mostrar "sin permisos".
    if (res.status === 401) {
      clearToken()
      notificarSesionExpirada()
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
