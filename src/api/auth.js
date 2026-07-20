// ─────────────────────────────────────────────────────────────────────────────
// CAPA 2: SERVICIO DE AUTENTICACIÓN
// Una función por endpoint. `/me` es un GET normal y va por el cliente central.
// `/token` es el único caso especial del proyecto: OAuth2 password flow, o sea
// application/x-www-form-urlencoded (NO json) y el email viaja en `username`.
// Por eso NO puede pasar por `request()` (ese fuerza JSON): usa fetch directo.
// ─────────────────────────────────────────────────────────────────────────────

import { api, buildUrl, ApiError } from './client'

// POST /token (form-urlencoded) → { access_token, token_type }
// email en `username`. 401 si las credenciales son inválidas.
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password })

  let res
  try {
    res = await fetch(buildUrl('/token'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. ¿Está corriendo el backend?', 0)
  }

  if (!res.ok) {
    let detail = 'Email o contraseña incorrectos'
    try {
      const data = await res.json()
      if (typeof data?.detail === 'string') detail = data.detail
    } catch {
      // body no-JSON: dejamos el mensaje por defecto
    }
    throw new ApiError(detail, res.status)
  }

  const { access_token } = await res.json()
  return access_token
}

// GET /me → UsuarioRead ({ id, email, nombre, rol, activo, empresa_id })
// Requiere token; el cliente ya lo adjunta. Útil tras login para saber quién soy.
export function getMe() {
  return api.get('/me')
}
