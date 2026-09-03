import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Calendar, Clock, Users, ShieldCheck, Zap, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGameBanner } from '../utils/gameBanners';

export default function TournamentDetailModal() {
  const { selectedTournamentDetail, closeTournamentDetail, openRegistrationModal } = useApp();

  if (!selectedTournamentDetail) return null;

  const trn = selectedTournamentDetail;
  const fillPercentage = Math.min(100, Math.round((trn.registeredSlots / trn.totalSlots) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTournamentDetail}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Close Button */}
          <button
            onClick={closeTournamentDetail}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Header */}
          <div className="relative h-56 sm:h-72 w-full overflow-hidden">
            <img
              src={getGameBanner(trn.game, trn.banner)}
              alt={trn.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getGameBanner(trn.game);
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-600/90 text-white backdrop-blur-md shadow-lg flex items-center gap-1.5">
                <span>{trn.gameIcon}</span> {trn.game}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold text-white backdrop-blur-md ${
                trn.status === 'Upcoming' ? 'bg-purple-600/90 border border-purple-400/50' :
                trn.status === 'Registration Open' ? 'bg-emerald-600/90' :
                trn.status === 'Almost Full' ? 'bg-amber-600/90' :
                trn.status === 'Completed' ? 'bg-slate-700/90' : 'bg-indigo-600/90'
              }`}>
                {trn.status === 'Upcoming' ? '🗓️ UPCOMING' : trn.status}
              </span>
            </div>

            {/* Title & Prize Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="font-heading font-black text-2xl sm:text-4xl text-white drop-shadow-md">
                {trn.title}
              </h2>
              <p className="text-sm text-purple-300 font-medium mt-1">
                {trn.format}
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Details, Prize Distribution, Rules */}
            <div className="lg:col-span-2 space-y-6">

              {trn.status === 'Upcoming' && (
                <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Registration Opens On:</span>
                  </div>
                  <span className="font-bold text-amber-300 font-mono text-sm">
                    {trn.registrationStartDate || trn.date} at {trn.registrationStartTime || trn.time}
                  </span>
                </div>
              )}
              
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Date</p>
                  <p className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {trn.date}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Time</p>
                  <p className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {trn.time}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Entry Fee</p>
                  <p className="text-sm font-black text-emerald-400 mt-0.5">
                    {trn.entryFee === 0 ? 'FREE' : `₹${trn.entryFee}`}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Prize Pool</p>
                  <p className="text-sm font-black text-amber-400 mt-0.5">
                    ₹{trn.prizePool.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" /> Tournament Overview
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {trn.description}
                </p>
              </div>

              {/* Prize Breakdown Table */}
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> Prize Distribution
                </h3>
                <div className="rounded-xl overflow-hidden border border-amber-500/20 bg-slate-950/70">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-amber-500/10 text-amber-300 font-bold border-b border-amber-500/20">
                      <tr>
                        <th className="py-2.5 px-4">Position</th>
                        <th className="py-2.5 px-4 text-right">Prize Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {trn.prizes.map((p, idx) => (
                        <tr key={idx} className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">{p.rank}</td>
                          <td className="py-3 px-4 text-right font-black text-amber-400 font-mono">
                            ₹{p.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rules List */}
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Rules & Requirements
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {trn.rules.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Right Sticky Card: Slot fill & Register CTA */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-5 sticky top-6 shadow-xl">
                
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prize Pool</p>
                  <div className="font-heading font-black text-3xl text-gradient-gold mt-1">
                    ₹{trn.prizePool.toLocaleString()}
                  </div>
                </div>

                {/* Slots Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-400" /> Slot Allocation
                    </span>
                    <span className="text-purple-300 font-mono">
                      {trn.registeredSlots} / {trn.totalSlots} Slots
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-right text-slate-400 mt-1 font-mono">
                    {trn.totalSlots - trn.registeredSlots} slots remaining
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Entry Fee:</span>
                    <span className="font-black text-emerald-400 text-lg">
                      {trn.entryFee === 0 ? 'FREE' : `₹${trn.entryFee}`}
                    </span>
                  </div>

                  <button
                    disabled={trn.status === 'Registration Closed' || trn.status === 'Completed' || trn.status === 'Upcoming'}
                    onClick={() => {
                      if (trn.status === 'Upcoming') return;
                      closeTournamentDetail();
                      openRegistrationModal(trn);
                    }}
                    className={`w-full py-3.5 px-6 rounded-xl font-heading font-extrabold text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 transition-all ${
                      trn.status === 'Registration Closed' || trn.status === 'Completed'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : trn.status === 'Upcoming'
                        ? 'bg-slate-850 text-amber-300/80 cursor-not-allowed border border-amber-500/30 font-mono shadow-inner'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/50 shadow-purple-500/30 hover:scale-[1.02]'
                    }`}
                  >
                    {trn.status === 'Registration Closed' ? 'Registration Closed' :
                     trn.status === 'Completed' ? 'Tournament Ended' :
                     trn.status === 'Upcoming' ? `🗓️ REGISTRATION HAS NOT OPENED YET` :
                     'Join Tournament Now'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
