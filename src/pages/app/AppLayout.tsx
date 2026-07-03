import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo.png'

const employeeTabs = [
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/soumission', label: 'Soumission' },
  { to: '/avance', label: 'Avance' },
  { to: '/alertes', label: 'Alertes' },
]

const adminTabs = [
  { to: '/admin/employees', label: 'Employés' },
  { to: '/admin/orders', label: 'Commandes' },
  { to: '/admin/finances', label: 'Finances' },
  { to: '/admin/journal', label: 'Journal' },
  { to: '/admin/settings', label: 'Réglages' },
]

export function AppLayout() {
  const { employee } = useAuth()
  const navigate = useNavigate()
  const tabs = employee?.role === 'admin' ? adminTabs : employeeTabs

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0b0d12]">
      <header className="border-b border-white/8 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            <img src={logo} alt="LS Fonderie" className="w-7 h-7 object-contain" />
            <span className="font-display font-bold text-white hidden sm:inline">Espace Employé</span>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
                    isActive ? 'bg-gold/15 text-gold-light' : 'text-white/50 hover:text-white hover:bg-white/5',
                  )
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>

          <Button size="sm" variant="ghost" onClick={handleLogout} className="shrink-0">
            <LogOut size={14} /> <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10">
        <Outlet />
      </main>
    </div>
  )
}
