import { Globe, MessageCircle, Mail } from 'lucide-react'
import logo from '@/assets/logo.png'

export function Footer() {
  return (
    <footer className="relative border-t border-white/8 bg-[#08090d] py-12 px-5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="LS Fonderie" className="w-7 h-7 object-contain" />
          <span className="font-display font-bold text-white">LS Fonderie</span>
          <span className="text-white/30 text-xs ml-2">© {new Date().getFullYear()} — Tous droits réservés</span>
        </div>

        <div className="flex items-center gap-3">
          {[Globe, MessageCircle, Mail].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-gold/50 hover:bg-gold/10 transition-colors"
            >
              <Icon size={15} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
