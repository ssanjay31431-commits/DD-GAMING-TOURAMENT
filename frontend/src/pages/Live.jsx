import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Play, ShieldAlert, CheckCircle2, Trophy, Users, ArrowRight, RefreshCw, Volume2, Sparkles, Clock, Calendar, ExternalLink, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchLiveAccessAPI } from '../utils/api';

export default function Live() {
  const { tournaments, userProfile, registrations, openRegistrationModal, navigateTo } = useApp();

  // Extract all registered tournament IDs for current user account
  const userRegistrations = registrations || userProfile?.registeredTournaments || [];
  const registeredIdsSet = new Set(
    userRegistrations.map(r => String(r.tournamentId || r.tournament?.id || ''))
  );

  // Separate tournaments into registered vs non-registered
  const registeredTournaments = tournaments.filter(t =>
    registeredIdsSet.has(String(t.id)) || registeredIdsSet.has(String(t._id))
  );

  const upcomingOtherTournaments = tournaments.filter(t =>
    !registeredIdsSet.has(String(t.id)) && !registeredIdsSet.has(String(t._id))
  );

  const [activeTabTrnId, setActiveTabTrnId] = useState('');
  const [accessStateMap, setAccessStateMap] = useState({});

  useEffect(() => {
    // Check live stream access for all registered tournaments
    registeredTournaments.forEach(trn => {
      checkAccess(trn.id);
    });
    if (registeredTournaments.length > 0 && !activeTabTrnId) {
      setActiveTabTrnId(registeredTournaments[0].id);
    }
  }, [tournaments, userProfile?.email, userRegistrations.length]);

  const checkAccess = async (trnId) => {
    const res = await fetchLiveAccessAPI(trnId, userProfile?.email || '');
    if (res) {
      setAccessStateMap(prev => ({
        ...prev,
        [trnId]: {
          hasAccess: Boolean(res.hasAccess),
          embedUrl: res.embedUrl || `https://www.youtube.com/embed/live_stream?channel=UC_DD_GAMING`,
          youtubeChannelUrl: res.youtubeChannelUrl || 'https://www.youtube.com/@ddgaming',
          date: res.date,
          time: res.time,
          isLiveStreaming: Boolean(res.isLiveStreaming)
        }
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Live Stream Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 glass-panel shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              🔴 LIVE BROADCAST ARENA
            </span>
            {registeredTournaments.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                🎟️ {registeredTournaments.length} REGISTERED LIVE STREAM{registeredTournaments.length > 1 ? 'S' : ''}
              </span>
            )}
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-wide">
            DD GAMING LIVE BROADCASTS
          </h1>
          <p className="text-xs sm:text-sm text-purple-300 max-w-2xl leading-relaxed">
            Watch live tournament matches directly inside DD Gaming or on YouTube. Registered participants automatically unlock full HD stream access, start dates & times, and match room IDs!
          </p>
        </div>

        {/* Quick Channel Subscribe Badge CTA */}
        <a
          href="https://www.youtube.com/@ddgaming"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-xl shadow-red-500/30 flex items-center gap-2 border border-red-400/40 transition-all shrink-0 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          SUBSCRIBE DD GAMING YOUTUBE
        </a>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: YOUR REGISTERED TOURNAMENTS LIVE CARDS (UNLOCKED) */}
      {/* ========================================================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="font-heading font-black text-xl text-white">
              YOUR REGISTERED LIVE TOURNAMENTS ({registeredTournaments.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {registeredTournaments.length > 0 ? 'Unlocked Access Active' : 'No Registrations Found'}
          </span>
        </div>

        {registeredTournaments.length === 0 ? (
          /* NO REGISTRATIONS CALLOUT BANNER */
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-purple-500/30 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-3xl">
              🎟️
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-heading font-bold text-lg text-white">No Active Registrations Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have not registered for any upcoming live stream matches yet. Register for a tournament below to unlock live stream broadcasts & match schedule start dates!
              </p>
            </div>
            <button
              onClick={() => navigateTo('tournaments')}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25"
            >
              Browse Active Tournaments
            </button>
          </div>
        ) : (
          /* LIST OF ALL REGISTERED TOURNAMENTS LIVE CARDS */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {registeredTournaments.map((trn) => {
              const trnAccess = accessStateMap[trn.id] || {
                hasAccess: true,
                embedUrl: trn.liveEmbedUrl || `https://www.youtube.com/embed/live_stream?channel=UC_DD_GAMING`,
                youtubeChannelUrl: trn.youtubeChannelUrl || 'https://www.youtube.com/@ddgaming',
                date: trn.date,
                time: trn.time,
                isLiveStreaming: Boolean(trn.isLiveStreaming)
              };

              const youtubeUrl = trn.youtubeChannelUrl || 'https://www.youtube.com/@ddgaming';
              const matchDateDisplay = trn.date || 'Scheduled Date';
              const matchTimeDisplay = trn.time || 'Scheduled Time';

              return (
                <div
                  key={trn.id}
                  className="rounded-3xl glass-panel border-2 border-emerald-500/50 p-6 space-y-5 shadow-2xl relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Header & Badge */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{trn.gameIcon || '🎱'}</span>
                        <span className="font-heading font-extrabold text-white text-lg">
                          {trn.title}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> UNLOCKED ACCESS
                      </span>
                    </div>

                    {/* MATCH START DATE & TIME BOX */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          MATCH SCHEDULED:
                        </span>
                        <span className="text-white font-mono font-black text-sm">
                          {matchDateDisplay} @ {matchTimeDisplay}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Match Room ID & Password will be published here before match start time. Stream starts live on YouTube at match start time!
                      </p>
                    </div>

                    {/* LIVE PLAYER CONTAINER */}
                    <div className="relative w-full aspect-video rounded-2xl bg-slate-950 border border-purple-500/30 overflow-hidden shadow-inner flex items-center justify-center">
                      <iframe
                        src={trnAccess.embedUrl}
                        title={trn.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="space-y-3 pt-2">
                    {/* DIRECT YOUTUBE CHANNEL / SUBSCRIBE BUTTON */}
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 border border-red-400/40 cursor-pointer transition-all"
                    >
                      <Play className="w-4 h-4 text-white fill-white" />
                      ▶ WATCH LIVE & SUBSCRIBE ON YOUTUBE CHANNEL
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                      <span>Prize Pool: <strong className="text-amber-400 font-mono">₹{trn.prizePool}</strong></span>
                      <span>Format: <strong className="text-cyan-400 font-mono">{trn.format || '1v1 Knockout'}</strong></span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: OTHER UPCOMING ARENA TOURNAMENTS (LOCKED ACCESS) */}
      {/* ========================================================= */}
      {upcomingOtherTournaments.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-heading font-black text-xl text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              OTHER UPCOMING ARENA MATCHES ({upcomingOtherTournaments.length})
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Register to Unlock Live Access</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingOtherTournaments.map((trn) => (
              <div
                key={trn.id}
                className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xl">{trn.gameIcon || '⚡'}</span>
                      <span className="font-heading font-bold text-white text-base truncate">{trn.title}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase shrink-0">
                      🔒 LOCKED
                    </span>
                  </div>

                  {/* Scheduled Date & Time */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>Match Schedule:</span>
                    </div>
                    <p className="font-mono font-bold text-white text-sm">
                      {trn.date || 'Upcoming'} @ {trn.time || '08:00 PM IST'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 leading-relaxed flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Live Match Access Restricted. Register to unlock live stream broadcast & match details.</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => openRegistrationModal(trn)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Join Tournament (₹{trn.entryFee} Entry)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
