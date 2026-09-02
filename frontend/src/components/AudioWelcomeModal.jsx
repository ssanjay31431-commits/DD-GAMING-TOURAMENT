import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AudioWelcomeModal() {
  const { showAudioModal, setShowAudioModal, setSoundActiveState } = useApp();

  if (!showAudioModal) return null;

  const handleEnableAudio = () => {
    localStorage.setItem('dd_audio_choice', 'enabled');
    setSoundActiveState(true);
    setShowAudioModal(false);
  };

  const handleDisableAudio = () => {
    localStorage.setItem('dd_audio_choice', 'disabled');
    setSoundActiveState(false);
    setShowAudioModal(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        {/* Darkened Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-8 shadow-2xl z-10 text-center space-y-6 overflow-hidden"
        >
          {/* Top Neon Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <span className="text-3xl animate-bounce">🎱</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 tracking-wider">
              AUDIO EXPERIENCE
            </span>
            <h2 className="font-heading font-black text-2xl text-white tracking-wide">
              ENABLE SOUND EFFECTS?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Experience DD GAMING with 8 Ball Pool cue hit sounds, victory chimes, and interactive audio feedback.
            </p>
          </div>

          {/* Choices */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleEnableAudio}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Volume2 className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" />
              Enable Sound Effects 🔊
            </button>

            <button
              onClick={handleDisableAudio}
              className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <VolumeX className="w-4 h-4 text-slate-500" />
              Continue In Silent Mode 🔇
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            You can also toggle sound effects anytime using the SFX button in the navbar.
          </p>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
