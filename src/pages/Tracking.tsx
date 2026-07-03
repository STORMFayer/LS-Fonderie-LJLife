import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Clock, CircleCheck, Package } from 'lucide-react'
import { supabase, type OrderStatut } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Embers } from '@/components/Embers'

interface TrackedOrder {
  numero: string
  statut: OrderStatut
  items: { label: string; qty: number }[]
  total: number
  type: 'legal' | 'black'
}

const statusMeta: Record<OrderStatut, { label: string; icon: typeof Clock; variant: 'gold' | 'ember' | 'gray' }> = {
  en_attente: { label: 'En attente', icon: Clock, variant: 'gray' },
  en_cours: { label: 'En préparation', icon: Package, variant: 'ember' },
  livree: { label: 'Livrée', icon: CircleCheck, variant: 'gold' },
  annulee: { label: 'Annulée', icon: Clock, variant: 'gray' },
}

export function Tracking() {
  const [numero, setNumero] = useState('')
  const [order, setOrder] = useState<TrackedOrder | null | undefined>(undefined)
  const [searching, setSearching] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSearching(true)
    const { data } = await supabase.rpc('get_order_status', { p_numero: numero.trim() })
    setOrder(data?.[0] ?? null)
    setSearching(false)
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-5 py-16"
      style={{
        background: `
          radial-gradient(ellipse 70% 55% at 50% 20%, rgba(217,164,65,0.2) 0%, rgba(217,164,65,0) 55%),
          linear-gradient(168deg, #15110b 0%, #191510 30%, #0b0d12 75%, #0b0d12 100%)
        `,
      }}
    >
      <Embers count={10} />

      <Link to="/" className="absolute top-6 left-6 z-10 text-white/40 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
        <ArrowLeft size={15} /> Retour au site
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <h1 className="font-display font-black text-2xl text-white text-center mb-1">Suivre ma commande</h1>
        <p className="text-white/40 text-sm text-center mb-8">Entre ton numéro de commande pour voir son statut.</p>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="CMD-123456"
              className="flex-1 rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50 transition-colors"
            />
            <Button type="submit" variant="gold" disabled={searching}>
              <Search size={15} />
            </Button>
          </form>
        </Card>

        {order === null && (
          <p className="text-white/40 text-center mt-6 text-sm">Commande introuvable.</p>
        )}

        {order && (
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gold-light font-display font-black text-lg">{order.numero}</span>
              <Badge variant={statusMeta[order.statut].variant}>{statusMeta[order.statut].label}</Badge>
            </div>
            <ul className="text-white/60 text-sm list-disc list-inside mb-4">
              {order.items.map((it, i) => <li key={i}>{it.label} x{it.qty}</li>)}
            </ul>
            <div className="flex items-center justify-between pt-4 border-t border-white/8">
              <span className="text-white/40 text-xs uppercase tracking-[1.5px]">{order.type === 'black' ? '⚫ Marché noir' : '🏛️ Officielle'}</span>
              <span className="font-display font-black text-xl text-gold-light">{order.total.toLocaleString('fr-FR')} $</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
