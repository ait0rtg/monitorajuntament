import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, FileText, Calendar, Search, LogOut } from 'lucide-react'

export default function Layout() {
  const handleLogout = () => supabase.auth.signOut()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-surface border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Monitor Polític <span className="text-primary">v5</span></h1>
          <p className="text-xs text-gray-400 mt-1">Platja d'Aro - CRM</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/" className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <LogOut size={20} /> Sortir
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-surface/50 backdrop-blur sticky top-0 z-10">
          <h2 className="text-lg font-semibold">Tauler Intel·ligent</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Cercar documents..." className="bg-background border border-gray-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:border-primary outline-none w-64" />
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm">
              R
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
