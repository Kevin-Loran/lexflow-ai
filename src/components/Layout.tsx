import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-4 bg-slate-900 sticky top-0 z-10 border-b border-slate-700 shadow-md">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-white font-bold text-lg">JuriTech</span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
