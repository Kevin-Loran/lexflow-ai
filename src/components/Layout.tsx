import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':      { title: 'Dashboard',        subtitle: 'Monitore contratos, vencimentos e prioridades de revisão.' },
  '/contratos':      { title: 'Contratos',         subtitle: 'Gerencie e acompanhe todos os contratos do escritório.' },
  '/contratos/novo': { title: 'Novo Contrato',     subtitle: 'Cadastre um novo contrato manualmente.' },
  '/processos':      { title: 'Processos',          subtitle: 'Acompanhe os processos trabalhistas em andamento.' },
  '/como-funciona':  { title: 'Como Funciona',      subtitle: 'Entenda o fluxo completo do JuriTech.' },
}

function getPageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  if (/^\/contratos\/[^/]+\/editar$/.test(pathname))
    return { title: 'Editar Contrato', subtitle: 'Atualize as informações do contrato selecionado.' }
  if (/^\/contratos\/[^/]+$/.test(pathname))
    return { title: 'Detalhes do Contrato', subtitle: 'Visualize todas as informações do contrato.' }
  if (/^\/processos\/[^/]+$/.test(pathname))
    return { title: 'Detalhes do Processo', subtitle: 'Visualize todas as informações do processo.' }
  return { title: 'JuriTech', subtitle: '' }
}

const EXPANDED  = 280
const COLLAPSED = 72

export function Layout() {
  // Desktop/tablet: expanded vs collapsed (tablet starts collapsed)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 1024
    return false
  })
  // Mobile: drawer open state
  const [mobileOpen, setMobileOpen] = useState(false)

  const { user } = useAuth()
  const location = useLocation()
  const { title, subtitle } = getPageMeta(location.pathname)
  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex" style={{ minHeight: '100vh', background: '#F8FAFC' }}>

      {/* ── Desktop / Tablet sidebar — lives in the flex flow, animates width ── */}
      <div
        className="hidden md:block shrink-0"
        style={{
          width: collapsed ? COLLAPSED : EXPANDED,
          transition: 'width 0.25s ease',
        }}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
        />
      </div>

      {/* ── Mobile overlay ── */}
      <div
        className={`md:hidden fixed inset-0 z-20 transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-30 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: EXPANDED }}
      >
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="h-14 bg-white flex items-center justify-between px-5 sticky top-0 z-10 shrink-0"
          style={{ borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold leading-none" style={{ color: '#0F172A' }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs mt-0.5 truncate hidden sm:block" style={{ color: '#64748B' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#94a3b8' }}
              title="Notificações (em breve)"
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.background = '#f8fafc'
                ;(e.currentTarget as HTMLElement).style.color = '#64748b'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#94a3b8'
              }}
            >
              <Bell className="w-4 h-4" />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 cursor-default"
              style={{ background: 'rgba(79,70,229,0.08)', color: '#4F46E5' }}
              title={user?.email}
            >
              {initial}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
