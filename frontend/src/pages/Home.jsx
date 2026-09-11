import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Swords, Sparkles, Users, Award, ChevronRight, Clock, ShieldCheck, Flame, HelpCircle, ChevronDown, CheckCircle2, Instagram, Youtube } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGameBanner } from '../utils/gameBanners';
import { touchProps } from '../utils/touchHelper';
import FloatingAdsCarousel from '../components/FloatingAdsCarousel';

export default function Home() {
  const { tournaments, navigateTo, openTournamentDetail, openRegistrationModal, faqs, isAlreadyRegisteredForTournament, getTournamentJoiningState, showToast } = useApp();

  const [selectedActiveId, setSelectedActiveId] = useState(null);

  // Active tournaments with Open, Upcoming, JOINING_OPEN or Live status
  const activeTournaments = tournaments.filter(t => {
    const js = getTournamentJoiningState ? getTournamentJoiningState(t) : {};
    return t.status === 'Registration Open' || t.status === 'Almost Full' || t.status === 'Upcoming' || js.joiningStatus === 'JOINING_OPEN' || js.joiningStatus === 'LIVE' || t.status === 'Live';
  });

  const displayList = activeTournaments.length > 0 ? activeTournaments : tournaments;

  // Selected tournament to highlight in Showcase Hero
  const selectedTrn = displayList.find(t => t.id === selectedActiveId) || displayList[0];
  const selectedJoiningState = selectedTrn && getTournamentJoiningState ? getTournamentJoiningState(selectedTrn) : {};
  const isSelectedRegistered = selectedTrn ? isAlreadyRegisteredForTournament(selectedTrn.id) : false;

  const featuredTournaments = tournaments.slice(0, 3);

  // Live Countdown Timer for Selected Active Tournament
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!selectedTrn) return;

    const parseTargetTimestamp = () => {
      const isUpcoming = selectedTrn.status === 'Upcoming';
      const dateStr = isUpcoming ? (selectedTrn.registrationStartDate || selectedTrn.date) : selectedTrn.date;
      const timeStr = isUpcoming ? (selectedTrn.registrationStartTime || selectedTrn.time) : selectedTrn.time;

      const now = new Date();

      if (dateStr && String(dateStr).includes('-')) {
        const parts = String(dateStr).split('T')[0].split('-').map(Number);
        if (parts.length === 3 && !isNaN(parts[0])) {
          let hrs = 20, mins = 0;
          if (timeStr) {
            const match = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (match) {
              hrs = parseInt(match[1], 10);
              mins = parseInt(match[2], 10);
              const ampm = match[3] ? match[3].toUpperCase() : null;
              if (ampm === 'PM' && hrs < 12) hrs += 12;
              if (ampm === 'AM' && hrs === 12) hrs = 0;
            }
          }
          const target = new Date(parts[0], parts[1] - 1, parts[2], hrs, mins, 0);
          if (target.getTime() > now.getTime()) {
            return target.getTime();
          }
        }
      }

      // If match date is today or passed, calculate time to scheduled daily match time
      let defaultHrs = 20, defaultMins = 0;
      if (timeStr) {
        const match = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (match) {
          defaultHrs = parseInt(match[1], 10);
          defaultMins = parseInt(match[2], 10);
          const ampm = match[3] ? match[3].toUpperCase() : null;
          if (ampm === 'PM' && defaultHrs < 12) defaultHrs += 12;
          if (ampm === 'AM' && defaultHrs === 12) defaultHrs = 0;
        }
      }

      const todayTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), defaultHrs, defaultMins, 0);
      if (todayTarget.getTime() > now.getTime()) {
        return todayTarget.getTime();
      } else {
        const tomorrowTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, defaultHrs, defaultMins, 0);
        return tomorrowTarget.getTime();
      }
    };

    const updateTimer = () => {
      const targetTime = parseTargetTimestamp();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [selectedTrn]);

  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left z-10 relative"
            >
              {/* Desktop Gamer Silhouette Graphic Ambient Overlay */}
              <div className="hidden xl:block absolute -left-28 -top-12 w-96 h-[480px] pointer-events-none z-[-1] opacity-35 select-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-cyan-500/20 to-transparent blur-3xl rounded-full" />
                <svg className="w-full h-full text-purple-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7">
                  <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
                  <path d="M19 11v1a7 7 0 0 1-14 0v-1" />
                  <path d="M6 19a6 6 0 0 1 12 0" />
                </svg>
                <div className="absolute bottom-4 left-6">
                  <span className="font-heading font-black italic text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-wider">
                    More Games &bull; More Fun
                  </span>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-md"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-extrabold uppercase text-purple-300 tracking-wider">
                  🎮 Multi-Game Esports Arena &bull; Certified Tournaments
                </span>
              </motion.div>

              <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl leading-tight text-white tracking-tight">
                PLAY • COMPETE <br />
                <span className="text-gradient-purple drop-shadow-lg">WIN PRIZES.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                Community gaming tournament platform focused on easy registration, 1v1 competitive matches, fixed slots, and transparent prizes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  {...touchProps(() => navigateTo('tournaments'))}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-base uppercase tracking-wider shadow-2xl shadow-purple-500/40 flex items-center justify-center gap-3 group cursor-pointer touch-manipulation active:scale-95"
                >
                  <Gamepad2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Explore Tournaments
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  {...touchProps(() => navigateTo('leaderboard'))}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-500 text-white font-heading font-bold text-base uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-3 cursor-pointer touch-manipulation active:scale-95"
                >
                  <Trophy className="w-5 h-5 text-amber-400" />
                  View Rankings
                </motion.button>
              </div>

              {/* Quick Feature Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-semibold border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Payment Slot Confirmation
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> 1v1 & Free-Entry Formats
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400" /> Highlights on Instagram & YouTube
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-5 relative flex justify-center items-center"
            >
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 max-w-full rounded-full bg-gradient-to-tr from-purple-600/25 via-cyan-500/20 to-indigo-600/20 blur-2xl animate-pulse-glow pointer-events-none" />
              <FloatingAdsCarousel />
            </motion.div>

          </div>
        </div>
      </section>

      {/* BUSINESS PLAN CORE HIGHLIGHTS */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-3xl glass-panel border border-purple-500/20 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
            
            <div className="pt-2 md:pt-0">
              <div className="font-heading font-black text-2xl sm:text-3xl text-gradient-purple">
                Multi-Game
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                6 Active Titles
              </p>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="font-heading font-black text-2xl sm:text-3xl text-gradient-cyan">
                Custom Entry
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Fixed Slots
              </p>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="font-heading font-black text-2xl sm:text-3xl text-gradient-gold">
                Free-Entry
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Growth Tournaments
              </p>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="font-heading font-black text-2xl sm:text-3xl text-purple-400">
                Solo & Squad
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Competitive Matchmaking
              </p>
            </div>

            <div className="pt-2 md:pt-0 col-span-2 md:col-span-1">
              <div className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
                Instant UPI
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Transparent Payouts
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CURRENT ACTIVE GAME REGISTRATION SHOWCASE */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/90 border border-purple-500/40 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-4">
              
              {/* Game Selection Tabs */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Active Registration Games:
                </span>
                {displayList.slice(0, 6).map((trn) => (
                  <button
                    key={trn.id}
                    onClick={() => setSelectedActiveId(trn.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedTrn?.id === trn.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400 scale-105'
                        : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-purple-500/50'
                    }`}
                  >
                    <span>{trn.gameIcon || '🎮'}</span>
                    <span>{trn.game || trn.title}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  </button>
                ))}
              </div>

              {/* Game Badge & Registration Status */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider inline-flex items-center gap-1.5">
                  <span>{selectedTrn?.gameIcon || '🎮'}</span>
                  <span>{selectedTrn?.game?.toUpperCase() || 'MULTI-GAME'}</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                  selectedJoiningState.joiningStatus === 'JOINING_OPEN'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                    : selectedJoiningState.joiningStatus === 'LIVE' || selectedTrn?.status === 'Live'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {selectedJoiningState.joiningStatus === 'JOINING_OPEN' ? '⚡ JOINING OPEN (30M WINDOW)' :
                   selectedJoiningState.joiningStatus === 'LIVE' || selectedTrn?.status === 'Live' ? '🔴 LIVE NOW' :
                   `🟢 ${selectedTrn?.status || 'Registration Open'}`}
                </span>
              </div>

              <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
                {selectedTrn?.title || 'DD Universal Esports Grand Clash'}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Official tournament for <strong className="text-purple-300">{selectedTrn?.game || 'Esports'}</strong>. Match scheduled for <strong className="text-cyan-300">{selectedTrn?.date || 'Today'} at {selectedTrn?.time || '08:00 PM IST'}</strong>.
              </p>

              {/* Live Real Countdown Box */}
              <div className="pt-2">
                {selectedJoiningState.joiningStatus === 'JOINING_OPEN' ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-950 to-cyan-950 border border-emerald-500/40 space-y-1">
                    <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span>30-MINUTE JOINING WINDOW CLOSES IN:</span>
                    </p>
                    <div className="font-mono font-black text-3xl text-emerald-400">
                      {selectedJoiningState.formattedTimeUntilEnd}
                    </div>
                  </div>
                ) : selectedJoiningState.joiningStatus === 'LIVE' || selectedTrn?.status === 'Live' ? (
                  <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 space-y-1">
                    <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span>MATCH CURRENTLY LIVE IN ARENA</span>
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>REGISTRATION CLOSES IN FOR {selectedTrn?.game?.toUpperCase() || 'THIS MATCH'}:</span>
                    </p>
                    <div className="flex items-center gap-3">
                      {countdown.days > 0 && (
                        <>
                          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-purple-500/30 text-center">
                            <span className="font-mono font-black text-xl text-purple-400">
                              {String(countdown.days).padStart(2, '0')}
                            </span>
                            <span className="block text-[9px] text-slate-500 uppercase font-bold">Days</span>
                          </div>
                          <span className="text-lg font-bold text-purple-500">:</span>
                        </>
                      )}
                      <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-purple-500/30 text-center">
                        <span className="font-mono font-black text-xl text-purple-400">
                          {String(countdown.hours).padStart(2, '0')}
                        </span>
                        <span className="block text-[9px] text-slate-500 uppercase font-bold">Hours</span>
                      </div>
                      <span className="text-lg font-bold text-purple-500">:</span>
                      <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-purple-500/30 text-center">
                        <span className="font-mono font-black text-xl text-cyan-400">
                          {String(countdown.minutes).padStart(2, '0')}
                        </span>
                        <span className="block text-[9px] text-slate-500 uppercase font-bold">Mins</span>
                      </div>
                      <span className="text-lg font-bold text-cyan-500">:</span>
                      <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-purple-500/30 text-center">
                        <span className="font-mono font-black text-xl text-pink-400">
                          {String(countdown.seconds).padStart(2, '0')}
                        </span>
                        <span className="block text-[9px] text-slate-500 uppercase font-bold">Secs</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Event Specs Card */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase">Selected Game</span>
                  <span className="font-heading font-extrabold text-base text-cyan-300 flex items-center gap-1.5">
                    <span>{selectedTrn?.gameIcon || '🎮'}</span>
                    <span>{selectedTrn?.game || 'Multi-Game'}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase">Announced Prize Pool</span>
                  <span className="font-mono font-black text-2xl text-amber-400">₹{(selectedTrn?.prizePool || 2500).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase">Entry Fee</span>
                  <span className="font-mono font-bold text-lg text-emerald-400">₹{selectedTrn?.entryFee || 100}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase">Slot Capacity</span>
                  <span className="font-mono font-bold text-sm text-purple-300">
                    {selectedTrn?.registeredSlots || 0} / {selectedTrn?.totalSlots || 32} Slots Booked
                  </span>
                </div>

                {selectedJoiningState.joiningStatus === 'JOINING_OPEN' ? (
                  isSelectedRegistered ? (
                    <button
                      onClick={() => openTournamentDetail(selectedTrn)}
                      className="w-full py-3.5 rounded-xl font-heading font-black text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer animate-pulse"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      🔑 ENTER GAME (ROOM ID READY)
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3.5 rounded-xl font-heading font-extrabold text-xs text-slate-400 bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-not-allowed text-center"
                    >
                      🔒 REGISTRATION CLOSED (ROOM PUBLISHED)
                    </button>
                  )
                ) : selectedJoiningState.joiningStatus === 'LIVE' || selectedTrn?.status === 'Live' ? (
                  <button
                    onClick={() => navigateTo('live')}
                    className="w-full py-3.5 rounded-xl font-heading font-black text-sm text-white bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer animate-pulse"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    🔴 WATCH LIVE MATCH NOW
                  </button>
                ) : (
                  <button
                    onClick={() => openRegistrationModal(selectedTrn)}
                    className="w-full py-3.5 rounded-xl font-heading font-black text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    JOIN {selectedTrn?.game?.toUpperCase() || 'EVENT'} (₹{selectedTrn?.entryFee || 100})
                  </button>
                )}
                
                <button
                  onClick={() => openTournamentDetail(selectedTrn)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 hover:text-white transition-all text-center cursor-pointer"
                >
                  VIEW FULL RULES & MATCH DETAILS
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED TOURNAMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Swords className="w-3.5 h-3.5" /> REPEATABLE SCHEDULE
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-white">
              WEEKLY TOURNAMENT SCHEDULE
            </h2>
          </div>
          <button
            onClick={() => navigateTo('tournaments')}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Browse All ({tournaments.length})
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTournaments.map((trn) => {
            const js = getTournamentJoiningState ? getTournamentJoiningState(trn) : {};
            const isReg = isAlreadyRegisteredForTournament(trn.id);

            return (
              <motion.div
                key={trn.id}
                whileHover={{ y: -6 }}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-white/10"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={getGameBanner(trn.game, trn.banner)}
                      alt={trn.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getGameBanner(trn.game);
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-bold text-white border border-white/10">
                        {trn.gameIcon} {trn.game}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {js.joiningStatus === 'JOINING_OPEN' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-emerald-200 bg-emerald-600 border border-emerald-400/50 shadow animate-pulse">
                          ⚡ JOINING OPEN ({js.formattedTimeUntilEnd})
                        </span>
                      ) : js.joiningStatus === 'LIVE' || trn.status === 'Live' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-rose-200 bg-rose-600 border border-rose-400/50 shadow animate-pulse">
                          🔴 LIVE NOW
                        </span>
                      ) : trn.status === 'Upcoming' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-purple-200 bg-purple-600 border border-purple-400/50 shadow">
                          🗓️ UPCOMING
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-white shadow ${
                          trn.entryFee === 0 ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}>
                          {trn.entryFee === 0 ? 'FREE ENTRY' : 'PAID EVENT'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-heading font-bold text-base text-white">
                      {trn.title}
                    </h3>

                    {trn.status === 'Upcoming' && (
                      <div className="p-2 rounded-lg bg-purple-950/70 border border-purple-500/30 text-[11px] font-semibold text-purple-200 flex items-center justify-between">
                        <span>Reg Starts:</span>
                        <span className="font-bold text-amber-300 font-mono">
                          {trn.registrationStartDate || trn.date} @ {trn.registrationStartTime || trn.time}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Entry Fee</span>
                        <span className="font-black text-emerald-400 text-sm">
                          {trn.entryFee === 0 ? 'FREE' : `₹${trn.entryFee}`}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Prize Pool</span>
                        <span className="font-black text-amber-400 text-sm">
                          ₹{trn.prizePool.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  {js.joiningStatus === 'LIVE' || trn.status === 'Live' ? (
                    <button
                      onClick={() => navigateTo('live')}
                      className="w-full py-2.5 rounded-xl font-heading font-extrabold text-xs uppercase tracking-wider transition-all shadow-md bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                    >
                      🔴 WATCH LIVE MATCH NOW
                    </button>
                  ) : js.joiningStatus === 'JOINING_OPEN' ? (
                    isReg ? (
                      <button
                        onClick={() => openTournamentDetail(trn)}
                        className="w-full py-2.5 rounded-xl font-heading font-extrabold text-xs uppercase tracking-wider transition-all shadow-md bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse"
                      >
                        🔑 JOIN MATCH ({js.formattedTimeUntilEnd})
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl font-heading font-extrabold text-xs uppercase tracking-wider transition-all bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                      >
                        🔒 REGISTRATION CLOSED
                      </button>
                    )
                  ) : isReg ? (
                    <button
                      onClick={() => navigateTo('my-tournaments')}
                      className="w-full py-2.5 rounded-xl font-heading font-extrabold text-xs uppercase tracking-wider transition-all shadow-md bg-slate-900 border border-emerald-500/60 text-emerald-300 hover:bg-slate-800"
                    >
                      ✅ ALREADY REGISTERED
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (trn.status === 'Upcoming') {
                          openTournamentDetail(trn);
                        } else {
                          openRegistrationModal(trn);
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-heading font-extrabold text-xs uppercase tracking-wider transition-all shadow-md ${
                        trn.status === 'Upcoming'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/40 hover:bg-purple-900'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {trn.status === 'Upcoming' ? `🗓️ Reg Starts ${trn.registrationStartDate || trn.date}` : 'Join Tournament'}
                    </button>
                  )}
                  <button
                    onClick={() => openTournamentDetail(trn)}
                    className="w-full py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold hover:border-slate-700 cursor-pointer"
                  >
                    View Details & Rules
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
            COMMUNITY TOURNAMENT PLATFORM
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white">
            HOW IT WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: '1. Select Event', desc: 'Choose free-entry or paid esports tournaments across 6+ games.', icon: '🎮' },
            { step: '02', title: '2. Confirm Slot', desc: 'Enter In-Game ID / Username & complete required payment.', icon: '📝' },
            { step: '03', title: '3. Play Match', desc: 'Compete in your selected game at scheduled match timing.', icon: '⚔️' },
            { step: '04', title: '4. Win & Transparent Prizes', desc: 'Submit victory screenshot & receive direct UPI payout.', icon: '🏆' }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-xl">
                {item.icon}
              </div>
              <h3 className="font-heading font-bold text-base text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQS & POLICIES SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
            RULES & POLICIES
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="w-full p-4 text-left font-heading font-bold text-sm text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
