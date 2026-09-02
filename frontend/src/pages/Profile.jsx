import React, { useState, useEffect, useRef } from 'react';
import { User, Trophy, Award, Calendar, CheckCircle2, Clock, Settings, Save, Sparkles, Shield, Flame, ChevronRight, Camera, Upload, Check, AlertCircle, Eye, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { checkUsernameAvailabilityAPI, updateUserProfileAPI } from '../utils/api';

export default function Profile({ initialTab = 'overview' }) {
  const { userProfile, updateUserProfile, tournaments, navigateTo, showToast } = useApp();
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Settings Edit Form State
  const [editForm, setEditForm] = useState({
    name: userProfile.name === 'Player Account' ? '' : userProfile.name,
    gamingUsername: userProfile.gamingUsername,
    phone: userProfile.phone,
    email: userProfile.email,
    upiId: userProfile.upiId,
    avatar: userProfile.avatar
  });

  const [usernameError, setUsernameError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Handle Photo Upload from Local Device
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be under 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        setEditForm((prev) => ({ ...prev, avatar: newAvatar }));
        updateUserProfile({ avatar: newAvatar });
        updateUserProfileAPI({ email: userProfile.email, avatar: newAvatar });
        showToast('Profile photo updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Check username availability against database on change/blur
  const handleUsernameCheck = async (newUsername) => {
    setEditForm((prev) => ({ ...prev, gamingUsername: newUsername }));
    if (!newUsername.trim()) {
      setUsernameError('');
      setSuggestions([]);
      return;
    }
    const res = await checkUsernameAvailabilityAPI(newUsername, userProfile.email);
    if (!res.available) {
      setUsernameError(res.message);
      setSuggestions(res.suggestions || []);
    } else {
      setUsernameError('');
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestedName) => {
    setEditForm((prev) => ({ ...prev, gamingUsername: suggestedName }));
    setUsernameError('');
    setSuggestions([]);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setUsernameError('');
    setSuggestions([]);

    const apiResult = await updateUserProfileAPI({
      email: userProfile.email,
      name: editForm.name,
      gamingUsername: editForm.gamingUsername,
      phone: editForm.phone,
      avatar: editForm.avatar
    });

    if (apiResult && apiResult.success === false && apiResult.suggestions) {
      setUsernameError(apiResult.message);
      setSuggestions(apiResult.suggestions);
      setIsSaving(false);
      return;
    }

    updateUserProfile(editForm);
    setUsernameError('');
    setSuggestions([]);
    setIsSaving(false);
    showToast('Profile details updated successfully!', 'success');
  };

  const userRegistrations = userProfile.registeredTournaments.map((reg) => {
    const trnInfo = tournaments.find(t => t.id === reg.tournamentId) || {
      title: reg.tournamentTitle || '8 Ball Pool Tournament',
      game: '8 Ball Pool',
      gameIcon: '🎱',
      date: '2026-08-28',
      time: '08:00 PM IST',
      prizePool: 2500,
      status: 'Registration Open',
      resultState: 'NOT_READY'
    };
    const paymentStatus = reg.status || 'Confirmed';
    const tournamentStatus = trnInfo.status || 'Registration Open';
    return {
      ...trnInfo,
      ...reg,
      paymentStatus,
      tournamentStatus,
      isLiveStreaming: trnInfo.isLiveStreaming || false,
      resultState: trnInfo.resultState || 'NOT_READY'
    };
  });

  const defaultAvatarFallback = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Hidden File Input for Device Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Header Dashboard Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 glass-panel relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            
            {/* Profile Avatar with Camera Edit Overlay */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-xl overflow-hidden">
                <img
                  src={userProfile.avatar || defaultAvatarFallback}
                  alt={userProfile.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatarFallback;
                  }}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Camera Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-slate-950/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all duration-200 cursor-pointer backdrop-blur-xs"
                title="Upload Photo from Device"
              >
                <Camera className="w-6 h-6 text-purple-300" />
                <span className="text-[10px] font-bold uppercase mt-0.5">Edit Photo</span>
              </button>

              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow pointer-events-none">
                {userProfile.rank}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  {userProfile.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {userProfile.rank}
                </span>
              </div>

              <p className="text-xs text-purple-300 font-mono font-bold mt-1">
                8 Ball Pool ID: <span className="text-white">{userProfile.gamingUsername || 'Not Configured'}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Player Tag: {userProfile.playerId}</p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1.5 underline underline-offset-4"
              >
                <Camera className="w-3.5 h-3.5" />
                Change Profile Photo
              </button>
            </div>
          </div>

          {/* Clean Player Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">DD Points</span>
              <p className="font-mono font-black text-xl text-purple-400 mt-0.5">{userProfile.ddPoints}</p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Wins / Losses</span>
              <p className="font-mono font-black text-xl text-emerald-400 mt-0.5">{userProfile.wins}W / {userProfile.losses}L</p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tournaments</span>
              <p className="font-mono font-black text-xl text-cyan-400 mt-0.5">{userProfile.totalTournamentsPlayed}</p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Winnings</span>
              <p className="font-mono font-black text-xl text-amber-400 mt-0.5">₹{userProfile.totalWinnings}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'myTournaments', label: `My Tickets (${userRegistrations.length})` },
          { id: 'settings', label: 'Edit Profile Settings' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Active Registrations
              </h3>
              
              {userRegistrations.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-950 text-center space-y-4 border border-slate-800">
                  <span className="text-3xl">🎱</span>
                  <div>
                    <h4 className="font-heading font-bold text-white text-base">NO ACTIVE TICKETS</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      You have not registered for any 8 Ball Pool tournaments yet. Join an active tournament to receive your ticket!
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('tournaments')}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow"
                  >
                    Browse 8 Ball Tournaments
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userRegistrations.map((reg, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-purple-400">Ticket: {reg.registrationId}</span>
                        <h4 className="font-bold text-white text-base">{reg.title}</h4>
                        <p className="text-xs text-slate-400">{reg.date} at {reg.time}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        reg.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {reg.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">Player Details</h3>
              <div className="text-xs space-y-3 text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono">{userProfile.phone || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Email:</span>
                  <span>{userProfile.email || 'Not set'}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('settings')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider"
              >
                Edit Profile Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MY TOURNAMENTS & TICKETS */}
      {activeTab === 'myTournaments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-6 rounded-3xl glass-panel border border-slate-800">
            <div>
              <h3 className="font-heading font-black text-2xl text-white">My Registered Tournaments & Paid Tickets</h3>
              <p className="text-xs text-slate-400">View all your registered esports tournaments, entry fee payment status, and match room codes.</p>
            </div>
            <button
              onClick={() => navigateTo('tournaments')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow"
            >
              + Join More Tournaments
            </button>
          </div>

          {userRegistrations.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center space-y-4">
              <span className="text-4xl block">🎟️</span>
              <h4 className="font-heading font-bold text-white text-lg">NO REGISTERED TICKETS FOUND</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You have not registered for any tournaments yet. Browse active 8 Ball Pool, BGMI, and Free Fire events to register!
              </p>
              <button
                onClick={() => navigateTo('tournaments')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-lg"
              >
                Browse Active Tournaments
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRegistrations.map((reg, idx) => (
                <div key={idx} className="p-6 rounded-3xl glass-panel border border-purple-500/30 space-y-4 shadow-xl relative overflow-hidden">
                  
                  {/* Top Bar: Ticket ID & Status Badge */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">TICKET ID</span>
                      <span className="font-mono font-extrabold text-base text-emerald-400">{reg.registrationId || reg.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {reg.tournamentStatus === 'Live' || reg.isLiveStreaming ? (
                        <button
                          onClick={() => navigateTo('live')}
                          className="px-3 py-1 rounded-full text-xs font-black uppercase border bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 flex items-center gap-1 animate-pulse cursor-pointer"
                          title="Click to Watch Live Stream"
                        >
                          <Play className="w-3 h-3 fill-white" /> 🔴 LIVE MATCH
                        </button>
                      ) : reg.tournamentStatus === 'Result Pending' || reg.tournamentStatus === 'Wait for Result' || reg.tournamentStatus === 'Waiting for Result' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase border bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1.5 shadow animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> ⏳ RESULT PENDING
                        </span>
                      ) : reg.tournamentStatus === 'Completed' || reg.tournamentStatus === 'Expired' || reg.tournamentStatus === 'Ended' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase border bg-slate-800 text-slate-300 border-slate-700 flex items-center gap-1.5 shadow">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 🏁 EXPIRED & ENDED
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase border bg-cyan-500/20 text-cyan-300 border-cyan-500/40 flex items-center gap-1.5 shadow">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" /> 📅 UPCOMING MATCH
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DYNAMIC ACTION CTA BASED ON TOURNAMENT STATUS */}
                  {reg.tournamentStatus === 'Live' || reg.isLiveStreaming ? (
                    <button
                      onClick={() => navigateTo('live')}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 animate-pulse cursor-pointer border border-rose-400/50"
                    >
                      <Play className="w-4 h-4 fill-white" /> 🔴 WATCH LIVE STREAM MATCH NOW
                    </button>
                  ) : reg.tournamentStatus === 'Result Pending' || reg.tournamentStatus === 'Wait for Result' || reg.tournamentStatus === 'Waiting for Result' ? (
                    <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs space-y-2.5 shadow-lg">
                      <div className="flex items-center gap-2 font-heading font-black text-amber-300 text-sm">
                        <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                        <span>MATCH COMPLETE — WAITING FOR RESULT</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        This tournament match has finished! The admin team is currently verifying scores & match statistics. Official rankings and prize declarations will be published soon.
                      </p>
                      <button
                        onClick={() => navigateTo('winners')}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trophy className="w-4 h-4 text-amber-300" /> Check Winner Standings & Leaderboard
                      </button>
                    </div>
                  ) : reg.tournamentStatus === 'Completed' || reg.tournamentStatus === 'Expired' || reg.tournamentStatus === 'Ended' ? (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 text-xs space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-heading font-black text-purple-300 text-sm">
                          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>TOURNAMENT EXPIRED & ENDED</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          Expired
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        This tournament is expired. Check out the final official winner leaderboard or wait and register for the next upcoming match!
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        <button
                          onClick={() => navigateTo('winners')}
                          className="w-full sm:w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trophy className="w-3.5 h-3.5" /> View Winners
                        </button>
                        <button
                          onClick={() => navigateTo('tournaments')}
                          className="w-full sm:w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" /> Join Next Tournament
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-cyan-300">
                        <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Match Scheduled: {reg.date} at {reg.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Match Room ID & Password will be published here before match start time. Prepare your gaming ID!
                      </p>
                    </div>
                  )}

                  {/* Tournament Name & Game Badge */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 inline-block">
                      {reg.gameIcon || '🎮'} {reg.game || 'Esports Tournament'}
                    </span>
                    <h4 className="font-heading font-black text-xl text-white">{reg.title}</h4>
                  </div>

                  {/* Entry Fee & Registered Date Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Entry Fee Paid</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {reg.entryFee && reg.entryFee > 0 ? `₹${reg.entryFee}` : 'Free Entry'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Match Time</span>
                      <span className="font-bold text-purple-300 text-xs block">{reg.date}</span>
                      <span className="text-slate-400 text-[11px]">{reg.time}</span>
                    </div>
                  </div>

                  {/* Payment Status Notice */}
                  {reg.status === 'Pending Verification' ? (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Payment Verification Pending</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Your payment screenshot is under review by the DD Gaming Admin team. Slot confirmation will update here automatically upon approval.
                      </p>
                    </div>
                  ) : reg.status === 'Confirmed' ? (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Slot Confirmed & Active</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Your registration ticket is confirmed! Match Room ID & Password will be published here before match start time.
                      </p>
                    </div>
                  ) : null}

                  {/* Player & Gaming Details */}
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">Registered Player</span>
                      <span className="font-bold text-white">{reg.playerName || userProfile.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">Gaming ID</span>
                      <span className="font-mono font-bold text-purple-300">{reg.gamingId || userProfile.gamingUsername}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-8 rounded-2xl glass-panel border border-white/10 max-w-2xl space-y-6">
          <h3 className="font-heading font-bold text-xl text-white">Edit Player Profile</h3>

          {/* Profile Photo Uploader Section */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500 shrink-0">
              <img
                src={editForm.avatar || defaultAvatarFallback}
                alt="Avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatarFallback;
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Profile Photo</h4>
              <p className="text-xs text-slate-400">Upload a custom image from your device</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photo
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            {/* 8 Ball Pool Gaming Username Field with Live Database Availability Check */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                8 Ball Pool Gaming Username / Unique ID
              </label>
              <input
                type="text"
                placeholder="e.g. 8BallKing_Rahul"
                value={editForm.gamingUsername}
                onChange={(e) => handleUsernameCheck(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                  usernameError ? 'border-rose-500 focus:border-rose-500' : ''
                }`}
              />

              {/* Username Error & Suggested Usernames */}
              {usernameError && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{usernameError}</span>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-semibold w-full">Suggested available usernames:</span>
                      {suggestions.map((suggested, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggested)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-400/40 text-xs font-mono font-bold transition-all"
                        >
                          {suggested}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || !!usernameError}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </form>
      )}

    </div>
  );
}
