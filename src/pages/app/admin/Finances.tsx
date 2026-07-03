import { useEffect, useState } from 'react'
import { RotateCcw, Wallet } from 'lucide-react'
import { supabase, type Employee, type Order } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function Finances() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [prixMinerai, setPrixMinerai] = useState(60)
  const [loading, setLoading] = useState(true)
  const [avanceInputs, setAvanceInputs] = useState<Record<string, string>>({})

  async function load() {
    setLoading(true)
    const [{ data: emps }, { data: ords }, { data: price }] = await Promise.all([
      supabase.from('employees').select('*').order('total_minerais', { ascending: false }),
      supabase.from('orders').select('*'),
      supabase.from('prices').select('price').eq('key', 'mineral').single(),
    ])
    setEmployees(emps ?? [])
    setOrders(ords ?? [])
    if (price) setPrixMinerai(price.price)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function verserAvance(id: string, max: number) {
    const value = Number(avanceInputs[id])
    if (!value || value <= 0 || value > max) return
    await supabase.rpc('add_payment', { p_employee_id: id, p_amount: value })
    setAvanceInputs((prev) => ({ ...prev, [id]: '' }))
    await load()
  }

  async function payerTout(id: string, montant: number) {
    if (montant <= 0) return
    await supabase.rpc('add_payment', { p_employee_id: id, p_amount: montant })
    await load()
  }

  async function reset(id: string) {
    await supabase.rpc('reset_payment', { p_employee_id: id })
    await load()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-8 h-8 border-2 border-white/20 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  const totalLegal = orders.filter((o) => o.type === 'legal').reduce((s, o) => s + o.total, 0)
  const totalBlack = orders.filter((o) => o.type === 'black').reduce((s, o) => s + o.total, 0)
  const totalSalaires = employees.reduce((s, e) => s + e.total_minerais * prixMinerai, 0)
  const totalPaye = employees.reduce((s, e) => s + e.total_paid, 0)
  const resteAPayer = totalSalaires - totalPaye
  const payePercent = totalSalaires > 0 ? Math.round((totalPaye / totalSalaires) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-white/40 text-xs uppercase tracking-[1.5px] font-semibold mb-2">Revenus légaux</div>
          <div className="font-display font-black text-2xl text-emerald-400">{totalLegal.toLocaleString('fr-FR')} $</div>
        </Card>
        <Card className="p-5">
          <div className="text-white/40 text-xs uppercase tracking-[1.5px] font-semibold mb-2">Revenus marché noir</div>
          <div className="font-display font-black text-2xl text-red-400">{totalBlack.toLocaleString('fr-FR')} $</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-white mb-4">Masse salariale</h2>
        <div className="h-2.5 rounded-full bg-white/8 overflow-hidden mb-4">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${Math.min(100, payePercent)}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-white font-bold">{totalSalaires.toLocaleString('fr-FR')} $</div>
            <div className="text-white/30 text-xs uppercase tracking-[1px]">Total dû</div>
          </div>
          <div>
            <div className="text-emerald-400 font-bold">{totalPaye.toLocaleString('fr-FR')} $</div>
            <div className="text-white/30 text-xs uppercase tracking-[1px]">Déjà versé</div>
          </div>
          <div>
            <div className="text-amber-400 font-bold">{resteAPayer.toLocaleString('fr-FR')} $</div>
            <div className="text-white/30 text-xs uppercase tracking-[1px]">Reste à payer</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-white mb-4">Paiements par employé</h2>
        <div className="flex flex-col gap-3">
          {employees.filter((e) => e.total_minerais > 0).map((e) => {
            const salaire = e.total_minerais * prixMinerai
            const reste = salaire - e.total_paid
            const pct = salaire > 0 ? Math.round((e.total_paid / salaire) * 100) : 0
            return (
              <div key={e.id} className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {e.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{e.full_name}</div>
                    <div className="text-white/30 text-xs">{e.total_minerais} min · salaire: {salaire.toLocaleString('fr-FR')} $</div>
                  </div>
                  {reste <= 0
                    ? <Badge variant="gold">Payé</Badge>
                    : <span className="text-amber-400 text-sm font-semibold shrink-0">{reste.toLocaleString('fr-FR')} $ reste</span>}
                </div>
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>

                {reste > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex gap-2 flex-1">
                      <input
                        type="number"
                        min={1}
                        max={reste}
                        value={avanceInputs[e.id] ?? ''}
                        onChange={(ev) => setAvanceInputs((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                        placeholder={`Avance (max ${reste.toLocaleString('fr-FR')}$)`}
                        className="flex-1 rounded-lg bg-white/5 border border-white/12 px-3 py-2 text-sm text-white outline-none focus:border-gold/50"
                      />
                      <Button size="sm" variant="ghost" onClick={() => verserAvance(e.id, reste)}>
                        <Wallet size={13} /> Verser
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="gold" onClick={() => payerTout(e.id, reste)}>
                        Tout payer ({reste.toLocaleString('fr-FR')}$)
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => reset(e.id)}>
                        <RotateCcw size={13} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
