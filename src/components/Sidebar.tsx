import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Briefcase, HelpCircle, LogOut, Scale, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contratos',     icon: FileText,         label: 'Contratos' },
  { to: '/processos',     icon: Briefcase,         label: 'Processos' },
  { to: '/como-funciona', icon: HelpCircle,        label: 'Como Funciona' },
]

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

  return (
    <aside
      className={`
        w-64 min-h-screen flex flex-col shrink-0
        fixed lg:relative inset-y-0 left-0 z-30
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{ background: '#0b1120', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)' }}
            >
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-none tracking-tight text-white">JuriTech</h1>
              <span className="text-xs font-medium" style={{ color: '#818cf8' }}>AI Jurídico</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isActive ? 'white' : 'rgba(148,163,184,0.85)',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: '#818cf8' }}
                  />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 px-1 mb-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
            style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}
          >
            {initial}
          </div>
          <span className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.7)' }}>
            {user?.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all duration-150 group"
          style={{ color: 'rgba(148,163,184,0.7)' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.color = '#f87171'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.7)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
