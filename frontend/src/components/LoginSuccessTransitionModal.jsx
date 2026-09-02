import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Sparkles, Gamepad2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginSuccessTransitionModal() {
  const { authTransitionUser, finishAuthTransition } = useApp();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('VERIFYING COMPETITOR CREDENTIALS...');

  useEffect(() => {
    if (authTransitionUser) {
      setProgress(0);
      setStatusText('VERIFYING COMPETITOR CREDENTIALS...');

      const timer1 = setTimeout(() => {
        setProgress(45);
        setStatusText('CONNECTING TO DD GAMING 8 BALL ARENA...');
      }, 600);

      const timer2 = setTimeout(() => {
        setProgress(85);
        setStatusText(`WELCOME, ${(authTransitionUser.name || 'PLAYER').toUpperCase()}! LAUNCHING...`);
      }, 1200);

      const timer3 = setTimeout(() => {
        setProgress(100);
        finishAuthTransition();
      }, 1800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [authTransitionUser]);

  if (!authTransitionUser) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        {/* Deep Cyberpunk Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl"
        />

        {/* Floating Arena Portal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md bg-slate-900/90 border border-purple-500/40 rounded-3xl p-8 shadow-2xl z-10 text-center space-y-6 overflow-hidden text-slate-100"
        >
          {/* Glowing Ambient Backdrop Rings */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

          {/* Rotating Cyber Ring & Animated 8 Ball Center */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Outer Spinning Neon Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/60 animate-spin-slow" />
            <div className="absolute inset-2 rounded-full border-2 border-cyan-400/40 animate-reverse-spin" />

            {/* Glowing 8-Ball Icon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-16 h-16 rounded-full bg-slate-950 border-2 border-purple-500 shadow-xl shadow-purple-500/40 flex items-center justify-center relative"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-inner">
                <span className="font-heading font-black text-sm text-slate-950">8</span>
              </div>
            </motion.div>
          </div>

          {/* Titles & Status */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold uppercase tracking-widest">
              <CheckCircle2 className="w-3.5 h-3.5" /> Authentication Verified
            </div>

            <h3 className="font-heading font-black text-2xl text-white tracking-wide">
              DD GAMING <span className="text-gradient-purple">ARENA</span>
            </h3>

            <p className="text-xs font-mono font-bold text-cyan-300 tracking-wider h-5 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              {statusText}
            </p>
          </div>

          {/* Laser Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="w-full h-3 bg-slate-950 rounded-full p-0.5 border border-white/10 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-cyan-400 to-emerald-400 shadow-lg shadow-cyan-500/50"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 px-1">
              <span>SECURITY LOG: PASS</span>
              <span className="text-purple-300">{progress}%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
