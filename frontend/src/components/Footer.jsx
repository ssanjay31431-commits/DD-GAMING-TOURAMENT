import React from 'react';
import { Trophy, Gamepad2, ShieldCheck, Heart, Sparkles, Send, Twitter, Instagram, Youtube, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { navigateTo, isLoggedIn } = useApp();

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/80 pt-12 pb-10 overflow-hidden text-slate-400">
      {/* Footer Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 gap-8 pb-8 border-b border-slate-800/60 ${isLoggedIn ? 'md:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-2'}`}>
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-heading font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    DD
                  </span>
                </div>
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl text-white tracking-wider">
                  DD <span className="text-purple-400">GAMING</span>
                </span>
                <p className="text-[10px] font-subheading font-bold text-slate-400 tracking-widest uppercase">
                  DD TOURNAMENT ORGANISING
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Community gaming tournament platform focused on easy registration, competitive matches, fixed slots, and transparent prizes.
            </p>

            <div className="pt-1 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
                PLAY • COMPETE • WIN
              </span>
            </div>
          </div>

          {/* Nav Links - Shown when logged in */}
          {isLoggedIn && (
            <>
              <div>
                <h4 className="font-heading font-bold text-white text-base mb-4 tracking-wide uppercase">
                  Quick Links
                </h4>
                <ul className="space-y-2.5 text-sm">
                  <li>
                    <button onClick={() => navigateTo('home')} className="hover:text-purple-400 transition-colors">
                      Home
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('tournaments')} className="hover:text-purple-400 transition-colors">
                      Browse Tournaments
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('games')} className="hover:text-purple-400 transition-colors">
                      Supported Games
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('leaderboard')} className="hover:text-purple-400 transition-colors">
                      Player Leaderboard
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('winners')} className="hover:text-purple-400 transition-colors">
                      Winners Hall of Fame
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-heading font-bold text-white text-base mb-4 tracking-wide uppercase">
                  Games Ecosystem
                </h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-1.5 font-bold text-purple-300">
                    <span>🎱</span> 8 Ball Pool <span className="text-[9px] bg-purple-500/30 px-1.5 py-0.2 rounded text-purple-200">MAIN GAME</span>
                  </li>
                  <li className="flex items-center gap-1.5 opacity-60">
                    <span>🎯</span> BGMI (Expansion)
                  </li>
                  <li className="flex items-center gap-1.5 opacity-60">
                    <span>🔥</span> Free Fire (Expansion)
                  </li>
                  <li className="flex items-center gap-1.5 opacity-60">
                    <span>♟</span> Chess (Expansion)
                  </li>
                  <li className="flex items-center gap-1.5 opacity-60">
                    <span>🎲</span> Ludo King (Expansion)
                  </li>
                  <li className="flex items-center gap-1.5 opacity-60">
                    <span>🥏</span> Carrom Pool (Expansion)
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Social Channels & Policies */}
          <div>
            <h4 className="font-heading font-bold text-white text-base mb-4 tracking-wide uppercase">
              Highlights & Channels
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Official winners, match highlights, and seasonal rankings are published on Instagram and YouTube!
            </p>

            <div className="flex items-center gap-3 mb-4">
              <a href="#instagram" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-pink-400 hover:border-pink-500/40 transition-all">
                <Instagram className="w-4 h-4 text-pink-400" /> Instagram
              </a>
              <a href="#youtube" onClick={(e) => e.preventDefault()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-rose-400 hover:border-rose-500/40 transition-all">
                <Youtube className="w-4 h-4 text-rose-400" /> YouTube
              </a>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <p>Contact: <span className="text-purple-300 font-mono">support@ddgaming.com</span></p>
            </div>
          </div>

        </div>

        {/* Footer Bottom Legal & Compliance */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DD GAMING / DD Tournament Organising. All Rights Reserved. Play • Compete • Win.</p>
          {isLoggedIn && (
            <div className="flex items-center gap-4 text-[11px]">
              <a href="#rules" onClick={(e) => { e.preventDefault(); navigateTo('rules'); }} className="hover:text-slate-300 transition-colors">
                Refund & Cancellation Terms
              </a>
              <span>•</span>
              <a href="#eligibility" onClick={(e) => { e.preventDefault(); navigateTo('rules'); }} className="hover:text-slate-300 transition-colors">
                Eligibility & Dispute Handling
              </a>
            </div>
          )}
        </div>

      </div>
    </footer>
  );
}
