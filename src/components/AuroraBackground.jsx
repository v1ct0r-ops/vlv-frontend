// Fondo decorativo "futurista" de la pantalla de login. Puramente visual y
// aislado: no toca datos ni sesión. Combina CSS (grid + aurora en gradientes)
// con anime.js para animar de forma imperativa los orbes de glow y las líneas.
//
// Respeta prefers-reduced-motion: si el usuario pidió menos movimiento, se
// pinta el fondo estático y no se lanza ninguna animación.

import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

function AuroraBackground() {
  const raiz = useRef(null)

  useEffect(() => {
    const prefiereQuieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefiereQuieto || !raiz.current) return

    const orbes = raiz.current.querySelectorAll('[data-orbe]')
    const lineas = raiz.current.querySelectorAll('[data-linea]')

    // Orbes de glow: derivan lento en X/Y y "respiran" en escala/opacidad.
    const animOrbes = animate(orbes, {
      translateX: () => [
        `${(Math.random() - 0.5) * 60}px`,
        `${(Math.random() - 0.5) * 60}px`,
      ],
      translateY: () => [
        `${(Math.random() - 0.5) * 60}px`,
        `${(Math.random() - 0.5) * 60}px`,
      ],
      scale: [1, 1.25],
      opacity: [0.35, 0.6],
      duration: 6000,
      delay: stagger(800),
      direction: 'alternate',
      loop: true,
      ease: 'inOutSine',
    })

    // Líneas de "escaneo" que barren vertical: sensación de HUD futurista.
    const animLineas = animate(lineas, {
      translateY: ['-10%', '110%'],
      opacity: [0, 0.5, 0],
      duration: 5000,
      delay: stagger(1600),
      loop: true,
      ease: 'inOutQuad',
    })

    return () => {
      animOrbes.pause()
      animLineas.pause()
    }
  }, [])

  return (
    <div
      ref={raiz}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#05060a]"
    >
      {/* Grid futurista en perspectiva */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(120,160,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(120,160,255,0.12) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%)',
        }}
      />

      {/* Orbes de aurora (glow) */}
      <div
        data-orbe
        className="absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.45), transparent 70%)' }}
      />
      <div
        data-orbe
        className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)' }}
      />
      <div
        data-orbe
        className="absolute -bottom-32 left-1/4 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.32), transparent 70%)' }}
      />

      {/* Líneas de escaneo horizontales */}
      <div
        data-linea
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(125,211,252,0.7), transparent)' }}
      />
      <div
        data-linea
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)' }}
      />

      {/* Viñeta para asentar la card por encima */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,6,10,0.85))]" />
    </div>
  )
}

export default AuroraBackground
