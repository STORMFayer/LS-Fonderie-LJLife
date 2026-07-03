import { Pickaxe, Flame, Hammer, Truck } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { Badge } from '@/components/ui/Badge'

const steps = [
  { icon: Pickaxe, title: 'Extraction', desc: 'Le minerai brut est extrait et trié directement sur nos sites partenaires.' },
  { icon: Flame, title: 'Fusion', desc: 'Chauffé à plus de 1500°C dans nos hauts fourneaux jusqu’à l’état liquide.' },
  { icon: Hammer, title: 'Forgeage', desc: 'Moulé et martelé à la main pour garantir densité et solidité maximales.' },
  { icon: Truck, title: 'Livraison', desc: 'Contrôle qualité final puis expédition sécurisée vers votre point de collecte.' },
]

export function Process() {
  return (
    <section id="process" className="relative py-28 px-5 bg-white/[0.015]">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <Badge variant="gold" className="mb-4">Savoir-faire</Badge>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            De la mine à la livraison
          </h2>
        </Reveal>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-[#8a6d24] flex items-center justify-center mb-5 shadow-[0_8px_30px_rgba(201,168,76,0.35)]">
                <s.icon className="text-amber-950" size={26} />
              </div>
              <span className="text-gold-light font-display font-black text-xs tracking-[3px] uppercase mb-2">
                0{i + 1}
              </span>
              <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed max-w-[220px]">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
