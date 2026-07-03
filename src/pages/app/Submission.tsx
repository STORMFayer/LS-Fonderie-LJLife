import { useState, type FormEvent } from 'react'
import { Hammer } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SuccessModal } from '@/components/SuccessModal'
import lingot from '@/assets/lingot.png'

export function Submission() {
  const { refreshEmployee } = useAuth()
  const [qty, setQty] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<number | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = Number(qty)
    if (!value || value <= 0) {
      setError('Quantité invalide.')
      return
    }
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.rpc('add_submission', { p_minerais: value })
    setSubmitting(false)
    if (error) {
      setError("Impossible d'enregistrer la soumission.")
      return
    }
    setSuccess(value)
    setQty('')
    await refreshEmployee()
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-8 text-center">
        <img src={lingot} alt="" className="w-24 h-24 object-contain mx-auto mb-5 drop-shadow-xl" />
        <h1 className="font-display font-black text-xl text-white mb-1">Soumettre du minerai</h1>
        <p className="text-white/40 text-sm mb-6">Déclare la quantité de minerai raffiné livrée à la forge.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="number"
            min={1}
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Ex: 320"
            className="w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-3 text-center text-lg font-bold text-white outline-none focus:border-gold/50 transition-colors"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <Button type="submit" variant="gold" size="lg" disabled={submitting} className="w-full">
            <Hammer size={16} /> {submitting ? 'Envoi...' : 'Soumettre'}
          </Button>
        </form>
      </Card>

      <SuccessModal open={success !== null} title="Minerai soumis !" onClose={() => setSuccess(null)}>
        {success} minerais ont été ajoutés à ton total.
      </SuccessModal>
    </div>
  )
}
