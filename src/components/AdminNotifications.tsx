import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Package, TriangleAlert, X } from 'lucide-react'
import { supabase, type JournalEntry } from '@/lib/supabase'

interface Toast extends JournalEntry {
  toastId: number
}

const TOAST_DURATION = 8000

export function AdminNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const channel = supabase
      .channel('admin-journal-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'journal' },
        (payload) => {
          const entry = payload.new as JournalEntry
          if (entry.category !== 'commande' && entry.category !== 'alerte') return

          const toastId = Date.now() + Math.random()
          setToasts((prev) => [...prev, { ...entry, toastId }])
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.toastId !== toastId))
          }, TOAST_DURATION)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  function dismiss(toastId: number) {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId))
  }

  function handleClick(toast: Toast) {
    dismiss(toast.toastId)
    navigate(toast.category === 'commande' ? '/admin/orders' : '/admin/journal')
  }

  return (
    <div className="fixed top-20 right-5 z-[100] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.toastId}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto rounded-xl border border-white/10 bg-[#14171f]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-4 cursor-pointer"
            onClick={() => handleClick(t)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  t.category === 'commande' ? 'bg-gold/15 text-gold-light' : 'bg-ember/15 text-orange-300'
                }`}
              >
                {t.category === 'commande' ? <Package size={15} /> : <TriangleAlert size={15} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-bold">{t.action}</div>
                <div className="text-white/50 text-xs mt-0.5 line-clamp-2">{t.details}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  dismiss(t.toastId)
                }}
                className="shrink-0 text-white/30 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
