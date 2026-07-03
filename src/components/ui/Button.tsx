import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-gradient-to-br from-[#e8c96d] to-[#c9a84c] text-amber-950 shadow-[0_4px_20px_rgba(201,168,76,0.35)] hover:shadow-[0_10px_40px_rgba(201,168,76,0.55)] hover:-translate-y-0.5': variant === 'gold',
            'bg-white/5 text-white/80 border border-white/12 backdrop-blur hover:bg-white/10 hover:text-white hover:border-white/25': variant === 'ghost',
            'bg-transparent text-white border border-gold/50 hover:bg-gold/10 hover:border-gold': variant === 'outline',
          },
          {
            'px-4 py-2 text-xs': size === 'sm',
            'px-6 py-3 text-sm': size === 'md',
            'px-8 py-4 text-base': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
