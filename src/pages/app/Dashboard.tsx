import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Hammer } from 'lucide-react'
import { supabase, type Employee, type Submission, QUOTA_HEBDO } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const medals = ['🥇', '🥈', '🥉']

export function Dashboard() {
  const { session, employee } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [prixMinerai, setPrixMinerai] = useState(60)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    async function load() {
      const [{ data: emps }, { data: subs }, { data: price }] = await Promise.all([
        supabase.from('employees').select('*').order('total_minerais', { ascending: false }),
        supabase
          .from('submissions')
          .select('*')
          .eq('employee_id', session!.user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('prices').select('price').eq('key', 'mineral').single(),
      ])
      setEmployees(emps ?? [])
      setSubmissions(subs ?? [])
      if (price) setPrixMinerai(price.price)
      setLoading(false)
    }
    load()
  }, [session])

  if (employee?.role === 'admin') return <Navigate to="/admin/employees" replace />

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-2 border-white/20 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  const minerais = employee?.total_minerais ?? 0
  const salaire = minerais * prixMinerai
  const quotaPercent = Math.min(100, Math.round((minerais / QUOTA_HEBDO) * 100))

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6 bg-gradient-to-br from-gold/10 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-[#8a6d24] flex items-center justify-center text-amber-950 font-black text-lg shrink-0">
            {employee?.full_name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display font-black text-xl text-white">Bonjour, {employee?.full_name}</h1>
            <Badge variant="ember" className="mt-1.5">Employé</Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-white/40 text-xs uppercase tracking-[1.5px] font-semibold mb-2">Minerais</div>
          <div className="font-display font-black text-2xl text-white">{minerais.toLocaleString('fr-FR')}</div>
        </Card>
        <Card className="p-5">
          <div className="text-white/40 text-xs uppercase tracking-[1.5px] font-semibold mb-2">Salaire</div>
          <div className="font-display font-black text-2xl text-gold-light">{salaire.toLocaleString('fr-FR')} $</div>
        </Card>
        <Card className="p-5">
          <div className="text-white/40 text-xs uppercase tracking-[1.5px] font-semibold mb-2">Quota</div>
          <div className="font-display font-black text-2xl text-white">{quotaPercent}%</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-white/60 font-semibold">Quota hebdomadaire</span>
          <span className="text-white/40">
            {quotaPercent >= 100 ? 'Quota atteint' : `${Math.max(0, QUOTA_HEBDO - minerais)} minerais restants`}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${quotaPercent >= 100 ? 'bg-emerald-500' : 'bg-gold'}`}
            style={{ width: `${quotaPercent}%` }}
          />
        </div>
        <div className="text-white/30 text-xs mt-2">{minerais} / {QUOTA_HEBDO}</div>
      </Card>

      {submissions.length > 0 && (
        <Card className="p-6">
          <h2 className="font-bold text-white mb-4">Soumissions récentes</h2>
          <div className="flex flex-col gap-2">
            {submissions.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm py-1.5">
                <span className="text-white/40">{new Date(s.created_at).toLocaleString('fr-FR')}</span>
                <Badge variant="ember"><Hammer size={11} /> {s.minerais} minerais</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-bold text-white mb-4">Classement</h2>
        <div className="flex flex-col gap-2">
          {employees.map((e, i) => (
            <div
              key={e.id}
              className={`flex items-center gap-3 rounded-xl p-3 ${e.id === session?.user.id ? 'bg-gold/10 border border-gold/25' : 'bg-white/[0.03]'}`}
            >
              <div className="w-7 text-center font-bold text-sm text-white/50">{medals[i] ?? i + 1}</div>
              <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {e.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate">
                  {e.full_name} {e.id === session?.user.id && <span className="text-gold-light">(vous)</span>}
                </div>
                <div className="text-white/30 text-xs">{e.discord ?? '—'}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-white text-sm font-bold">{e.total_minerais.toLocaleString('fr-FR')} minerais</div>
                <div className="text-gold-light text-xs">{(e.total_minerais * prixMinerai).toLocaleString('fr-FR')} $</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
