import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Play, ShieldAlert, CheckCircle2, Trophy, Users, ArrowRight, RefreshCw, Volume2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchLiveAccessAPI } from '../utils/api';

export default function Live() {
  const { tournaments, userProfile, openRegistrationModal, navigateTo } = useApp();
  const [selectedTrnId, setSelectedTrnId] = useState('');
  const [accessState, setAccessState] = useState({ loading: true, hasAccess: false, embedUrl: '', reason: '', message: '' });

  // Find active live or completed tournament
  const liveTournaments = tournaments.filter(t => t.status === 'Live' || t.isLiveStreaming || t.liveEmbedUrl || t.youtubeVideoId);
  const currentTrn = tournaments.find(t => t.id === selectedTrnId) || liveTournaments[0] || tournaments[0];

  useEffect(() => {
    if (currentTrn && currentTrn.id) {
      if (!selectedTrnId) setSelectedTrnId(currentTrn.id);
      checkAccess(currentTrn.id);
    }
  }, [currentTrn?.id, userProfile?.email]);

  const checkAccess = async (trnId) => {
    setAccessState(prev => ({ ...prev, loading: true }));
    const res = await fetchLiveAccessAPI(trnId, userProfile?.email || '');
    if (res) {
      setAccessState({
        loading: false,
        hasAccess: Boolean(res.hasAccess),
        embedUrl: res.embedUrl || '',
        reason: res.reason || '',
        message: res.message || ''
      });
    } else {
      setAccessState({
        loading: false,
        hasAccess: false,
        embedUrl: '',
        reason: 'ERROR',
        message: 'Could not connect to live access verification service.'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Live Stream Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 glass-panel shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> 🔴 LIVE BROADCAST ARENA
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mt-2">
            {currentTrn?.title || 'DD Gaming Live Esports Stream'}
          </h1>
          <p className="text-xs text-purple-300 mt-1">
            Watch live tournament matches directly inside DD Gaming with verified participant access.
          </p>
        </div>

        {/* Live Tournament Selector Switcher */}
        {liveTournaments.length > 1 && (
          <div className="w-full md:w-auto">
            <select
              value={selectedTrnId}
              onChange={(e) => setSelectedTrnId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-500/40 text-xs font-bold text-white shadow-inner"
            >
              {liveTournaments.map(t => (
                <option key={t.id} value={t.id}>🔴 {t.title} ({t.game})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* MAIN LIVE PLAYER / ACCESS GUARD CONTAINER */}
      <div className="relative w-full aspect-video rounded-3xl bg-slate-950 border-2 border-purple-500/40 overflow-hidden shadow-2xl flex items-center justify-center">
        
        {accessState.loading ? (
          <div className="text-center space-y-3 p-8">
            <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Verifying Live Stream Access...</p>
          </div>
        ) : accessState.hasAccess && accessState.embedUrl ? (
          <iframe
            src={accessState.embedUrl}
            title={currentTrn?.title || 'DD Gaming Live Stream'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          /* LOCKED RESTRICTED ACCESS SCREEN */
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/80 to-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 flex items-center justify-center animate-bounce shadow-2xl">
              <Lock className="w-10 h-10" />
            </div>

            <div className="max-w-lg space-y-2">
              <span className="px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-widest border border-rose-500/30">
                ACCESS CONTROL ENFORCED
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
                🔒 Live Match Access Restricted
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                Only registered participants or users who have paid the entry fee can watch this live match.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-left text-xs max-w-md w-full space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>How to Unlock Access:</span>
              </div>
              <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                <li>Register as a participant for <strong className="text-white">{currentTrn?.title}</strong></li>
                <li>Submit your entry fee payment screenshot for instant verification</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
              <button
                onClick={() => openRegistrationModal(currentTrn)}
                className="w-full sm:w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                Pay Entry Fee (₹{currentTrn?.entryFee || 100})
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => openRegistrationModal(currentTrn)}
                className="w-full sm:w-1/2 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                Join Tournament
                <Trophy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tournament Details Banner below Live Player */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{currentTrn?.game} • {currentTrn?.mode}</span>
            <span className="text-xs font-mono font-bold text-emerald-400">Prize Pool: ₹{currentTrn?.prizePool}</span>
          </div>
          <h3 className="font-heading font-bold text-xl text-white">{currentTrn?.title}</h3>
          <p className="text-xs text-slate-400">{currentTrn?.description || 'Official competitive match streaming live.'}</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Access Status</span>
            <p className={`font-heading font-black text-lg ${accessState.hasAccess ? 'text-emerald-400' : 'text-rose-400'}`}>
              {accessState.hasAccess ? 'Access Granted ✅' : 'Access Locked 🔒'}
            </p>
          </div>
          <button
            onClick={() => navigateTo('tournaments')}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase border border-slate-800"
          >
            Browse All Tournaments
          </button>
        </div>
      </div>

    </div>
  );
}
