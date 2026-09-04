import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginSuccessTransitionModal() {
  const { authTransitionUser, finishAuthTransition } = useApp();

  // Animation Stage Tracker: 0 = Black, 1 = BuildUp, 2 = Welcome, 3 = DD GAMING, 4 = Sweep, 5 = Exit
  const [stage, setStage] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsReducedMotion(true);
    }
  }, []);

  useEffect(() => {
    if (!authTransitionUser) {
      setStage(0);
      return;
    }

    setStage(0);
    const timers = [];

    if (isReducedMotion) {
      // Fast track for reduced motion users
      timers.push(setTimeout(() => setStage(3), 300));
      timers.push(setTimeout(() => finishAuthTransition(), 1600));
      return () => timers.forEach(clearTimeout);
    }

    // SCENE 1 (0.0s – 0.7s): Pure Black + Subtle Sparks
    // SCENE 2 (0.7s): Energy Build-Up (Esports Radial Glow)
    timers.push(setTimeout(() => setStage(1), 700));

    // SCENE 3 (1.3s): "WELCOME TO" text reveals
    timers.push(setTimeout(() => setStage(2), 1300));

    // SCENE 4 (1.7s): "DD GAMING" dramatic reveal + logo animation
    timers.push(setTimeout(() => setStage(3), 1700));

    // SCENE 5 (2.7s): Cinematic Light Sweep across text
    timers.push(setTimeout(() => setStage(4), 2700));

    // SCENE 6 (3.2s): Smooth transition exit & reveal website
    timers.push(setTimeout(() => setStage(5), 3200));

    // 3.6s: Complete transition & unmount
    timers.push(setTimeout(() => {
      finishAuthTransition();
    }, 3600));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [authTransitionUser, isReducedMotion]);

  if (!authTransitionUser) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-welcome-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 5 ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        onClick={() => finishAuthTransition()}
        className="fixed inset-0 z-[100] bg-[#020005] overflow-hidden flex flex-col items-center justify-center pointer-events-auto select-none font-heading cursor-pointer touch-manipulation"
      >
        {/* Background Ambient Radial Energy Glow (Scene 2+) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: stage >= 1 ? (stage === 5 ? 0 : 0.85) : 0,
            scale: stage >= 1 ? 1.2 : 0.5
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-to-tr from-purple-900/50 via-indigo-900/40 to-cyan-500/30 blur-3xl pointer-events-none"
        />

        {/* Minimal Sparkling Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          <div className="absolute top-2/3 right-1/4 w-1 h-1 rounded-full bg-cyan-300 animate-pulse" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-indigo-400/80 blur-[1px] animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        {/* Central Content Container */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-4">
          
          {/* SCENE 4 LOGO REVEAL */}
          <AnimatePresence>
            {stage >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2 flex items-center justify-center"
              >
                {/* Glowing Outer Spinning Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/60 animate-spin-slow" />
                <div className="absolute inset-2 rounded-full border-2 border-cyan-400/40 animate-reverse-spin" />
                
                {/* 8 Ball / DD Gaming Logo Emblem */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shadow-inner">
                    <span className="font-heading font-black text-xs sm:text-sm text-slate-950">8</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 3: "WELCOME TO" */}
          <AnimatePresence>
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <span className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-[0.4em] sm:tracking-[0.6em] text-purple-300/90 font-heading drop-shadow">
                  WELCOME TO
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCENE 4 & 5: "DD GAMING" DRAMATIC REVEAL & LIGHT SWEEP */}
          <AnimatePresence>
            {stage >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: [0.75, 1.05, 1] }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden py-2"
              >
                <h1
                  className="font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-indigo-300 tracking-tight leading-none drop-shadow-[0_0_40px_rgba(168,85,247,0.8)]"
                  style={{ fontSize: 'clamp(2.4rem, 8.5vw, 5.5rem)' }}
                >
                  DD GAMING
                </h1>

                {/* SCENE 5: LIGHT SWEEP BEAM */}
                {stage >= 4 && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBTITLE BADGE */}
          <AnimatePresence>
            {stage >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/40 backdrop-blur-md text-[11px] sm:text-xs font-extrabold uppercase text-cyan-300 tracking-widest shadow-lg shadow-purple-500/20"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>ESPORTS TOURNAMENT ARENA</span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
