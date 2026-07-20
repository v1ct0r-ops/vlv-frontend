// Wrapper de entrada: monta cualquier bloque con un fade + subida corta.
// Respeta prefers-reduced-motion (useReducedMotion) → si el usuario pidió menos
// movimiento, renderiza un <div> plano sin animar.

import { motion, useReducedMotion } from 'motion/react'
import { fadeInUp } from '@/lib/motion'

function FadeIn({ children, className, delay = 0, ...props }) {
  const sinMovimiento = useReducedMotion()

  if (sinMovimiento) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default FadeIn
