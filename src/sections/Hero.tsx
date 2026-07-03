import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Embers } from '@/components/Embers'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import logo from '@/assets/logo.png'
import lingot from '@/assets/lingot.png'

export function Hero() {
  const navigate = useNavigate()

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-5 pt-20"
      style={{
        background: `
          radial-gradient(ellipse 70% 55% at 50% 20%, rgba(217,164,65,0.22) 0%, rgba(217,164,65,0) 55%),
          linear-gradient(168deg, #15110b 0%, #191510 30%, #0b0d12 75%, #0b0d12 100%)
        `,
      }}
    >
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]" />
      <div
        className="absolute left-1/2 -bottom-12 -translate-x-1/2 w-[130%] h-3/4 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,128,42,0.25) 0%, transparent 62%)', animation: 'forge-breath 7s ease-in-out infinite' }}
      />
      <Embers />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center max-w-3xl"
      >
        <img src={logo} alt="LS Fonderie" className="w-20 h-20 object-contain mb-6 animate-float drop-shadow-xl" />

        <Badge variant="gold" className="mb-5">Artisans du métal depuis 2024</Badge>

        <h1 className="font-display font-black text-[44px] sm:text-[64px] leading-[1.02] tracking-[-2px] text-white mb-5">
          Le métal brut,<br />
          <span className="text-gradient-gold">forgé pour durer.</span>
        </h1>

        <p className="text-white/50 text-base sm:text-lg max-w-xl mb-9 leading-relaxed">
          Lingots, plaques et pièces sur mesure — coulés à la main dans notre forge et
          livrés partout, sans compromis sur la qualité.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" variant="gold" onClick={() => navigate('/commander')}>
            Commander un lingot <ArrowRight size={18} />
          </Button>
          <Button size="lg" variant="ghost" onClick={() => document.querySelector('#produits')?.scrollIntoView({ behavior: 'smooth' })}>
            Voir le catalogue
          </Button>
        </div>
      </motion.div>

      <motion.img
        src={lingot}
        alt=""
        aria-hidden
        className="hidden lg:block absolute right-[8%] top-[30%] w-40 h-40 object-contain drop-shadow-2xl z-10"
        animate={{ y: [0, -18, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute bottom-8 z-10 flex flex-col items-center gap-1 text-white/30"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] uppercase tracking-[3px]">Découvrir</span>
        <ChevronDown size={18} />
      </motion.div>
    </section>
  )
}
