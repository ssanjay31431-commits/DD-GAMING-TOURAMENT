import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Bell, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Games() {
  const { games, navigateTo, showToast } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 overflow-hidden">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
          <Gamepad2 className="w-3.5 h-3.5" /> MULTI-GAME ECOSYSTEM
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
          SUPPORTED GAMES
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Version 1 features <strong>8 Ball Pool</strong> daily tournaments with active cash prize pools. Other esports titles are launching next!
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className={`p-8 rounded-3xl bg-gradient-to-b ${game.bgGradient} border ${game.borderColor} glass-panel space-y-6 relative overflow-hidden flex flex-col justify-between shadow-2xl`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center text-4xl shadow-inner animate-pulse-glow">
                  {game.icon}
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  game.status.includes('Active')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {game.status}
                </span>
              </div>

              <h3 className="font-heading font-black text-2xl text-white">
                {game.name}
              </h3>
              <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${game.accentColor}`}>
                {game.category}
              </p>

              <p className="text-xs text-slate-300 leading-relaxed mt-3">
                {game.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Tournaments Status:</span>
                <span className="font-mono text-purple-300 text-sm">
                  {game.activeTournamentsCount > 0 ? `${game.activeTournamentsCount} Active` : 'Expansion Phase'}
                </span>
              </div>

              {game.status.includes('Active') ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('tournaments')}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
                >
                  View 8 Ball Tournaments
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <button
                  onClick={() => showToast(`Notifications enabled for ${game.name} expansion launch!`, 'info')}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <Bell className="w-4 h-4 text-purple-400" />
                  Notify Me On Launch
                </button>
              )}
            </div>

          </motion.div>
        ))}
      </div>

    </div>
  );
}
