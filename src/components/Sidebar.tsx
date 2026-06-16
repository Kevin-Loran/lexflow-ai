import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Briefcase, HelpCircle,
  LogOut, Scale, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contratos',     icon: FileText,         label: 'Contratos' },
  { to: '/processos',     icon: Briefcase,         label: 'Processos' },
  { to: '/como-funciona', icon: HelpCircle,        label: 'Como Funciona' },
]

const SIDEBAR_BG   = 'linear-gradient(180deg, #0d1b2e 0%, #0a1422 100%)'
const BORDER_CLR   = 'rgba(255,255,255,0.05)'
const ACTIVE_BG    = 'rgba(79,70,229,0.16)'
const HOVER_BG     = 'rgba(255,255,255,0.04)'
const INACTIVE_CLR = 'rgba(148,163,184,0.75)'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onClose?: () => void  // defined = mobile drawer mode
}

export function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const isMobile = onClose !== undefined
  // In mobile mode the sidebar is always fully expanded
  const col = collapsed && !isMobile

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'
  const email = user?.email ?? ''

  // Animates text out by collapsing max-width + fading opacity
  const fadeStyle = (visible: boolean): React.CSSProperties => ({
    overflow: 'hidden',
    display: 'block',
    maxWidth: visible ? 200 : 0,
    opacity: visible ? 1 : 0,
    whiteSpace: 'nowrap',
    transition: 'max-width 0.25s ease, opacity 0.18s ease',
  })

  return (
    <aside
      className="flex flex-col h-screen w-full"
      style={{ background: SIDEBAR_BG, borderRight: `1px solid ${BORDER_CLR}` }}
    >
      {/* ── Logo & toggle ── */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: 64, borderBottom: `1px solid ${BORDER_CLR}`, padding: '0 12px' }}
      >
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #3b82f6)',
              boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
            }}
          >
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div style={fadeStyle(!col)}>
            <p className="font-bold text-sm text-white leading-none tracking-tight whitespace-nowrap">
              JuriTech
            </p>
            <p className="text-[11px] mt-0.5 font-medium whitespace-nowrap" style={{ color: '#6366f1' }}>
              AI Jurídico
            </p>
          </div>
        </div>

        {isMobile ? (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg shrink-0 transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            title={col ? 'Expandir menu' : 'Recolher menu'}
            className="p-1.5 rounded-lg shrink-0 transition-all duration-150"
            style={{ color: 'rgba(148,163,184,0.4)' }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.9)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.4)'
            }}
          >
            {col
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1" style={{ padding: '16px 10px 8px' }}>
        {/* "MENU" section label */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: col ? 0 : 24,
            opacity: col ? 0 : 1,
            marginBottom: col ? 0 : 6,
            transition: 'max-height 0.25s ease, opacity 0.18s ease, margin-bottom 0.2s ease',
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(148,163,184,0.28)', paddingLeft: 10 }}
          >
            Menu
          </p>
        </div>

        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={isMobile ? onClose : undefined}
              className="group/item relative flex items-center rounded-lg text-sm font-medium"
              style={({ isActive }) => ({
                background: isActive ? ACTIVE_BG : 'transparent',
                color: isActive ? '#fff' : INACTIVE_CLR,
                padding: col ? '10px 0' : '10px 10px',
                justifyContent: col ? 'center' : undefined,
                transition: 'background 0.15s ease, color 0.15s ease',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                if (el.getAttribute('aria-current') !== 'page') el.style.background = HOVER_BG
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                if (el.getAttribute('aria-current') !== 'page') el.style.background = 'transparent'
              }}
            >
              {({ isActive }) => (
                <>
                  {/* Active left accent bar */}
                  {isActive && !col && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full"
                      style={{ background: '#6366f1' }}
                    />
                  )}

                  {/* Icon + label, shifts right on hover when expanded */}
                  <span
                    className={`flex items-center gap-2.5 transition-transform duration-150 ${!col ? 'group-hover/item:translate-x-1' : ''}`}
                  >
                    <Icon
                      className="w-[18px] h-[18px] shrink-0"
                      style={{ color: isActive ? '#a5b4fc' : 'rgba(148,163,184,0.6)' }}
                    />
                    <span style={fadeStyle(!col)}>{label}</span>
                  </span>

                  {/* Tooltip — visible only in collapsed mode, floats right */}
                  {col && (
                    <span
                      className="pointer-events-none absolute opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 z-50"
                      style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                    >
                      <span
                        className="block text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                        style={{
                          background: '#0f172a',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {label}
                      </span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div
        className="shrink-0"
        style={{ borderTop: `1px solid ${BORDER_CLR}`, padding: '12px 10px 16px' }}
      >
        {col ? (
          /* Collapsed: stacked avatar + logout icon */
          <div className="flex flex-col items-center gap-2">
            <div
              className="group/av relative w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold cursor-default"
              style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc' }}
            >
              {initial}
              {/* Email tooltip */}
              <span
                className="pointer-events-none absolute opacity-0 group-hover/av:opacity-100 transition-opacity duration-150 z-50"
                style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
              >
                <span
                  className="block text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                  style={{
                    background: '#0f172a',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {email}
                </span>
              </span>
            </div>

            <button
              onClick={handleSignOut}
              title="Sair da conta"
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
              style={{ color: 'rgba(148,163,184,0.45)' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.color = '#f87171'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.45)'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Expanded: email card + full logout button */
          <>
            <div
              className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg mb-1"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc' }}
              >
                {initial}
              </div>
              <p className="flex-1 min-w-0 text-[11px] font-medium truncate" style={{ color: 'rgba(148,163,184,0.55)' }}>
                {email}
              </p>
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
          </>
        )}
      </div>
    </aside>
  )
}
