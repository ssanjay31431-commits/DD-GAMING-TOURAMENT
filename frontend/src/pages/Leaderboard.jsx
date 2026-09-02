import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Award, ChevronRight, Gamepad2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Leaderboard() {
  const { tournaments, navigateTo } = useApp();
  
  // Filter tournaments that have verified rankings
  const rankedTournaments = tournaments.filter(t => t.rankings && t.rankings.length > 0);
  const [selectedTrnId, setSelectedTrnId] = useState(() => rankedTournaments[0]?.id || tournaments[0]?.id);

  const selectedTrn = tournaments.find(t => t.id === selectedTrnId) || rankedTournaments[0] || tournaments[0];
  const rankingsList = selectedTrn?.rankings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/20">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL TOURNAMENT RANKINGS
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            TOURNAMENT RANKINGS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Official verified rank standings & prize awards for DD Gaming Tournaments.
          </p>
        </div>
      </div>

      {/* Tournament Selector */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Tournament to View Verified Rankings:
        </label>
        <div className="flex flex-wrap gap-2">
          {tournaments.map((trn) => {
            const isSelected = selectedTrn?.id === trn.id;
            const hasRanks = trn.rankings && trn.rankings.length > 0;
            return (
              <button
                key={trn.id}
                onClick={() => setSelectedTrnId(trn.id)}
                className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center gap-2 transition-all border ${
                  isSelected
                    ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{trn.gameIcon || '🎱'}</span>
                <span>{trn.title}</span>
                {hasRanks ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Verified</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400">{trn.status}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Tournament Rankings */}
      {selectedTrn ? (
        <div className="space-y-6">
          
          {/* Tournament Overview Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                {selectedTrn.gameIcon} {selectedTrn.game} • {selectedTrn.mode || 'Standard'}
              </span>
              <h2 className="font-heading font-black text-2xl text-white mt-2">{selectedTrn.title}</h2>
              <p className="text-xs text-slate-400">{selectedTrn.date} at {selectedTrn.time}</p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Prize Pool</span>
                <span className="font-mono font-black text-amber-400 text-lg">₹{selectedTrn.totalPrize || selectedTrn.prizePool}</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <span className="font-bold text-purple-300 text-xs">{selectedTrn.status}</span>
              </div>
            </div>
          </div>

          {/* Rankings Content */}
          {rankingsList.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
                ⏳
              </div>
              <h3 className="font-heading font-bold text-xl text-white">Results Pending Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Matches are either currently live or in the 24-hour result verification phase. Official rankings will be published here after admin confirmation!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TOP 3 PODIUM */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {rankingsList.map((rankItem, idx) => {
                  const isGold = idx === 0 || rankItem.rank?.includes('1');
                  const isSilver = idx === 1 || rankItem.rank?.includes('2');
                  const isBronze = idx === 2 || rankItem.rank?.includes('3');

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-3xl text-center space-y-3 relative overflow-hidden border ${
                        isGold
                          ? 'bg-gradient-to-b from-amber-950/80 via-slate-900 to-purple-950/80 border-amber-500/50 shadow-2xl md:order-2 order-1'
                          : isSilver
                          ? 'bg-slate-900/90 border-slate-400/30 md:order-1 order-2'
                          : 'bg-slate-900/90 border-amber-700/30 md:order-3 order-3'
                      }`}
                    >
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl font-black shadow-lg ${
                        isGold ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950' :
                        isSilver ? 'bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-950' :
                        'bg-gradient-to-tr from-amber-700 to-amber-500 text-white'
                      }`}>
                        {isGold ? '🥇' : isSilver ? '🥈' : '🥉'}
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{rankItem.rank || `Rank #${idx + 1}`}</span>
                        <h3 className="font-heading font-black text-xl text-white mt-0.5">{rankItem.playerName || rankItem.teamName}</h3>
                        {rankItem.kills !== undefined && (
                          <p className="text-xs text-purple-300 font-mono mt-1">🎯 {rankItem.kills} Kills</p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Prize Reward</span>
                        <span className="font-mono font-black text-amber-400 text-lg">₹{rankItem.prizeAmount || rankItem.amount || 0}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* FULL RANKINGS TABLE */}
              <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6">Official Rank</th>
                      <th className="py-3.5 px-6">Player / Team</th>
                      <th className="py-3.5 px-6 text-center">Kills / Points</th>
                      <th className="py-3.5 px-6 text-right">Prize Award</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {rankingsList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-purple-300">
                          {item.rank || `Rank #${idx + 1}`}
                        </td>
                        <td className="py-4 px-6 font-bold text-white">
                          {item.playerName || item.teamName}
                        </td>
                        <td className="py-4 px-6 text-center font-mono font-bold text-slate-300">
                          {item.kills !== undefined ? `${item.kills} Kills` : (item.points || 'Verified')}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-black text-amber-400 text-base">
                          ₹{item.prizeAmount || item.amount || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      ) : null}

    </div>
  );
}
