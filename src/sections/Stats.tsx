import { Reveal } from '@/components/Reveal'
import { Counter } from '@/components/Counter'

const stats = [
  { value: 12480, suffix: '+', label: 'Lingots coulés' },
  { value: 340, suffix: '', label: 'Clients livrés' },
  { value: 99, suffix: '%', label: 'Pureté du métal' },
  { value: 24, suffix: 'h', label: 'Délai moyen' },
]

export function Stats() {
  return (
    <section className="relative border-y border-white/8 bg-white/[0.02] py-14">
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <div className="font-display font-black text-3xl sm:text-4xl text-gradient-gold mb-1">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="text-white/40 text-xs uppercase tracking-[2px] font-semibold">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
