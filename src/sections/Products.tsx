import { motion } from 'framer-motion'
import { Reveal } from '@/components/Reveal'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import lingot from '@/assets/lingot.png'

const products = [
  { img: lingot, name: 'Lingot de fer', price: '130 $', desc: 'Coulé et raffiné à la main, pureté garantie.' },
]

export function Products() {
  return (
    <section id="produits" className="relative py-28 px-5">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <Badge variant="ember" className="mb-4">Catalogue</Badge>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mb-4">
            Notre production
          </h2>
          <p className="text-white/45 max-w-lg mx-auto">
            Chaque pièce sort de la forge avec le même niveau d'exigence : contrôle qualité, finition, et livraison rapide.
          </p>
        </Reveal>

        <div className="flex justify-center">
          {products.map((p, i) => (
            <Reveal key={p.name} delay={(i % 3) * 0.1} className="w-full max-w-sm">
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <Card className="card-glow p-6 h-full flex flex-col group">
                  <div className="relative rounded-xl bg-gradient-to-br from-white/8 to-transparent p-6 mb-5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,155,61,0.25), transparent 70%)' }} />
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-28 h-28 object-contain relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                      style={{ transform: 'translate(3%, -2%)' }}
                    />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1.5">{p.name}</h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-4 flex-1">{p.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/8">
                    <span className="font-display font-black text-xl text-gradient-gold">{p.price}</span>
                    <span className="text-[11px] uppercase tracking-[2px] text-white/30 font-semibold">/ unité</span>
                  </div>
                </Card>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
