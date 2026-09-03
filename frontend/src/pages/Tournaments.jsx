import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Users, Trophy, ChevronRight, Swords, SlidersHorizontal, RefreshCw, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGameBanner } from '../utils/gameBanners';

export default function Tournaments() {
  const { tournaments, openTournamentDetail, openRegistrationModal, navigateTo, isAlreadyRegisteredForTournament } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFee, setSelectedFee] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredTournaments = useMemo(() => {
    return tournaments
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              t.game.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGame = selectedGame === 'all' || t.gameCode === selectedGame || (selectedGame === '8ball' && t.is8BallSpecial);
        const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus || (selectedStatus === 'Completed' && (t.status === 'Expired' || t.status === 'Completed'));
        const matchesFee = selectedFee === 'all' ||
                           (selectedFee === 'free' && t.entryFee === 0) ||
                           (selectedFee === 'paid' && t.entryFee > 0);

        return matchesSearch && matchesGame && matchesStatus && matchesFee;
      })
      .sort((a, b) => {
        if (sortBy === 'prize') return b.prizePool - a.prizePool;
        return new Date(a.date) - new Date(b.date);
      });
  }, [tournaments, searchTerm, selectedGame, selectedStatus, selectedFee, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 overflow-hidden">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
          <Swords className="w-3.5 h-3.5" /> COMPETITIVE ARENAS
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
          EXPLORE TOURNAMENTS
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Browse active 8 Ball Pool tournaments, join upcoming matches, and lock in your slot.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tournaments by name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold bg-slate-900"
            >
              <option value="all">All Games (6)</option>
              <option value="8ball">🎱 8 Ball Pool (Active)</option>
              <option value="bgmi">🎯 BGMI (Soon)</option>
              <option value="freefire">🔥 Free Fire (Soon)</option>
              <option value="chess">♟ Chess (Soon)</option>
              <option value="ludo">🎲 Ludo King (Soon)</option>
              <option value="carrom">🥏 Carrom Pool (Soon)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold bg-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Registration Open">Registration Open</option>
              <option value="Almost Full">Almost Full</option>
              <option value="Live">Live</option>
              <option value="Result Pending">Result Pending</option>
              <option value="Completed">Completed / Expired</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <select
              value={selectedFee}
              onChange={(e) => setSelectedFee(e.target.value)}
              className="w-1/2 px-2.5 py-2.5 rounded-xl glass-input text-xs font-semibold bg-slate-900"
            >
              <option value="all">All Fees</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-1/2 px-2.5 py-2.5 rounded-xl glass-input text-xs font-semibold bg-slate-900"
            >
              <option value="date">By Date</option>
              <option value="prize">By Prize</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Showing <strong className="text-purple-400 font-mono">{filteredTournaments.length}</strong> tournaments</span>
          {(searchTerm || selectedGame !== 'all' || selectedStatus !== 'all' || selectedFee !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGame('all');
                setSelectedStatus('all');
                setSelectedFee('all');
              }}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-heading font-bold text-xl text-white">No Tournaments Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or game filters to discover upcoming contests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((trn) => {
            const fillPct = Math.min(100, Math.round((trn.registeredSlots / trn.totalSlots) * 100));
            return (
              <motion.div
                key={trn.id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="glass-panel glass-panel-hover shimmer-sweep rounded-2xl overflow-hidden flex flex-col justify-between border border-white/10"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={getGameBanner(trn.game, trn.banner)}
                      alt={trn.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getGameBanner(trn.game);
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-bold text-white border border-white/10">
                        {trn.gameIcon} {trn.game}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-white shadow ${
                        trn.status === 'Upcoming' ? 'bg-purple-600 border border-purple-400/50 shadow-purple-500/40' :
                        trn.status === 'Registration Open' ? 'bg-emerald-600 animate-pulse' :
                        trn.status === 'Almost Full' ? 'bg-amber-600 animate-pulse' : 'bg-purple-600'
                      }`}>
                        {trn.status === 'Upcoming' ? '🗓️ UPCOMING' : trn.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="font-heading font-bold text-xl text-white">
                      {trn.title}
                    </h3>
                    <p className="text-xs text-purple-300 font-medium">
                      {trn.format}
                    </p>

                    {trn.status === 'Upcoming' && (
                      <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-between shadow-inner">
                        <span>🗓️ Registration Starts:</span>
                        <span className="font-bold text-amber-300 font-mono">
                          {trn.registrationStartDate || trn.date} @ {trn.registrationStartTime || trn.time}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Match Date & Time</span>
                        <span className="font-bold text-slate-200 mt-0.5 block">{trn.date}</span>
                        <span className="text-[10px] text-purple-300 font-mono">{trn.time}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Prize Pool</span>
                        <span className="font-black text-amber-400 text-base">
                          ₹{trn.prizePool.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Available Slots</span>
                        <span className="font-mono text-purple-300">
                          {trn.registeredSlots} / {trn.totalSlots} Slots
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-2">
                  <div className="flex items-center justify-between text-sm pb-2">
                    <span className="text-slate-400">Entry Fee:</span>
                    <span className="font-black text-emerald-400 text-lg">
                      {trn.entryFee === 0 ? 'FREE' : `₹${trn.entryFee}`}
                    </span>
                  </div>

                  {(trn.status === 'Live' || trn.isLiveStreaming || trn.liveStreamUrl) && (
                    <button
                      onClick={() => navigateTo('live')}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 animate-pulse cursor-pointer border border-rose-400/50"
                    >
                      <Play className="w-4 h-4 fill-white" /> 🔴 WATCH LIVE MATCH NOW
                    </button>
                  )}

                  {isAlreadyRegisteredForTournament(trn.id) ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigateTo('my-tournaments')}
                      className="w-full py-3 rounded-xl font-heading font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg bg-slate-900 border-2 border-emerald-500/60 text-emerald-300 hover:bg-slate-800 cursor-pointer shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                    >
                      ✅ ALREADY REGISTERED (VIEW TICKET)
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={trn.status === 'Completed' || trn.status === 'Expired' || trn.status === 'Registration Closed'}
                      onClick={() => {
                        if (trn.status === 'Upcoming') {
                          openTournamentDetail(trn);
                        } else if (trn.status === 'Result Pending') {
                          navigateTo('winners');
                        } else {
                          openRegistrationModal(trn);
                        }
                      }}
                      className={`w-full py-3 rounded-xl font-heading font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg ${
                        trn.status === 'Completed' || trn.status === 'Expired'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : trn.status === 'Upcoming'
                          ? 'bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/40 text-purple-200 cursor-pointer'
                          : trn.status === 'Result Pending'
                          ? 'bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 text-white cursor-pointer'
                          : trn.status === 'Registration Closed'
                          ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25'
                      }`}
                    >
                      {trn.status === 'Completed' || trn.status === 'Expired' ? '🏆 Tournament Ended (Expired)' :
                       trn.status === 'Upcoming' ? `🗓️ Reg Starts ${trn.registrationStartDate || trn.date}` :
                       trn.status === 'Result Pending' ? '⏳ Wait for Result' :
                       trn.status === 'Registration Closed' ? 'Registration Closed' :
                       'Join Tournament'}
                    </motion.button>
                  )}

                  <button
                    onClick={() => openTournamentDetail(trn)}
                    className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all"
                  >
                    View Details & Rules
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
