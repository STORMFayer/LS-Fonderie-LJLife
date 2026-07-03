import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

type BadgeVariant = 'gold' | 'ember' | 'gray'

const variants: Record<BadgeVariant, string> = {
  gold:  'bg-gold/15 text-gold-light border-gold/30',
  ember: 'bg-ember/15 text-orange-300 border-ember/30',
  gray:  'bg-white/8 text-white/60 border-white/12',
}

export function Badge({ children, variant = 'gold', className }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full tracking-[2px] uppercase border', variants[variant], className)}>
      {children}
    </span>
  )
}
