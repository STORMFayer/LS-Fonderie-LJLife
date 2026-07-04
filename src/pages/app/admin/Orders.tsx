import { useEffect, useState } from 'react'
import { ChevronDown, RefreshCw, Trash2 } from 'lucide-react'
import { supabase, type Order, type OrderStatut } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const filters: { key: 'tous' | OrderStatut; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'annulee', label: 'Annulé' },
]

const statusMeta: Record<OrderStatut, { label: string; variant: 'gold' | 'ember' | 'gray' }> = {
  en_attente: { label: 'En attente', variant: 'gray' },
  en_cours: { label: 'En cours', variant: 'ember' },
  livree: { label: 'Livrée', variant: 'gold' },
  annulee: { label: 'Annulée', variant: 'gray' },
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'tous' | OrderStatut>('tous')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function changeStatus(numero: string, statut: OrderStatut) {
    await supabase.rpc('update_order_status', { p_numero: numero, p_statut: statut })
    await load()
  }

  async function deleteOrder(numero: string) {
    await supabase.rpc('delete_order', { p_numero: numero })
    setConfirmDelete(null)
    await load()
  }

  const counts = {
    tous: orders.length,
    en_attente: orders.filter((o) => o.statut === 'en_attente').length,
    en_cours: orders.filter((o) => o.statut === 'en_cours').length,
    annulee: orders.filter((o) => o.statut === 'annulee').length,
    livree: 0,
  }

  const filtered = filter === 'tous' ? orders : orders.filter((o) => o.statut === filter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors',
                filter === f.key ? 'bg-gold/15 text-gold-light' : 'bg-white/5 text-white/50 hover:text-white',
              )}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={load}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((o) => {
          const isOpen = expanded === o.numero
          return (
            <Card key={o.numero} className="p-4">
              <button className="w-full flex items-center gap-3 text-left" onClick={() => setExpanded(isOpen ? null : o.numero)}>
                <Badge variant={o.type === 'black' ? 'ember' : 'gray'}>{o.type === 'black' ? '💀 Noir' : '⚖️ Légal'}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{o.nom}</div>
                  <div className="text-white/30 text-xs">{o.numero} · {new Date(o.created_at).toLocaleString('fr-FR')}</div>
                </div>
                <div className="text-emerald-400 font-bold text-sm shrink-0">{o.total.toLocaleString('fr-FR')} $</div>
                <Badge variant={statusMeta[o.statut].variant} className="shrink-0">{statusMeta[o.statut].label}</Badge>
                <ChevronDown size={16} className={cn('text-white/30 transition-transform shrink-0', isOpen && 'rotate-180')} />
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-white/8 flex flex-col gap-3">
                  {o.contact && <div className="text-white/50 text-sm">Contact: {o.contact}</div>}
                  <ul className="text-white/60 text-sm list-disc list-inside">
                    {o.items.map((it, i) => <li key={i}>{it.label} x{it.qty}</li>)}
                  </ul>
                  {o.message && <div className="text-white/40 text-xs italic">"{o.message}"</div>}

                  <div className="flex flex-wrap gap-2 mt-1">
                    {(['en_attente', 'en_cours', 'livree', 'annulee'] as OrderStatut[]).map((s) => (
                      <Button key={s} size="sm" variant={o.statut === s ? 'gold' : 'ghost'} onClick={() => changeStatus(o.numero, s)}>
                        {statusMeta[s].label}
                      </Button>
                    ))}
                  </div>

                  {o.statut === 'annulee' && (
                    <div className="pt-3 border-t border-white/8">
                      {confirmDelete === o.numero ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-red-400 text-xs">Supprimer définitivement cette commande ?</span>
                          <Button size="sm" variant="danger" onClick={() => deleteOrder(o.numero)}>Confirmer</Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>Annuler</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(o.numero)}>
                          <Trash2 size={13} /> Supprimer la commande
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
        {filtered.length === 0 && <p className="text-white/30 text-center py-10">Aucune commande.</p>}
      </div>
    </div>
  )
}
