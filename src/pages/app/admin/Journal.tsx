import { useEffect, useState } from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import { supabase, type JournalEntry, type JournalCategory } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

const categoryVariant: Record<JournalCategory, 'gold' | 'ember' | 'gray'> = {
  commande: 'gold',
  paiement: 'gold',
  alerte: 'ember',
  avance: 'ember',
  reset: 'gray',
}

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('journal').select('*').order('created_at', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function clearCategory(category: 'alerte' | 'avance') {
    await supabase.rpc('clear_journal_category', { p_category: category })
    await load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display font-black text-xl text-white">Journal d'activité</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => clearCategory('alerte')}>
            <Trash2 size={13} /> Vider alertes
          </Button>
          <Button size="sm" variant="ghost" onClick={() => clearCategory('avance')}>
            <Trash2 size={13} /> Vider avances
          </Button>
          <Button size="sm" variant="ghost" onClick={load}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {entries.map((e) => (
          <Card key={e.id} className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant={categoryVariant[e.category]}>{e.category}</Badge>
              <span className="text-white font-semibold text-sm">{e.action}</span>
            </div>
            <p className="text-white/50 text-sm mb-1.5">{e.details}</p>
            <p className="text-white/25 text-xs">{new Date(e.created_at).toLocaleString('fr-FR')} · {e.utilisateur}</p>
          </Card>
        ))}
        {entries.length === 0 && <p className="text-white/30 text-center py-10">Journal vide.</p>}
      </div>
    </div>
  )
}
