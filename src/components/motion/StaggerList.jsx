// Entrada escalonada (stagger) para listas y filas de tabla.
//
// Dos pares de componentes:
//   • StaggerList / StaggerItem      → listas genéricas (<div>)
//   • StaggerTableBody / StaggerTableRow → reemplazo directo de TableBody/TableRow
//     de shadcn (mismos estilos), pero con las filas apareciendo en cascada.
//
// Todos respetan prefers-reduced-motion: si el usuario pidió menos movimiento,
// caen a los elementos planos equivalentes sin animar.

import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/lib/motion'

// ── Listas genéricas ─────────────────────────────────────────────────────────
export function StaggerList({ children, className, ...props }) {
  const sinMovimiento = useReducedMotion()
  if (sinMovimiento) return <div className={className} {...props}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, ...props }) {
  const sinMovimiento = useReducedMotion()
  if (sinMovimiento) return <div className={className} {...props}>{children}</div>
  return (
    <motion.div className={className} variants={staggerItem} {...props}>
      {children}
    </motion.div>
  )
}

// ── Filas de tabla ───────────────────────────────────────────────────────────
// Mismos data-slot y clases que ui/table.jsx para que sean intercambiables.
export function StaggerTableBody({ children, className, ...props }) {
  const sinMovimiento = useReducedMotion()
  const clases = cn('[&_tr:last-child]:border-0', className)
  if (sinMovimiento) {
    return <tbody data-slot="table-body" className={clases} {...props}>{children}</tbody>
  }
  return (
    <motion.tbody
      data-slot="table-body"
      className={clases}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.tbody>
  )
}

export function StaggerTableRow({ children, className, ...props }) {
  const sinMovimiento = useReducedMotion()
  const clases = cn(
    'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
    className,
  )
  if (sinMovimiento) {
    return <tr data-slot="table-row" className={clases} {...props}>{children}</tr>
  }
  return (
    <motion.tr data-slot="table-row" className={clases} variants={staggerItem} {...props}>
      {children}
    </motion.tr>
  )
}
