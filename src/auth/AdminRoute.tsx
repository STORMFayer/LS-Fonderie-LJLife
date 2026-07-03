import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import type { ReactNode } from 'react'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { employee, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d12]">
        <span className="w-8 h-8 border-2 border-white/20 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (employee?.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
