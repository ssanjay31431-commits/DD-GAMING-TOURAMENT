import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm w-full px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-purple-950/90 border-purple-500/50 text-purple-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-6 h-6 text-purple-400 shrink-0" />}
            <span className="text-sm font-semibold flex-1">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
