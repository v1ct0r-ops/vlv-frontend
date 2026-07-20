// ─────────────────────────────────────────────────────────────────────────────
// CAPA 4: PÁGINA DE LOGIN
// Formulario email + password con los estados de siempre (idle/loading/error).
// El error real viene del `detail` de FastAPI vía ApiError (401 = credenciales).
// Look "futurista": fondo animado (anime.js) + entrada de la card con motion.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Eye, EyeOff, Loader2, LogIn, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import AuroraBackground from '@/components/AuroraBackground'

function LoginPage() {
  const { iniciarSesion, estaAutenticado, cargando } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  // Ya hay sesión (o quedó una al volver a /login): fuera de acá.
  if (!cargando && estaAutenticado) return <Navigate to="/productos" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await iniciarSesion(email, password)
      navigate('/productos', { replace: true })
    } catch (err) {
      // 401 → "Email o contraseña incorrectos"; 0 → backend caído; etc.
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <AuroraBackground />

      <motion.div
        initial={{ opacity: 0, y: 28, filter: 'blur(12px)', scale: 0.97 }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Borde con glow animado alrededor de la card */}
        <div className="relative rounded-2xl p-px">
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-2xl opacity-70 blur-sm"
            style={{
              background:
                'linear-gradient(120deg, rgba(56,189,248,0.6), rgba(139,92,246,0.6), rgba(236,72,153,0.5), rgba(56,189,248,0.6))',
              backgroundSize: '300% 300%',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative rounded-2xl border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
            {/* Marca */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-7 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_25px_rgba(56,189,248,0.35)]">
                <Lock className="h-5 w-5 text-cyan-300" />
              </div>
              <h1 className="bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
                VLV — Gestión de gas
              </h1>
              <p className="mt-1 text-sm text-slate-400">Ingresá con tu cuenta</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-medium text-slate-300">
                  Email
                </label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-300" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@empresa.cl"
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-cyan-400/60 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.15)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-medium text-slate-300">
                  Contraseña
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-300" />
                  <input
                    id="password"
                    type={verPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-cyan-400/60 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.15)]"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-200"
                    aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {verPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {error}
                </motion.p>
              )}

              {/* Botón */}
              <motion.button
                type="submit"
                disabled={enviando}
                whileHover={{ scale: enviando ? 1 : 1.02 }}
                whileTap={{ scale: enviando ? 1 : 0.98 }}
                className="mt-2 flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-shadow hover:shadow-[0_0_35px_rgba(139,92,246,0.55)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {enviando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ingresando…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Ingresar
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Tu sesión expira a los 30 minutos de inactividad.
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage
