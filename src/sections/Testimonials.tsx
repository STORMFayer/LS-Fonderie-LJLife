import { Star } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

const reviews = [
  { name: 'Marco T.', role: 'Client industriel', text: 'Livraison ultra rapide et qualité constante. LS Fonderie est devenu notre fournisseur principal.' },
  { name: 'Aline R.', role: 'Revendeuse', text: 'Le service de suivi de commande est top, je sais toujours où en est mon colis.' },
  { name: 'Kevin D.', role: 'Artisan métallier', text: 'Les plaques céramiques tiennent des charges thermiques que personne d’autre ne propose.' },
  { name: 'Sofia M.', role: 'Client particulier', text: 'Commande simple, prix honnête, produit impeccable. Je recommande.' },
  { name: 'Yanis B.', role: 'Grossiste', text: 'Volumes importants livrés dans les temps, sans aucune casse.' },
]

function ReviewCard({ r }: { r: (typeof reviews)[number] }) {
  return (
    <Card className="p-6 w-80 shrink-0 mx-3">
      <div className="flex gap-0.5 mb-3 text-gold">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
      </div>
      <p className="text-white/70 text-sm leading-relaxed mb-4">“{r.text}”</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-[#8a6d24] flex items-center justify-center text-amber-950 font-bold text-xs">
          {r.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <div className="text-white text-sm font-bold">{r.name}</div>
          <div className="text-white/40 text-xs">{r.role}</div>
        </div>
      </div>
    </Card>
  )
}

export function Testimonials() {
  return (
    <section id="avis" className="relative py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5">
        <Reveal className="text-center mb-16">
          <Badge variant="ember" className="mb-4">Témoignages</Badge>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Ils nous font confiance
          </h2>
        </Reveal>
      </div>

      <div className="relative [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="marquee-track">
          {[...reviews, ...reviews].map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      </div>
    </section>
  )
}
