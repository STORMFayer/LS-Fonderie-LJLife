import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { ReactNode } from 'react'

export function SuccessModal({
  open, title, children, onClose,
}: { open: boolean; title: string; children?: ReactNode; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="p-8 max-w-sm text-center">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
              <h3 className="font-display font-black text-xl text-white mb-2">{title}</h3>
              <div className="text-white/50 text-sm mb-6">{children}</div>
              <Button variant="gold" size="md" onClick={onClose} className="w-full">
                Fermer
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
