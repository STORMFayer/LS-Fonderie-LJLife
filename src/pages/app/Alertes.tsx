import { useState, type FormEvent } from 'react'
import { TriangleAlert } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SuccessModal } from '@/components/SuccessModal'
import { cn } from '@/lib/utils'

type Level = 'faible' | 'critique'

const items = [
  { key: 'plats', emoji: '🍽️', label: 'Plats' },
  { key: 'boissons', emoji: '🥤', label: 'Boissons' },
  { key: 'kit_repa', emoji: '🔧', label: 'Kit de réparation' },
  { key: 'kit_nettoy', emoji: '🧹', label: 'Kit de nettoyage' },
  { key: 'pioches', emoji: '⛏️', label: 'Pioches' },
]

export function Alertes() {
  const [levels, setLevels] = useState<Record<string, Level>>({})
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  function cycle(key: string) {
    setLevels((prev) => {
      const next = { ...prev }
      if (!next[key]) next[key] = 'faible'
      else if (next[key] === 'faible') next[key] = 'critique'
      else delete next[key]
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const selected = Object.entries(levels)
    if (selected.length === 0 && !note.trim()) {
      setError('Sélectionne au moins un article ou ajoute une note.')
      return
    }

    const parts = selected.map(([key, level]) => {
      const item = items.find((i) => i.key === key)!
      return `${item.emoji} ${item.label} — niveau ${level}`
    })
    if (note.trim()) parts.push(`Note: "${note.trim()}"`)
    const details = parts.join(' | ')

    setSubmitting(true)
    setError(null)
    const { error } = await supabase.rpc('report_alerte', { p_details: details })
    setSubmitting(false)
    if (error) {
      setError("Impossible d'envoyer l'alerte.")
      return
    }
    setSuccess(true)
    setLevels({})
    setNote('')
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-8">
        <h1 className="font-display font-black text-xl text-white mb-1 text-center">Alerte stock</h1>
        <p className="text-white/40 text-sm mb-6 text-center">Clique un article: 1x faible, 2x critique, 3x annuler.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-2">
            {items.map((item) => {
              const level = levels[item.key]
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => cycle(item.key)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold transition-colors',
                    !level && 'bg-white/5 border-white/12 text-white/60 hover:bg-white/8',
                    level === 'faible' && 'bg-amber-500/15 border-amber-500/40 text-amber-300',
                    level === 'critique' && 'bg-red-500/15 border-red-500/40 text-red-300',
                  )}
                >
                  <span>{item.emoji} {item.label}</span>
                  {level && <span className="text-xs uppercase tracking-[1.5px]">{level}</span>}
                </button>
              )
            })}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Note additionnelle (optionnel)"
            className="w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50 transition-colors resize-none"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button type="submit" variant="gold" size="lg" disabled={submitting} className="w-full">
            <TriangleAlert size={16} /> {submitting ? 'Envoi...' : "Signaler l'alerte"}
          </Button>
        </form>
      </Card>

      <SuccessModal open={success} title="Alerte envoyée" onClose={() => setSuccess(false)}>
        L'administration a été notifiée du manque de stock.
      </SuccessModal>
    </div>
  )
}
