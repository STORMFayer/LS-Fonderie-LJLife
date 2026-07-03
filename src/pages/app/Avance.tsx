import { useState, type FormEvent } from 'react'
import { CreditCard } from 'lucide-react'
import { supabase, MAX_AVANCE } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SuccessModal } from '@/components/SuccessModal'

export function Avance() {
  const [montant, setMontant] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const value = Number(montant)
  const tooHigh = value > MAX_AVANCE

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!value || value <= 0 || tooHigh) {
      setError(`Montant invalide (max ${MAX_AVANCE.toLocaleString('fr-FR')} $).`)
      return
    }
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.rpc('request_avance', { p_montant: value, p_message: message })
    setSubmitting(false)
    if (error) {
      setError("Impossible d'envoyer la demande.")
      return
    }
    setSuccess(true)
    setMontant('')
    setMessage('')
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-8">
        <h1 className="font-display font-black text-xl text-white mb-1 text-center">Demande d'avance</h1>
        <p className="text-white/40 text-sm mb-6 text-center">Demande une avance sur ton salaire à venir.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase tracking-[2px] text-white/40 font-semibold mb-1.5 block">Montant ($)</label>
            <input
              type="number"
              min={1}
              max={MAX_AVANCE}
              required
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="Ex: 5000"
              className="w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50 transition-colors"
            />
            {tooHigh && <p className="text-amber-400 text-xs mt-1.5">Max autorisé : {MAX_AVANCE.toLocaleString('fr-FR')} $</p>}
          </div>

          <div>
            <label className="text-xs uppercase tracking-[2px] text-white/40 font-semibold mb-1.5 block">Message (optionnel)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Raison de la demande..."
              className="w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold/50 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button type="submit" variant="gold" size="lg" disabled={submitting || tooHigh} className="w-full">
            <CreditCard size={16} /> {submitting ? 'Envoi...' : 'Envoyer la demande'}
          </Button>
        </form>
      </Card>

      <SuccessModal open={success} title="Demande envoyée" onClose={() => setSuccess(false)}>
        Ta demande d'avance a été transmise à l'administration.
      </SuccessModal>
    </div>
  )
}
