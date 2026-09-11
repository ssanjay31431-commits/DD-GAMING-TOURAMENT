import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Bell, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Games() {
  const { games, tournaments, navigateTo } = useApp();

  const getGameActiveCount = (game) => {
    const count = (tournaments || []).filter(t => {
      const gName = (t.game || '').toLowerCase();
      const gCode = (t.gameCode || '').toLowerCase();
      const targetName = game.name.toLowerCase();
      const targetId = game.id.toLowerCase();
      return gName === targetName || gCode === targetId || (targetId === '8ball' && t.is8BallSpecial);
    }).length;
    return count > 0 ? count : (game.activeTournamentsCount || 1);
  };

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
          DD Gaming supports daily tournaments with active cash prize pools across <strong>BGMI, Free Fire, Ludo King, 8 Ball Pool, Chess, and Carrom Pool</strong>!
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => {
          const activeCount = getGameActiveCount(game);

          return (
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
                  
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    ACTIVE ESPORTS TITLE
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
                  <span className="font-mono text-emerald-400 text-sm font-extrabold">
                    {activeCount} Active
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('tournaments', game.id)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
                >
                  View {game.name} Tournaments
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>

            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
