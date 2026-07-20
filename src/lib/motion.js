// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE ANIMACIÓN COMPARTIDO
// Una sola curva y una sola escala de tiempos para que TODA la app se mueva
// igual. Intensidad "sutil-profesional": movimiento discreto, nada que distraiga
// del trabajo diario. Estos `variants` de motion se reutilizan vía los
// componentes de src/components/motion/*.
// ─────────────────────────────────────────────────────────────────────────────

// La curva del login (easeOutExpo suavizado). Entra rápido y asienta suave.
export const EASE_SUAVE = [0.16, 1, 0.3, 1]

// Bloque que aparece: leve fade + subida corta. Para cards y secciones.
export const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_SUAVE } },
}

// Solo opacidad, sin desplazamiento. Para overlays y textos.
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: EASE_SUAVE } },
}

// Contenedor que escalona la entrada de sus hijos (filas de tabla, listas).
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
}

// Hijo de un staggerContainer: subida mínima para que se note el escalonado.
export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_SUAVE } },
}
