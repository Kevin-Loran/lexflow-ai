import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Scale, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function InputField({
  icon: Icon, label, type, value, onChange, placeholder, required,
}: {
  icon: any; label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string; required?: boolean
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        onFocus={() => {}}
      >
        <Icon className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="flex-1 bg-transparent text-sm text-white focus:outline-none"
          style={{ color: 'white' }}
          onFocus={e => {
            const parent = e.target.closest('div') as HTMLElement
            if (parent) {
              parent.style.border = '1px solid rgba(99,102,241,0.7)'
              parent.style.background = 'rgba(255,255,255,0.08)'
            }
          }}
          onBlur={e => {
            const parent = e.target.closest('div') as HTMLElement
            if (parent) {
              parent.style.border = '1px solid rgba(255,255,255,0.12)'
              parent.style.background = 'rgba(255,255,255,0.05)'
            }
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

export function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { nome } },
        })
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0d0d1a' }}
    >
      {/* Orbs vibrantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute" style={{
          top: '-10%', left: '-5%',
          width: '55%', height: '55%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div className="absolute" style={{
          bottom: '-15%', right: '-5%',
          width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div className="absolute" style={{
          top: '40%', left: '55%',
          width: '30%', height: '30%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
      </div>

      {/* Grid sutil de fundo */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              boxShadow: '0 0 40px rgba(99,102,241,0.5)',
            }}
          >
            <Scale className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">JuriTech</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Gestão inteligente de contratos
          </p>
        </motion.div>

        {/* Card glass */}
        <div className="rounded-2xl p-7 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Brilho no topo do card */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
          />

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-7"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative"
                style={{
                  color: mode === m ? 'white' : 'rgba(255,255,255,0.35)',
                  background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="nome"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <InputField
                    icon={User} label="Nome completo" type="text"
                    value={nome} onChange={setNome}
                    placeholder="Dr. João Silva" required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              icon={Mail} label="E-mail" type="email"
              value={email} onChange={setEmail}
              placeholder="advogado@escritorio.com" required
            />

            <InputField
              icon={Lock} label="Senha" type="password"
              value={password} onChange={setPassword}
              placeholder="••••••••" required
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs p-3 rounded-xl"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#fca5a5',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full mt-2 flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.15)' }}>
          JuriTech © 2026 — Lex Praxis
        </p>
      </motion.div>
    </div>
  )
}
