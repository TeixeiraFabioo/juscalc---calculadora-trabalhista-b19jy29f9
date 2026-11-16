import React, { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Settings,
  Plus,
  LogOut,
  Menu,
  X,
  Scale,
  Calculator,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export const DashboardLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      title: 'Atendimentos',
      path: '/atendimentos',
      icon: Users,
    },
    {
      title: 'Configurações',
      path: '/configuracoes',
      icon: Settings,
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row text-[#0F2A44]">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#0F2A44] text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#C9A24B] flex items-center justify-center text-[#0F2A44]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">JusCalc</span>
            <span className="text-[10px] block text-[#C9A24B] uppercase tracking-wider font-semibold">
              Cálculos Trabalhistas
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          className="p-2 rounded-lg bg-[#1A3D61] text-white hover:bg-[#C9A24B] hover:text-[#0F2A44] transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-4/5 max-w-xs bg-[#0F2A44] text-white h-full flex flex-col p-5 shadow-2xl z-10 animate-fade-in-down">
            {/* Header in sidebar */}
            <div className="flex items-center justify-between pb-5 border-b border-[#1A3D61]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded bg-[#C9A24B] flex items-center justify-center text-[#0F2A44]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xl tracking-tight">JusCalc</span>
                  <span className="text-[10px] block text-[#C9A24B] uppercase tracking-wider font-semibold">
                    Painel Trabalhista
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu lateral"
                className="p-1.5 rounded-md text-gray-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Action Button */}
            <div className="py-4">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/novo-atendimento')
                }}
                className="w-full bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-bold py-2.5 px-4 rounded-lg shadow-md flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Novo Atendimento</span>
              </Button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1.5 pt-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-lg font-medium text-base transition-colors ${
                      active
                        ? 'bg-[#1A3D61] text-[#C9A24B] border-l-4 border-[#C9A24B]'
                        : 'text-gray-200 hover:bg-[#1A3D61]/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-[#C9A24B]' : 'text-gray-300'}`} />
                    <span>{item.title}</span>
                  </Link>
                )
              })}

              <div className="pt-2">
                <Link
                  to="/resultado"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg font-medium text-base transition-colors ${
                    isActive('/resultado')
                      ? 'bg-[#1A3D61] text-[#C9A24B] border-l-4 border-[#C9A24B]'
                      : 'text-gray-200 hover:bg-[#1A3D61]/60 hover:text-white'
                  }`}
                >
                  <Calculator className="w-5 h-5 text-gray-300" />
                  <span>Resultado</span>
                </Link>
              </div>
            </nav>

            {/* User profile & Logout */}
            <div className="pt-4 border-t border-[#1A3D61] mt-auto">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-9 h-9 rounded-full bg-[#1A3D61] text-[#C9A24B] flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-white">
                    {user?.name || 'Advogado'}
                  </p>
                  <p className="text-xs text-gray-300 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da conta</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F2A44] text-white flex-shrink-0 shadow-xl min-h-screen sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-6 border-b border-[#1A3D61] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C9A24B] flex items-center justify-center text-[#0F2A44] shadow">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight leading-none text-white">JusCalc</h1>
            <p className="text-xs text-[#C9A24B] font-semibold tracking-wider uppercase mt-1">
              Painel Trabalhista
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="p-4">
          <Button
            onClick={() => navigate('/novo-atendimento')}
            className="w-full bg-[#C9A24B] hover:bg-[#B38E3D] text-[#0F2A44] font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">+ Novo Atendimento</span>
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg font-medium text-sm transition-all ${
                  active
                    ? 'bg-[#1A3D61] text-[#C9A24B] font-semibold shadow-inner border-l-4 border-[#C9A24B]'
                    : 'text-gray-200 hover:bg-[#1A3D61]/60 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#C9A24B]' : 'text-gray-300'}`} />
                <span>{item.title}</span>
              </Link>
            )
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Estrutura de Cálculos
          </div>
          <Link
            to="/resultado"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-lg font-medium text-sm transition-all ${
              isActive('/resultado')
                ? 'bg-[#1A3D61] text-[#C9A24B] font-semibold shadow-inner border-l-4 border-[#C9A24B]'
                : 'text-gray-200 hover:bg-[#1A3D61]/60 hover:text-white'
            }`}
          >
            <Calculator className="w-5 h-5 text-gray-300" />
            <span>Resultado (Prévia)</span>
          </Link>
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-[#1A3D61] bg-[#0A1C2E]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#1A3D61] text-[#C9A24B] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'Dr(a). Advogado(a)'}
              </p>
              <p className="text-xs text-gray-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors border border-red-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
