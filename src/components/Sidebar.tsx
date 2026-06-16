import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Briefcase, HelpCircle, LogOut, Scale, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contratos',     icon: FileText,         label: 'Contratos' },
  { to: '/processos',     icon: Briefcase,         label: 'Processos' },
  { to: '/como-funciona', icon: HelpCircle,        label: 'Como Funciona' },
]

const SIDEBAR_BG = 'linear-gradient(180deg, #0d1b2e 0%, #0a1422 100%)'
const BORDER_COLOR = 'rgba(255,255,255,0.05)'
const ACTIVE_BG = 'rgba(79,70,229,0.14)'
const ACTIVE_COLOR = '#fff'
const INACTIVE_COLOR = 'rgba(148,163,184,0.8)'
const HOVER_BG = 'rgba(255,255,255,0.04)'
const ACCENT_COLOR = '#6366f1'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'
  const emailDisplay = user?.email ?? ''

  return (
    <aside
      className={`
        w-[260px] min-h-screen flex flex-col shrink-0
        fixed lg:relative inset-y-0 left-0 z-30
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{ background: SIDEBAR_BG, borderRight: `1px solid ${BORDER_COLOR}` }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3b82f6 100%)', boxShadow: '0 4px 12px rgba(79,70,229,0.35)' }}
            >
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-none tracking-tight">JuriTech</p>
              <p className="text-[11px] mt-0.5 font-medium" style={{ color: '#6366f1' }}>AI Jurídico</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-5 pb-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2.5"
          style={{ color: 'rgba(148,163,184,0.35)' }}
        >
          Menu
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group"
              style={({ isActive }) => ({
                background: isActive ? ACTIVE_BG : 'transparent',
                color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
              })}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                if (!el.dataset.active) el.style.background = HOVER_BG
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                if (!el.dataset.active) el.style.background = 'transparent'
              }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full"
                      style={{ background: ACCENT_COLOR }}
                    />
                  )}
                  <Icon
                    className="w-4 h-4 shrink-0 transition-colors"
                    style={{ color: isActive ? '#a5b4fc' : 'rgba(148,163,184,0.7)' }}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer — user + signout */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: `1px solid ${BORDER_COLOR}` }}>
        <div
          className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg mb-1"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
            style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium truncate" style={{ color: 'rgba(148,163,184,0.6)' }}>
              {emailDisplay}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-[13px] transition-all duration-150"
          style={{ color: 'rgba(148,163,184,0.5)' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.color = '#f87171'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.5)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
