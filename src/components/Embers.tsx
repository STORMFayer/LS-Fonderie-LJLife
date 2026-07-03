import { useEffect, useRef } from 'react'

interface EmberConfig { color?: string; count?: number; className?: string }

export function Embers({ color = '#ffe6a8,#ff9b3d', count = 18, className }: EmberConfig) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const colors = color.split(',')

    for (let i = 0; i < count; i++) {
      const e = document.createElement('div')
      const size = Math.random() * 6 + 3
      e.style.cssText = `
        position:absolute; bottom:-14px; border-radius:50%; pointer-events:none; opacity:0;
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        background: radial-gradient(circle at 50% 50%, ${colors[0]} 0%, ${colors[1] ?? colors[0]} 45%, transparent 72%);
        animation: ember-rise ${Math.random() * 4 + 3}s linear ${Math.random() * 5}s infinite;
      `
      el.appendChild(e)
    }
    return () => { el.innerHTML = '' }
  }, [color, count])

  return <div ref={ref} className={`absolute inset-0 overflow-hidden pointer-events-none z-[1] ${className ?? ''}`} />
}
