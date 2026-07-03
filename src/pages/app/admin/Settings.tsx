import { useEffect, useState } from 'react'
import { Save, TriangleAlert } from 'lucide-react'
import { supabase, type Price } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function Settings() {
  const [prices, setPrices] = useState<Price[]>([])
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<string | null>(null)
  const [confirmingReset, setConfirmingReset] = useState(false)

  async function load() {
    const { data } = await supabase.from('prices').select('*').order('type')
    setPrices(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  const pendingKeys = Object.keys(edits).filter((k) => edits[k] !== '' && Number(edits[k]) !== prices.find((p) => p.key === k)?.price)

  async function savePrices() {
    for (const key of pendingKeys) {
      const price = prices.find((p) => p.key === key)!
      await supabase.rpc('save_price', { p_key: key, p_type: price.type, p_label: price.label, p_price: Number(edits[key]) })
    }
    setEdits({})
    setStatus('Prix sauvegardés.')
    await load()
  }

  async function resetWeek() {
    await supabase.rpc('reset_week')
    setConfirmingReset(false)
    setStatus('Reset de la semaine effectué.')
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Card className="p-6">
        <h2 className="font-bold text-white mb-4">Tarifs</h2>
        <div className="flex flex-col gap-3">
          {prices.map((p) => (
            <div key={p.key} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold">{p.label}</div>
                <div className="text-white/30 text-xs">{p.key} · {p.type}</div>
              </div>
              <input
                type="number"
                value={edits[p.key] ?? p.price}
                onChange={(e) => setEdits((prev) => ({ ...prev, [p.key]: e.target.value }))}
                className="w-28 rounded-lg bg-white/5 border border-white/12 px-3 py-2 text-sm text-white text-right outline-none focus:border-gold/50"
              />
              {edits[p.key] !== undefined && Number(edits[p.key]) !== p.price && (
                <span className="text-gold-light text-xs shrink-0">modifié</span>
              )}
            </div>
          ))}
        </div>
        {pendingKeys.length > 0 && (
          <Button size="sm" variant="gold" onClick={savePrices} className="mt-4">
            <Save size={14} /> Sauvegarder
          </Button>
        )}
      </Card>

      <Card className="p-6 border-red-500/25">
        <h2 className="font-bold text-white mb-2 flex items-center gap-2">
          <TriangleAlert size={16} className="text-red-400" /> Reset de la semaine
        </h2>
        <p className="text-white/40 text-sm mb-4">
          Action irréversible : remet à zéro les minerais, les paiements et supprime toutes les commandes.
        </p>
        {!confirmingReset ? (
          <Button size="sm" variant="ghost" onClick={() => setConfirmingReset(true)}>Lancer le reset</Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={resetWeek}>Confirmer le reset</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmingReset(false)}>Annuler</Button>
          </div>
        )}
      </Card>

      {status && <p className="text-emerald-400 text-sm">{status}</p>}
    </div>
  )
}
