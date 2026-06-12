import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Briefcase, HelpCircle, LogOut, Scale, X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contratos',  icon: FileText,         label: 'Contratos' },
  { to: '/processos',  icon: Briefcase,         label: 'Processos' },
  { to: '/como-funciona', icon: HelpCircle,    label: 'Como Funciona' },
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

  return (
    <aside className={`
      w-64 min-h-screen bg-slate-900 flex flex-col shrink-0
      fixed lg:relative inset-y-0 left-0 z-30
      transition-transform duration-300 border-r border-slate-700 shadow-xl
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">LexFlow</h1>
              <span className="text-blue-400 text-xs">AI Jurídico</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 mb-3 truncate">{user?.email}</div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
