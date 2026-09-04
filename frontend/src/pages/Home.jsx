import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Swords, Sparkles, Users, Award, ChevronRight, Clock, ShieldCheck, Flame, HelpCircle, ChevronDown, CheckCircle2, Instagram, Youtube } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGameBanner } from '../utils/gameBanners';
import { touchProps } from '../utils/touchHelper';

export default function Home() {
  const { tournaments, navigateTo, openTournamentDetail, openRegistrationModal, faqs, isAlreadyRegisteredForTournament } = useApp();

  const upcomingTrn = tournaments.find(t => t.status === 'Upcoming');
  const poolSpecial = tournaments.find(t => t.is8BallSpecial && t.status === 'Registration Open') || tournaments[0];
  const featuredTournaments = tournaments.slice(0, 3);

  // Live Countdown Timer for Upcoming Event
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetTrn = upcomingTrn || poolSpecial;
    if (!targetTrn) return;

    const parseTargetDate = () => {
      const dateStr = targetTrn.registrationStartDate || targetTrn.date;
      const timeStr = targetTrn.registrationStartTime || targetTrn.time;
      if (!dateStr) return new Date(Date.now() + 24 * 3600 * 1000);

      const parts = String(dateStr).split('T')[0].split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0])) {
        let hrs = 12, mins = 0;
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
        return new Date(parts[0], parts[1] - 1, parts[2], hrs, mins, 0);
      }
      return new Date(Date.now() + 18 * 3600 * 1000);
    };

    const updateTimer = () => {
      const target = parseTargetDate();
      const now = new Date();
      const diff = target.getTime() - now.getTime();

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
  }, [upcomingTrn, poolSpecial]);

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
              className="lg:col-span-7 space-y-6 text-center lg:text-left z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-md"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-extrabold uppercase text-purple-300 tracking-wider">
                  🎱 DD 8 Ball Pool Main Arena • 32 Fixed Slots
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

            {/* Right Interactive 3D / Upcoming Event Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-5 relative flex justify-center items-center"
            >
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 max-w-full rounded-full bg-gradient-to-tr from-amber-500/30 via-purple-600/30 to-cyan-500/20 blur-2xl animate-pulse-glow pointer-events-none" />

              {upcomingTrn ? (
                /* 1. UPCOMING EVENT DYNAMIC HERO CARD WITH LIVE COUNTDOWN ANIMATION */
                <div className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 space-y-5 animate-float-3d">
                  
                  {/* Badge & Title */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-2xl">{upcomingTrn.gameIcon || '⚡'}</span>
                      <span className="font-heading font-extrabold text-white text-base truncate">
                        {upcomingTrn.title}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1.5 shrink-0 shadow">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      ⏳ UPCOMING
                    </span>
                  </div>

                  {/* HIGH-TECH LIVE COUNTDOWN BOXES */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-950 border border-amber-500/40 shadow-inner space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-amber-300 uppercase tracking-widest">
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                      EVENT STARTS IN
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center pt-1">
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow">
                        <span className="font-mono font-black text-xl text-amber-400 block">{String(countdown.days).padStart(2, '0')}</span>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">DAYS</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow">
                        <span className="font-mono font-black text-xl text-amber-400 block">{String(countdown.hours).padStart(2, '0')}</span>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">HRS</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow">
                        <span className="font-mono font-black text-xl text-amber-400 block">{String(countdown.minutes).padStart(2, '0')}</span>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">MINS</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow animate-pulse">
                        <span className="font-mono font-black text-xl text-rose-400 block">{String(countdown.seconds).padStart(2, '0')}</span>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">SECS</span>
                      </div>
                    </div>
                  </div>

                  {/* Tournament Quick Stats */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                    <span className="flex items-center gap-1">
                      🏆 Prize: <strong className="text-amber-400 font-mono text-sm">₹{upcomingTrn.prizePool || 0}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      🎟️ Entry: <strong className="text-cyan-400 font-mono text-sm">{upcomingTrn.entryFee === 0 ? 'FREE' : `₹${upcomingTrn.entryFee}`}</strong>
                    </span>
                  </div>

                  {/* Action CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    {...touchProps(() => openTournamentDetail(upcomingTrn))}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 border border-amber-400/30 transition-all cursor-pointer touch-manipulation"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    VIEW UPCOMING EVENT DETAILS
                  </motion.button>

                </div>
              ) : poolSpecial ? (
                /* 2. ACTIVE OPEN GAME FEATURED PROMOTION CARD */
                <div className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border border-purple-500/40 shadow-2xl space-y-6 animate-float-3d">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-2xl">{poolSpecial.gameIcon || '🎱'}</span>
                      <span className="font-heading font-extrabold text-white text-base truncate">
                        {poolSpecial.title}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse shrink-0">
                      ● MAIN GAME
                    </span>
                  </div>

                  {/* Simulated 3D Graphic */}
                  <div className="relative h-44 w-full rounded-2xl bg-gradient-to-br from-slate-950 to-purple-950/80 border border-purple-500/30 flex items-center justify-center overflow-hidden">
                    <div className="w-28 h-28 rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl flex items-center justify-center relative">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-inner">
                        <span className="font-heading font-black text-2xl text-slate-950">8</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-3 left-3 bg-purple-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-purple-400/40 text-[10px] font-bold text-purple-200">
                      Prize: ₹{poolSpecial.prizePool || 2500}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-cyan-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-400/40 text-[10px] font-bold text-cyan-200">
                      Entry: {poolSpecial.entryFee === 0 ? 'FREE' : `₹${poolSpecial.entryFee}`}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>{poolSpecial.format || '1v1 • Fixed Slots'}</span>
                      <span className="text-emerald-400 font-bold">Registration Open</span>
                    </div>
                    
                    {isAlreadyRegisteredForTournament(poolSpecial.id) ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        {...touchProps(() => navigateTo('my-tournaments'))}
                        className="w-full py-3.5 rounded-xl bg-slate-900 border-2 border-emerald-500/60 text-emerald-300 hover:bg-slate-800 font-heading font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
                      >
                        ✅ ALREADY REGISTERED (VIEW TICKET)
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        {...touchProps(() => openRegistrationModal(poolSpecial))}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all cursor-pointer touch-manipulation"
                      >
                        JOIN EVENT ({poolSpecial.entryFee === 0 ? 'FREE' : `₹${poolSpecial.entryFee}`} ENTRY)
                      </motion.button>
                    )}
                  </div>

                </div>
              ) : (
                /* 3. NEXT GAME PROMOTION DEMO FALLBACK CARD */
                <div className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border border-purple-500/40 shadow-2xl space-y-6 animate-float-3d text-center">
                  
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                    🎮 NEXT GAME PROMOTION
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading font-black text-2xl text-white">
                      DD GAMING ARENA
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Upcoming competitive esports tournaments launching soon. Stay tuned for registration!
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    {...touchProps(() => navigateTo('tournaments'))}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all cursor-pointer touch-manipulation"
                  >
                    EXPLORE ALL GAMES
                  </motion.button>

                </div>
              )}
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
                8 Ball Pool
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Main Launch Game
              </p>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="font-heading font-black text-2xl sm:text-3xl text-gradient-cyan">
                ₹100 Entry
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                32 Fixed Slots
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
                1v1 Duels
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Competitive Matchmaking
              </p>
            </div>

            <div className="pt-2 md:pt-0 col-span-2 md:col-span-1">
              <div className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
                6 Games
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Platform Ecosystem
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* EXAMPLE EVENT SHOWCASE */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/90 border border-purple-500/40 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🎱</span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                  EXAMPLE EVENT FORMAT
                </span>
              </div>

              <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
                DD 8 BALL POOL WEEKEND CLASH
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                8 Ball Pool 1v1 — ₹100 entry — 32 fixed slots — announced prize pool — clear rules and match timing. Slot confirmed upon required payment verification.
              </p>

              {/* Countdown Box */}
              <div className="pt-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Registration Closes In:
                </p>
                <div className="flex items-center gap-3">
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
              </div>
            </div>

            {/* Right Event Summary Card */}
            <div className="lg:col-span-5 bg-slate-950/90 p-6 rounded-2xl border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Announced Prize Pool</span>
                <span className="font-heading font-black text-xl text-amber-400">₹2,500</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Entry Fee</span>
                <span className="font-heading font-black text-emerald-400 text-lg">₹100</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Fixed Slots</span>
                <span className="font-mono font-bold text-purple-300 text-sm">32 Slots Total</span>
              </div>

              <div className="pt-2 space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openRegistrationModal(poolSpecial)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                  Join 1v1 Event (₹100)
                </motion.button>
                <button
                  onClick={() => openTournamentDetail(poolSpecial)}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  View Rules & Eligibility
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
          {featuredTournaments.map((trn) => (
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
                    {trn.status === 'Upcoming' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-purple-200 bg-purple-600 border border-purple-400/50 shadow">
                        🗓️ UPCOMING
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase text-white shadow ${
                      trn.entryFee === 0 ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}>
                      {trn.entryFee === 0 ? 'FREE ENTRY' : 'PAID EVENT'}
                    </span>
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
                <button
                  onClick={() => openTournamentDetail(trn)}
                  className="w-full py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold hover:border-slate-700"
                >
                  View Details & Rules
                </button>
              </div>
            </motion.div>
          ))}
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
            { step: '01', title: '1. Select Event', desc: 'Choose free-entry or paid 1v1 tournaments.', icon: '🎱' },
            { step: '02', title: '2. Confirm Slot', desc: 'Enter 8 Ball ID & complete required payment.', icon: '📝' },
            { step: '03', title: '3. Play 1v1 Match', desc: 'Compete in 8 Ball Pool at match timing.', icon: '⚔️' },
            { step: '04', title: '4. Win & Transparent Prizes', desc: 'Submit victory screenshot & receive UPI payout.', icon: '🏆' }
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
