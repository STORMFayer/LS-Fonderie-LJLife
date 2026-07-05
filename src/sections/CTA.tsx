import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { Embers } from '@/components/Embers'
import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/Button'

export function CTA() {
  const navigate = useNavigate()

  return (
    <section id="contact" className="relative py-28 px-5 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(217,164,65,0.16) 0%, transparent 70%)' }}
      />
      <Embers count={10} />
      <Reveal className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mb-5">
          Une commande en cours&nbsp;?
        </h2>
        <p className="text-white/50 text-lg mb-10">
          Entre ton numéro de suivi pour connaître son statut en temps réel.
        </p>
        <div className="flex items-center justify-center">
          <Button size="lg" variant="gold" onClick={() => navigate('/suivi')}>
            Suivre ma commande <MapPin size={18} />
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
