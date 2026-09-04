import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, CheckCircle2, ArrowRight, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export default function WelcomeAnimationModal() {
  const { welcomeAnimationUser, closeWelcomeAnimation, navigateTo } = useApp();

  useEffect(() => {
    if (welcomeAnimationUser) {
      // Fire celebration confetti fireworks!
      try {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 }
        });
      } catch (e) {}
    }
  }, [welcomeAnimationUser]);

  if (!welcomeAnimationUser) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
        {/* Darkened Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeWelcomeAnimation}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="relative w-full max-w-lg bg-slate-900 border-2 border-purple-500/50 rounded-3xl p-8 shadow-2xl z-10 text-center space-y-6 overflow-hidden text-slate-100"
        >
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

          {/* Floating 3D Trophy Badge */}
          <div className="relative w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-1 shadow-2xl shadow-purple-500/40 animate-float-3d flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center">
              <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            </div>
          </div>

          {/* Animated Titles */}
          <div className="space-y-3">
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1.5 shadow-lg shadow-purple-500/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              FIRST LOGIN EXPERIENCE 🎉
            </span>

            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-wide">
              WELCOME TO <span className="text-gradient-purple">DD GAMING</span>
            </h2>

            <div className="space-y-1 pt-1">
              <p className="font-heading font-extrabold text-xl text-purple-300">
                Welcome, {welcomeAnimationUser.name}! 👋
              </p>
              <p className="text-sm text-cyan-300 font-semibold">
                Your tournament journey starts now.
              </p>
              <p className="text-xs text-slate-300 font-medium">
                Get ready to compete in 1v1 8 Ball Pool duels.
              </p>
            </div>
          </div>

          {/* Player Ticket Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Authenticated Account:</span>
              <span className="font-mono text-cyan-300 font-bold">{welcomeAnimationUser.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Player ID Tag:</span>
              <span className="font-mono text-emerald-400 font-bold">{welcomeAnimationUser.playerId}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Platform Status:</span>
              <span className="font-bold text-purple-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Authenticated Competitor
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-2 space-y-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                closeWelcomeAnimation();
                navigateTo('tournaments');
              }}
              className="w-full py-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-sm uppercase tracking-wider shadow-2xl shadow-purple-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer touch-manipulation active:scale-95"
            >
              Enter Tournament Dashboard 🚀
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
