import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { OrderCatalogue } from '@/components/OrderCatalogue'

export function OrderBlack() {
  const [confirmed, setConfirmed] = useState(false)
  const navigate = useNavigate()

  if (!confirmed) {
    return (
      <div className="min-h-screen bg-[#12080a] flex items-center justify-center px-5">
        <Card className="p-8 max-w-md text-center border-red-500/25">
          <div className="text-4xl mb-4">💀</div>
          <h1 className="font-display font-black text-2xl text-white mb-3">Marché Noir</h1>
          <p className="text-white/50 text-sm mb-5">
            Les paiements sur ce circuit sont répartis automatiquement :
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-3">
              <div className="text-emerald-400 font-black text-lg">70%</div>
              <div className="text-white/40 text-xs">Argent propre</div>
            </div>
            <div className="rounded-lg bg-red-500/10 border border-red-500/25 p-3">
              <div className="text-red-400 font-black text-lg">30%</div>
              <div className="text-white/40 text-xs">Argent sale</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => navigate('/')}>Annuler</Button>
            <Button variant="danger" className="flex-1" onClick={() => setConfirmed(true)}>J'accepte</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <OrderCatalogue
      type="black"
      accent="text-red-400"
      title="💀 Marché Noir"
      subtitle="Discrétion garantie. Aucune trace, aucune question."
    />
  )
}
