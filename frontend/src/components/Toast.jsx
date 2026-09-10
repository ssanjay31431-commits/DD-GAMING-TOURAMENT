import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[250] pointer-events-none w-[min(92vw,420px)] max-w-[calc(100vw-24px)] px-2">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`pointer-events-auto flex items-start sm:items-center gap-3 p-3.5 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-xl max-h-[70vh] overflow-y-auto break-words overflow-wrap-anywhere ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100 shadow-emerald-900/40'
                : toast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/60 text-rose-100 shadow-rose-900/40'
                : 'bg-purple-950/95 border-purple-500/60 text-purple-100 shadow-purple-900/40'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 sm:mt-0" />}
            <span className="text-xs sm:text-sm font-semibold flex-1 leading-snug break-words overflow-wrap-anywhere">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
