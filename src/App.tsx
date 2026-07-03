import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { AdminRoute } from '@/auth/AdminRoute'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Tracking } from '@/pages/Tracking'
import { OrderLegal } from '@/pages/OrderLegal'
import { OrderBlack } from '@/pages/OrderBlack'
import { AppLayout } from '@/pages/app/AppLayout'
import { Dashboard } from '@/pages/app/Dashboard'
import { Submission } from '@/pages/app/Submission'
import { Avance } from '@/pages/app/Avance'
import { Alertes } from '@/pages/app/Alertes'
import { Employees } from '@/pages/app/admin/Employees'
import { Orders } from '@/pages/app/admin/Orders'
import { Finances } from '@/pages/app/admin/Finances'
import { Journal } from '@/pages/app/admin/Journal'
import { Settings } from '@/pages/app/admin/Settings'

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/suivi" element={<Tracking />} />
          <Route path="/commander" element={<OrderLegal />} />
          <Route path="/marche-noir" element={<OrderBlack />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/soumission" element={<Submission />} />
            <Route path="/avance" element={<Avance />} />
            <Route path="/alertes" element={<Alertes />} />

            <Route path="/admin/employees" element={<AdminRoute><Employees /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><Orders /></AdminRoute>} />
            <Route path="/admin/finances" element={<AdminRoute><Finances /></AdminRoute>} />
            <Route path="/admin/journal" element={<AdminRoute><Journal /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
