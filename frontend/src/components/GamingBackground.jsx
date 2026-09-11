import React, { useEffect, useState } from 'react';

export default function GamingBackground({ showSideBadges = false, className = '' }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }
  }, []);

  return (
    <div className={`fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none bg-[#05020a] ${className}`}>
      {/* Deep Cosmic Base Gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-[#0d0722] via-[#05020c] to-[#020005] opacity-95" />

      {/* Ambient Neon Purple & Cyan Glow Orbs */}
      <div 
        className={`absolute -top-32 -left-32 w-[280px] sm:w-[650px] h-[280px] sm:h-[650px] max-w-[100vw] rounded-full bg-purple-600/15 blur-[100px] sm:blur-[120px] ${
          reducedMotion ? '' : 'animate-pulse'
        }`}
        style={{ animationDuration: '8s' }}
      />
      <div 
        className={`absolute top-1/3 -right-32 w-[280px] sm:w-[700px] h-[280px] sm:h-[700px] max-w-[100vw] rounded-full bg-cyan-500/12 blur-[110px] sm:blur-[140px] ${
          reducedMotion ? '' : 'animate-pulse'
        }`}
        style={{ animationDuration: '10s' }}
      />
      <div 
        className={`absolute -bottom-40 left-1/4 w-[280px] sm:w-[600px] h-[280px] sm:h-[600px] max-w-[100vw] rounded-full bg-indigo-600/15 blur-[120px] sm:blur-[130px] ${
          reducedMotion ? '' : 'animate-pulse'
        }`}
        style={{ animationDuration: '12s' }}
      />

      {/* Cyber Grid Floor Accent (Bottom Glow Ring) */}
      <div className="absolute bottom-0 inset-x-0 h-36 sm:h-72 bg-gradient-to-t from-purple-950/40 via-indigo-950/10 to-transparent pointer-events-none">
        <div className="absolute bottom-0 inset-x-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[280px] sm:w-[1100px] max-w-full h-[150px] sm:h-[200px] rounded-[100%] border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.3)] pointer-events-none opacity-60" />
      </div>

      {/* Light Streak Lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      </div>

      {/* Floating Neon Particles */}
      {!reducedMotion && (
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/6 left-1/5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-pink-400 animate-ping" style={{ animationDuration: '5s' }} />
          <div className="absolute top-1/2 right-1/5 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDuration: '4.5s' }} />
        </div>
      )}

      {/* MOBILE-FRIENDLY FLOATING EDGE GAMING ICONS (Visible on Mobile & Tablet < 1280px) */}
      <div className="xl:hidden absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden">
        {/* Top-Left Floating Controller */}
        <div className={`absolute top-20 left-3 w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xs text-purple-300 ${reducedMotion ? '' : 'animate-float-slow'}`}>
          🎮
        </div>
        {/* Top-Right Floating Chess */}
        <div className={`absolute top-28 right-3 w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-xs text-cyan-300 ${reducedMotion ? '' : 'animate-float-medium'}`}>
          ♟️
        </div>
        {/* Mid-Left Floating Cards */}
        <div className={`absolute top-1/2 left-2 w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-xs text-rose-300 ${reducedMotion ? '' : 'animate-float-slow'}`}>
          🃏
        </div>
        {/* Mid-Right Floating BGMI Target */}
        <div className={`absolute top-2/3 right-3 w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-xs text-amber-300 ${reducedMotion ? '' : 'animate-float-medium'}`}>
          🎯
        </div>
        {/* Bottom-Left Floating Crown */}
        <div className={`absolute bottom-20 left-4 w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xs text-purple-300 ${reducedMotion ? '' : 'animate-float-slow'}`}>
          👑
        </div>
      </div>

      {/* DESKTOP FLOATING MULTI-GAME BADGES (Visible on >= 1280px) */}
      {showSideBadges && (
        <div className="hidden xl:block absolute inset-y-0 right-12 w-80 z-0 pointer-events-none">
          <div className="h-full flex flex-col justify-center gap-6 relative">
            {/* Badge 1: Gamepad / Joystick */}
            <div className={`p-4 rounded-2xl bg-slate-900/60 border border-purple-500/40 backdrop-blur-md shadow-xl flex items-center gap-3 w-48 ml-auto ${reducedMotion ? '' : 'animate-float-slow'}`}>
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xl text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                🎮
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-heading">CONTROLLER</span>
                <span className="text-[9px] text-cyan-300 font-mono font-semibold">1v1 & Squad</span>
              </div>
            </div>

            {/* Badge 2: Chess Knight */}
            <div className={`p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/40 backdrop-blur-md shadow-xl flex items-center gap-3 w-48 ml-12 ${reducedMotion ? '' : 'animate-float-medium'}`}>
              <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center text-xl text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                ♟️
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-heading">CHESS ARENA</span>
                <span className="text-[9px] text-purple-300 font-mono font-semibold">Strategy Duel</span>
              </div>
            </div>

            {/* Badge 3: BGMI */}
            <div className={`p-4 rounded-2xl bg-slate-900/60 border border-amber-500/40 backdrop-blur-md shadow-xl flex items-center gap-3 w-52 ml-auto ${reducedMotion ? '' : 'animate-float-slow'}`}>
              <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-400/50 flex items-center justify-center text-xl text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                🎯
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-heading">BGMI ESPORTS</span>
                <span className="text-[9px] text-amber-300 font-mono font-semibold">Battle Royale</span>
              </div>
            </div>

            {/* Badge 4: 8 Ball Pool */}
            <div className={`p-4 rounded-2xl bg-slate-900/60 border border-purple-500/40 backdrop-blur-md shadow-xl flex items-center gap-3 w-48 ml-8 ${reducedMotion ? '' : 'animate-float-medium'}`}>
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-xl text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                🎱
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-heading">8 BALL POOL</span>
                <span className="text-[9px] text-cyan-300 font-mono font-semibold">Cue Duels</span>
              </div>
            </div>

            {/* Badge 5: Cards & Crown */}
            <div className={`p-4 rounded-2xl bg-slate-900/60 border border-rose-500/40 backdrop-blur-md shadow-xl flex items-center gap-3 w-52 ml-auto ${reducedMotion ? '' : 'animate-float-slow'}`}>
              <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-400/50 flex items-center justify-center text-xl text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                👑
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-heading">HALL OF FAME</span>
                <span className="text-[9px] text-rose-300 font-mono font-semibold">Cash Rewards</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
