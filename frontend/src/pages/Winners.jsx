import React from 'react';
import { Trophy, Crown, Sparkles, Award, Calendar, CheckCircle2, ChevronRight, Clock, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Winners() {
  const { tournaments, winners, navigateTo } = useApp();

  const completedTournaments = tournaments.filter(t => t.status === 'Completed' || t.status === 'Expired' || t.status === 'Result Pending' || (t.rankings && t.rankings.length > 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> HALL OF FAME & TOURNAMENT STANDINGS
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
          OFFICIAL RESULTS & RANKINGS
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Celebrating champions and top performers across all DD Gaming esports tournaments!
        </p>
      </div>

      {/* COMPLETED TOURNAMENTS LIST WITH PUBLISHED VS WAITING STATES */}
      {completedTournaments.length > 0 ? (
        <div className="space-y-10">
          {completedTournaments.map((trn) => {
            const isPublished = trn.resultState === 'PUBLISHED';
            const rankings = (trn.rankings && trn.rankings.length > 0) ? trn.rankings : [];

            return (
              <div key={trn.id} className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/30 glass-panel space-y-6 shadow-2xl">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                      {trn.gameIcon || '🎮'} {trn.game}
                    </span>
                    <h3 className="font-heading font-black text-2xl text-white mt-1">{trn.title}</h3>
                    <p className="text-xs text-slate-400">Played on {trn.date} at {trn.time}</p>
                  </div>

                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase border ${
                    isPublished
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  }`}>
                    {isPublished ? '🏆 Results Published' : '🏁 Results Being Analyzed ⏳'}
                  </span>
                </div>

                {/* IF RESULTS NOT YET PUBLISHED */}
                {!isPublished ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-3">
                    <Clock className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
                    <h4 className="font-heading font-bold text-white text-lg">Results Are Being Analyzed</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                      Please wait for the admin to analyze and update the official rankings. Check back soon for Top 10 standings!
                    </p>
                  </div>
                ) : (
                  /* IF RESULTS PUBLISHED */
                  <div className="space-y-6">
                    <h4 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-400" /> OFFICIAL TOP 10 STANDINGS
                    </h4>

                    {/* TOP 3 PODIUM CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {rankings.slice(0, 3).map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className={`p-5 rounded-2xl border space-y-3 relative overflow-hidden shadow-xl ${
                            rIdx === 0
                              ? 'bg-gradient-to-b from-amber-950/60 to-slate-950 border-amber-500/50'
                              : rIdx === 1
                              ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-400/40'
                              : 'bg-gradient-to-b from-amber-950/30 to-slate-950 border-amber-700/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">
                              {rIdx === 0 ? '🥇' : rIdx === 1 ? '🥈' : '🥉'}
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                              Prize: ₹{r.prizeAmount || 0}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Rank {rIdx + 1} Champion</span>
                            <h5 className="font-heading font-black text-xl text-white truncate">{r.playerName || 'Player'}</h5>
                            <p className="text-xs text-purple-300 font-mono">{r.gamingId}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* RANKS 4 TO 10 MOTIVATIONAL ROSTER */}
                    {rankings.length > 3 && (
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ranks 4 — 10 Final Standings</span>
                        <div className="divide-y divide-slate-900">
                          {rankings.slice(3, 10).map((r, rIdx) => (
                            <div key={rIdx} className="py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-purple-400 w-14">Rank {rIdx + 4}</span>
                                <span className="font-bold text-white">{r.playerName || 'Participant'}</span>
                                <span className="text-slate-500 font-mono text-[11px]">({r.gamingId})</span>
                              </div>
                              <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                                🔥 Super Well Played! See you next tournament! 🎮
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        /* Default Season State */
        <div className="p-10 rounded-3xl bg-slate-900/90 border border-amber-500/30 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl shadow-inner">
            👑
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
              SEASON 1 CHAMPIONSHIPS
            </span>
            <h2 className="font-heading font-black text-2xl text-white">
              CLAIM THE INAUGURAL WINNER SPOT!
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              First tournament matches are accepting registrations. Win your matches to be featured here in the official DD Gaming Hall of Fame!
            </p>
          </div>

          <button
            onClick={() => navigateTo('tournaments')}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 text-white font-heading font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all inline-flex items-center gap-2"
          >
            Register For Tournaments
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}

