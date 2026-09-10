import React from 'react';

export default function UniversalLogo({ variant = 'header', className = '', showSubtitle = true, onClick }) {
  // Size presets: 'header', 'compact', 'login', 'footer', 'large'
  
  if (variant === 'compact' || variant === 'mobile-header') {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center gap-2 cursor-pointer select-none ${className}`}
      >
        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-purple-500/30 shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center relative overflow-hidden">
            <span className="font-heading font-black italic text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 tracking-tighter">
              DD
            </span>
            <div className="absolute -top-0.5 right-0.5 text-[8px]">👑</div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-heading font-black text-sm tracking-wider text-white leading-none">
              DD <span className="text-purple-400">GAMING</span>
            </span>
          </div>
          <span className="text-[8px] font-subheading font-extrabold text-cyan-400 tracking-widest uppercase leading-none mt-0.5">
            TOURNAMENT
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'login') {
    return (
      <div onClick={onClick} className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Glowing Crown Emblem */}
        <div className="relative mb-2">
          {/* Crown */}
          <div className="text-cyan-400 text-lg sm:text-xl animate-bounce -mb-1 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
            👑
          </div>
          
          {/* Futuristic DD Box */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-2xl shadow-purple-500/40 relative">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden border border-white/10">
              <span className="font-heading font-black italic text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-indigo-300 tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
                DD
              </span>
              {/* Corner Sci-fi Accents */}
              <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-cyan-400/80" />
              <div className="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-purple-400/80" />
            </div>
          </div>
        </div>

        {/* Title Text */}
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wider leading-tight">
          DD <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">GAMING</span>
        </h2>
        <span className="font-heading font-extrabold text-xs sm:text-sm text-cyan-400 tracking-[0.3em] uppercase mt-0.5">
          TOURNAMENT
        </span>
        {showSubtitle && (
          <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase mt-1">
            Play &bull; Compete &bull; Win
          </p>
        )}
      </div>
    );
  }

  // Default 'header' / 'standard'
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer select-none group ${className}`}
    >
      <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform duration-300 shrink-0">
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden border border-white/10">
          <span className="font-heading font-black italic text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 tracking-tighter">
            DD
          </span>
          <div className="absolute -top-0.5 right-0.5 text-[9px]">👑</div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-heading font-extrabold text-lg sm:text-xl tracking-wider text-white">
            DD <span className="text-purple-400">GAMING</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[9px] sm:text-[10px] font-bold text-cyan-300 uppercase tracking-widest hidden sm:inline-block">
            ESPORTS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-subheading font-extrabold text-cyan-400 tracking-[0.2em] uppercase leading-none">
            TOURNAMENT
          </span>
          {showSubtitle && (
            <span className="hidden md:inline-block text-[9px] text-slate-400 tracking-wider font-semibold">
              • PLAY &bull; COMPETE &bull; WIN
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
