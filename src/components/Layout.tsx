import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto min-w-0">
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3.5 sticky top-0 z-10 shadow-md"
          style={{ background: '#0b1120', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-bold">JuriTech</span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
