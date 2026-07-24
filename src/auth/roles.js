// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD DE ROLES
// No repartir strings 'chofer' por el código: un typo sería un bug silencioso
// de autorización. Todo el front lee el rol desde acá.
// ─────────────────────────────────────────────────────────────────────────────

// Roles del sistema. admin y operador comparten el back-office;
// chofer solo ve su vista de precios.
export const ROLES = {
  ADMIN: 'admin',
  OPERADOR: 'operador',
  CHOFER: 'chofer',
}

// Back-office = admin + operador. Se reutiliza en rutas y en el Header.
export const ROLES_BACKOFFICE = [ROLES.ADMIN, ROLES.OPERADOR]

// A dónde mandar a cada rol cuando pisa "/" o una ruta que no le toca.
// El chofer NO tiene back-office, así que su home es su vista de precios.
export function rutaInicial(rol) {
  return rol === ROLES.CHOFER ? '/chofer/precios' : '/productos'
}
