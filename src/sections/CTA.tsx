import { ArrowRight } from 'lucide-react'
import { Embers } from '@/components/Embers'
import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/Button'

export function CTA() {
  return (
    <section id="contact" className="relative py-28 px-5 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(217,164,65,0.16) 0%, transparent 70%)' }}
      />
      <Embers count={10} />
      <Reveal className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mb-5">
          Prêt à passer commande&nbsp;?
        </h2>
        <p className="text-white/50 text-lg mb-10">
          Contactez la forge et recevez votre devis en moins de 24h.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="gold"
            onClick={() => (window.location.href = 'mailto:contact@ls-fonderie.dev')}
          >
            Nous contacter <ArrowRight size={18} />
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.querySelector('#produits')?.scrollIntoView({ behavior: 'smooth' })}>
            Voir les tarifs
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
