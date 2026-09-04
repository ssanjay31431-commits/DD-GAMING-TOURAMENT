import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Plus, CheckCircle2, XCircle, Trash2, Edit3, Users, DollarSign,
  Trophy, Sparkles, Filter, RefreshCw, Eye, QrCode, AlertTriangle, Layers,
  Activity, Play, CheckSquare, Clock, History, Settings, Award, Crosshair, LogOut, Lock, AlertCircle, EyeOff, Menu, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGameBanner } from '../utils/gameBanners';
import AdminLogin from '../components/AdminLogin';
import { touchProps } from '../utils/touchHelper';

export default function Admin() {
  const {
    tournaments,
    registrations,
    adminApprovePayment,
    adminRejectPayment,
    adminCreateTournament,
    adminUpdateTournamentStatus,
    adminUpdateTournament,
    adminDeleteTournament,
    adminLiveUpdateTournament,
    adminVerifyResults,
    isAdminAuth,
    adminLogin,
    adminLogout,
    adminMarkPrizePaid,
    adminDeleteAllData,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [tournamentFilter, setTournamentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewQrModalReg, setViewQrModalReg] = useState(null);
  const [editingTrn, setEditingTrn] = useState(null);
  const [confirmDeleteTrn, setConfirmDeleteTrn] = useState(null);
  const [prizeTxnInputs, setPrizeTxnInputs] = useState({});

  // Delete All System Data State
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteAllPassword, setDeleteAllPassword] = useState('');
  const [showDeleteAllPassword, setShowDeleteAllPassword] = useState(false);
  const [deleteAllError, setDeleteAllError] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleConfirmDeleteAllData = async (e) => {
    if (e) e.preventDefault();
    setDeleteAllError('');

    if (!deleteAllPassword || !deleteAllPassword.trim()) {
      setDeleteAllError('Please enter admin password.');
      return;
    }

    setIsDeletingAll(true);
    const res = await adminDeleteAllData(deleteAllPassword);
    setIsDeletingAll(false);

    if (res && res.success) {
      setIsDeleteAllModalOpen(false);
      setDeleteAllPassword('');
      setDeleteAllError('');
    } else {
      setDeleteAllError(res?.message || 'Invalid Admin Password or failed to delete data.');
    }
  };

  const handleAdminLogout = () => {
    adminLogout();
  };

  if (!isAdminAuth) {
    return <AdminLogin onLoginSuccess={() => adminLogin({ username: 'ddgaming', password: 'ddgaming2026' })} />;
  }

  // Dynamic Create Tournament Form State
  const [game, setGame] = useState('8 Ball Pool');
  const [gameCode, setGameCode] = useState('8ball');
  const [gameIcon, setGameIcon] = useState('🎱');
  const [title, setTitle] = useState('DD 8 Ball Pool Super Clash');
  const [mode, setMode] = useState('1v1 Knockout');
  const [entryType, setEntryType] = useState('Solo'); // 'Solo' | 'Duo' | 'Team'
  const [teamSize, setTeamSize] = useState(1);
  const [maxCapacity, setMaxCapacity] = useState(32); // max players or teams
  const [entryFee, setEntryFee] = useState(100);
  const [date, setDate] = useState('2026-08-30');
  const [time, setTime] = useState('08:00 PM IST');
  const [description, setDescription] = useState('Special esports tournament managed by DD Gaming Admin.');
  const [rulesInput, setRulesInput] = useState('1. Fair play rules apply.\n2. Submit match victory screenshot.');
  
  // Profit Configuration Mode
  const [profitMode, setProfitMode] = useState('manual'); // 'manual' | 'targetProfit'
  const [targetProfit, setTargetProfit] = useState(1000);

  // Prizes State
  const [prize1, setPrize1] = useState(1500);
  const [prize2, setPrize2] = useState(1000);
  const [prize3, setPrize3] = useState(500);
  const [killReward, setKillReward] = useState(0);

  // Sync game defaults when game changes
  useEffect(() => {
    if (game === '8 Ball Pool') {
      setGameCode('8ball');
      setGameIcon('🎱');
      setMode('1v1 Knockout');
      setEntryType('Solo');
      setTeamSize(1);
      setMaxCapacity(32);
      setEntryFee(100);
      setPrize1(1600);
      setPrize2(1000);
      setPrize3(400);
      setKillReward(0);
    } else if (game === 'BGMI') {
      setGameCode('bgmi');
      setGameIcon('🎯');
      setMode('Battle Royale Squad');
      setEntryType('Team');
      setTeamSize(4);
      setMaxCapacity(25);
      setEntryFee(150);
      setPrize1(1500);
      setPrize2(1000);
      setPrize3(500);
      setKillReward(250);
    } else if (game === 'Free Fire') {
      setGameCode('freefire');
      setGameIcon('🔥');
      setMode('Custom Match Squad');
      setEntryType('Team');
      setTeamSize(4);
      setMaxCapacity(25);
      setEntryFee(120);
      setPrize1(1400);
      setPrize2(800);
      setPrize3(400);
      setKillReward(200);
    } else if (game === 'Chess') {
      setGameCode('chess');
      setGameIcon('♟');
      setMode('1v1 Blitz Knockout');
      setEntryType('Solo');
      setTeamSize(1);
      setMaxCapacity(8);
      setEntryFee(100);
      setPrize1(500);
      setPrize2(250);
      setPrize3(0);
      setKillReward(0);
    } else if (game === 'Ludo King') {
      setGameCode('ludo');
      setGameIcon('🎲');
      setMode('4 Player Battle');
      setEntryType('Solo');
      setTeamSize(1);
      setMaxCapacity(16);
      setEntryFee(50);
      setPrize1(500);
      setPrize2(200);
      setPrize3(100);
      setKillReward(0);
    } else if (game === 'Carrom Pool') {
      setGameCode('carrom');
      setGameIcon('🥏');
      setMode('1v1 Duels');
      setEntryType('Solo');
      setTeamSize(1);
      setMaxCapacity(16);
      setEntryFee(50);
      setPrize1(500);
      setPrize2(200);
      setPrize3(100);
      setKillReward(0);
    }
  }, [game]);

  // Calculations
  const totalCollection = maxCapacity * entryFee;
  const totalPrizesCalculated = Number(prize1) + Number(prize2) + Number(prize3) + Number(killReward);
  const profitCalculated = totalCollection - totalPrizesCalculated;
  const isPrizeInvalid = totalPrizesCalculated > totalCollection && totalCollection > 0;

  // Target profit auto calculation handler
  const applyTargetProfitAllocation = () => {
    const availablePool = Math.max(0, totalCollection - Number(targetProfit));
    setPrize1(Math.round(availablePool * 0.5));
    setPrize2(Math.round(availablePool * 0.3));
    setPrize3(Math.round(availablePool * 0.2));
    setKillReward(0);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (isPrizeInvalid) {
      showToast('INVALID PRIZE DISTRIBUTION! Total prize exceeds collection.', 'error');
      return;
    }

    const rules = rulesInput.split('\n').filter(r => r.trim());
    const trnData = {
      title,
      game,
      gameCode,
      gameIcon,
      mode,
      entryType,
      teamSize: Number(teamSize),
      totalSlots: Number(maxCapacity),
      maxCapacity: Number(maxCapacity),
      entryFee: Number(entryFee),
      totalCollection,
      totalPrize: totalPrizesCalculated,
      prizePool: totalPrizesCalculated,
      profit: profitCalculated,
      targetProfit: Number(targetProfit),
      killReward: Number(killReward),
      date,
      time,
      description,
      rules,
      status: 'Registration Open',
      format: mode,
      prizes: [
        { rank: '1st Place 🥇', amount: Number(prize1) },
        { rank: '2nd Place 🥈', amount: Number(prize2) },
        { rank: '3rd Place 🥉', amount: Number(prize3) }
      ]
    };

    const res = await adminCreateTournament(trnData);
    if (res && res.success) {
      setActiveTab('tournaments');
    }
  };

  // Metrics
  const pendingCount = registrations.filter(r => r.status === 'Pending Verification').length;
  const verifiedRevenue = registrations.filter(r => r.status === 'Confirmed').reduce((sum, r) => sum + (r.entryFee || 0), 0);
  const liveCount = tournaments.filter(t => t.status === 'Live').length;
  const pendingResultCount = tournaments.filter(t => t.status === 'Result Pending').length;
  const completedCount = tournaments.filter(t => t.status === 'Completed').length;
  const winnerClaimCount = registrations.filter(r => r.qrCodeUrl && r.prizePaymentStatus === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-purple-950 border-2 border-rose-500/50 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-500/30">
              <ShieldAlert className="w-4 h-4" /> DD GAMING ADMIN MASTER CONTROL PANEL
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
              ADMIN DASHBOARD
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              {...touchProps(() => {
                setDeleteAllPassword('');
                setDeleteAllError('');
                setIsDeleteAllModalOpen(true);
              })}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 border border-red-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer touch-manipulation min-h-[44px]"
            >
              <Trash2 className="w-4 h-4 text-red-200 pointer-events-none" />
              <span>Delete All Data</span>
            </button>
            <button
              type="button"
              {...touchProps(() => setActiveTab('create'))}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 touch-manipulation cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4 pointer-events-none" /> + CREATE NEW TOURNAMENT
            </button>
            <button
              type="button"
              {...touchProps(handleAdminLogout)}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-1.5 shadow touch-manipulation cursor-pointer min-h-[44px]"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4 pointer-events-none" /> Logout
            </button>
          </div>
        </div>

        {/* Quick Analytics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-4 border-t border-rose-500/20">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Regs</span>
            <span className="font-mono font-black text-xl text-white mt-0.5 block">{registrations.length}</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Verified Revenue</span>
            <span className="font-mono font-black text-xl text-emerald-400 mt-0.5 block">₹{verifiedRevenue.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pending Payments</span>
            <span className="font-mono font-black text-xl text-amber-400 mt-0.5 block">{pendingCount}</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Live Tournaments</span>
            <span className="font-mono font-black text-xl text-rose-400 mt-0.5 block">{liveCount}</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pending Results</span>
            <span className="font-mono font-black text-xl text-purple-300 mt-0.5 block">{pendingResultCount}</span>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Winner QR Claims</span>
            <span className="font-mono font-black text-xl text-cyan-300 mt-0.5 block">{winnerClaimCount}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'create', label: '+ Create Tournament', icon: Plus, highlight: true },
          { id: 'tournaments', label: `Tournaments (${tournaments.length})`, icon: Layers },
          { id: 'payments', label: `Payments (${pendingCount})`, icon: DollarSign },
          { id: 'registrations', label: 'Registrations', icon: Users },
          { id: 'live', label: `Live (${liveCount})`, icon: Play },
          { id: 'results', label: `Verify Results (${pendingResultCount})`, icon: CheckSquare },
          { id: 'prizes', label: `Prize Payments (${winnerClaimCount})`, icon: QrCode },
          { id: 'history', label: 'Tournament History', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              {...touchProps(() => setActiveTab(tab.id))}
              className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 border touch-manipulation cursor-pointer min-h-[44px] ${
                isActive
                  ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/25'
                  : tab.highlight
                  ? 'bg-purple-950/80 border-purple-500/40 text-purple-300 hover:bg-purple-900'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 pointer-events-none" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Tournaments</span>
              <p className="font-heading font-black text-3xl text-white">{tournaments.length}</p>
              <p className="text-xs text-purple-300">{liveCount} Live • {pendingResultCount} Pending Verification</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Collected Entry Fees</span>
              <p className="font-heading font-black text-3xl text-emerald-400">₹{verifiedRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Verified player UTR payments</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Pending Action Items</span>
              <p className="font-heading font-black text-3xl text-amber-400">{pendingCount + winnerClaimCount}</p>
              <p className="text-xs text-slate-400">{pendingCount} UTR verifications • {winnerClaimCount} Winner QR payouts</p>
            </div>
          </div>

          {/* Currently Running Live Tournaments */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-rose-500 animate-pulse" /> Live Tournaments Control Panel
            </h3>

            {tournaments.filter(t => t.status === 'Live').length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
                No tournaments are currently LIVE. Select a tournament under "Tournaments" tab and change status to "Live".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tournaments.filter(t => t.status === 'Live').map(trn => (
                  <div key={trn.id} className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-purple-950/40 border border-rose-500/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/40 animate-pulse flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> 🔴 LIVE MATCH IN PROGRESS
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">{trn.gameIcon} {trn.game}</span>
                    </div>

                    <div>
                      <h4 className="font-heading font-black text-xl text-white">{trn.title}</h4>
                      <p className="text-xs text-slate-400">{trn.mode || 'Standard Mode'} • Capacity: {trn.registeredSlots}/{trn.totalSlots}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-2.5 rounded-2xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Entry Collection</span>
                        <span className="font-bold text-emerald-400">₹{trn.totalCollection || (trn.registeredSlots * trn.entryFee)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Prize Pool</span>
                        <span className="font-bold text-amber-400">₹{trn.totalPrize || trn.prizePool}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Admin Profit</span>
                        <span className="font-bold text-purple-300">₹{trn.profit || 0}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('live')}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1"
                    >
                      Open Live Management Dashboard
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DYNAMIC CREATE TOURNAMENT TAB */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateSubmit} className="p-8 rounded-3xl glass-panel border border-slate-800 max-w-4xl space-y-8 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <span className="px-3 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
              DYNAMIC GAME CONFIGURATION
            </span>
            <h2 className="font-heading font-black text-3xl text-white mt-1">Create New Tournament</h2>
            <p className="text-xs text-slate-400">Select game title below to automatically adapt fields according to game rules & modes.</p>
          </div>

          {/* GAME SELECTOR */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">1. Select Game Title *</label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {[
                { name: '8 Ball Pool', icon: '🎱' },
                { name: 'BGMI', icon: '🎯' },
                { name: 'Free Fire', icon: '🔥' },
                { name: 'Chess', icon: '♟' },
                { name: 'Ludo King', icon: '🎲' },
                { name: 'Carrom Pool', icon: '🥏' }
              ].map(g => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => {
                    setGame(g.name);
                    setBanner(getGameBanner(g.name));
                  }}
                  className={`p-3 rounded-2xl text-center border font-heading font-bold text-xs transition-all ${
                    game === g.name
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl block mb-1">{g.icon}</span>
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* COMMON & GAME-SPECIFIC FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Tournament Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Game Mode *</label>
              <input
                type="text"
                required
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                placeholder="e.g. 1v1 Knockout / Squad BR"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Entry Type *</label>
              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-slate-900"
              >
                <option value="Solo">Solo (Single Player)</option>
                <option value="Duo">Duo (2 Players per Team)</option>
                <option value="Team">Squad / Team (Configurable Size)</option>
              </select>
            </div>

            {entryType !== 'Solo' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Maximum Members Per Team *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {entryType === 'Solo' ? 'Maximum Player Capacity *' : 'Maximum Team Capacity *'}
              </label>
              <input
                type="number"
                required
                min="2"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-bold text-purple-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Entry Fee (₹ per {entryType === 'Solo' ? 'Player' : 'Team'}) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tournament Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Start Time *</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="08:00 PM IST"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* AUTOMATIC COLLECTION DISPLAY */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Automatic Total Collection Calculation</span>
              <p className="text-xs text-slate-500">Formula: {maxCapacity} {entryType === 'Solo' ? 'players' : 'teams'} × ₹{entryFee} fee</p>
            </div>
            <span className="font-mono font-black text-2xl text-emerald-400">₹{totalCollection.toLocaleString()}</span>
          </div>

          {/* ADMIN PRIZE & PROFIT SYSTEM */}
          <div className="space-y-4 border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-lg text-white">Prize Distribution & Profit Configuration</h4>
                <p className="text-xs text-slate-400">Admin controls prize amounts. Profit is calculated automatically (`Collection - Prizes`).</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProfitMode('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${profitMode === 'manual' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Manual Prizes
                </button>
                <button
                  type="button"
                  onClick={() => setProfitMode('targetProfit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${profitMode === 'targetProfit' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                  Target Profit Mode
                </button>
              </div>
            </div>

            {profitMode === 'targetProfit' && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-grow">
                  <label className="block text-xs font-bold text-purple-300 mb-1">Set Target Admin Profit (₹)</label>
                  <input
                    type="number"
                    value={targetProfit}
                    onChange={(e) => setTargetProfit(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyTargetProfitAllocation}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Calculate Prizes
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">1st Prize (₹) *</label>
                <input
                  type="number"
                  required
                  value={prize1}
                  onChange={(e) => setPrize1(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">2nd Prize (₹)</label>
                <input
                  type="number"
                  value={prize2}
                  onChange={(e) => setPrize2(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-bold text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">3rd Prize (₹)</label>
                <input
                  type="number"
                  value={prize3}
                  onChange={(e) => setPrize3(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-bold text-amber-700"
                />
              </div>

              {(game === 'BGMI' || game === 'Free Fire') && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kill Rewards Pool (₹)</label>
                  <input
                    type="number"
                    value={killReward}
                    onChange={(e) => setKillReward(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-bold text-rose-400"
                  />
                </div>
              )}
            </div>

            {/* PRIZE VALIDATION ALERT */}
            {isPrizeInvalid ? (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <strong className="block font-black text-sm uppercase">INVALID PRIZE DISTRIBUTION!</strong>
                  Total prize distribution (₹{totalPrizesCalculated.toLocaleString()}) exceeds total collection (₹{totalCollection.toLocaleString()}). Please decrease prize amounts.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Collection</span>
                  <span className="font-mono font-black text-lg text-emerald-400">₹{totalCollection.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Prizes</span>
                  <span className="font-mono font-black text-lg text-amber-400">₹{totalPrizesCalculated.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Calculated Profit</span>
                  <span className="font-mono font-black text-lg text-purple-300">₹{profitCalculated.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPrizeInvalid}
            className={`w-full py-4 rounded-2xl font-heading font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2 ${
              isPrizeInvalid
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-rose-500/25'
            }`}
          >
            Publish Tournament Now
          </button>
        </form>
      )}

      {/* 3. TOURNAMENTS LIST TAB */}
      {activeTab === 'tournaments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-heading font-bold text-xl text-white">All Tournaments ({tournaments.length})</h3>
            <select
              value={tournamentFilter}
              onChange={(e) => setTournamentFilter(e.target.value)}
              className="px-4 py-2 rounded-xl glass-input text-xs font-bold bg-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="Registration Open">Registration Open</option>
              <option value="Live">Live</option>
              <option value="Result Pending">Result Pending</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments
              .filter(t => tournamentFilter === 'all' || t.status === tournamentFilter)
              .map((trn) => (
                <div key={trn.id} className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white bg-purple-600/30 px-3 py-1 rounded-md border border-purple-500/40">
                      {trn.gameIcon} {trn.game}
                    </span>
                    <select
                      value={trn.status}
                      onChange={(e) => adminUpdateTournamentStatus(trn.id, e.target.value)}
                      className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200"
                    >
                      <option value="Registration Open">Registration Open</option>
                      <option value="Registration Closed">Registration Closed</option>
                      <option value="Live">Live</option>
                      <option value="Result Pending">Result Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="font-heading font-black text-xl text-white">{trn.title}</h4>
                    <p className="text-xs text-slate-400">{trn.date} at {trn.time} • Mode: {trn.mode || 'Standard'}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs bg-slate-950 p-3 rounded-2xl text-center">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Fee</span>
                      <span className="font-bold text-emerald-400">₹{trn.entryFee}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Prize</span>
                      <span className="font-bold text-amber-400">₹{trn.totalPrize || trn.prizePool}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Profit</span>
                      <span className="font-bold text-purple-300">₹{trn.profit || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Slots</span>
                      <span className="font-bold text-cyan-300">{trn.registeredSlots}/{trn.totalSlots}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setEditingTrn({ ...trn })}
                      className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-purple-500/40 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteTrn(trn)}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-rose-500/40 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. PAYMENT VERIFICATION QUEUE TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-white">Entry Payment Approvals</h3>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 rounded-xl glass-input text-xs font-bold bg-slate-900"
            >
              <option value="all">All Registrations</option>
              <option value="Pending Verification">Pending Only ({pendingCount})</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto max-w-full rounded-2xl glass-panel border border-slate-800 shadow-xl">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Ticket ID</th>
                  <th className="py-4 px-6">Player / Team</th>
                  <th className="py-4 px-6">Tournament</th>
                  <th className="py-4 px-6">Fee & UTR ID</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {registrations
                  .filter(r => paymentFilter === 'all' || r.status === paymentFilter)
                  .map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-purple-300">{reg.id}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-white block">{reg.playerName}</span>
                        <span className="text-xs text-purple-300 font-mono">Gaming ID: {reg.gamingId}</span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-200">{reg.tournamentTitle}</td>
                      <td className="py-4 px-6">
                        <span className="font-black text-emerald-400 block">₹{reg.entryFee}</span>
                        <span className="text-xs text-slate-400 font-mono">UTR: {reg.txnId}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          reg.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          reg.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {reg.status === 'Pending Verification' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => adminApprovePayment(reg.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => adminRejectPayment(reg.id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. PRIZE PAYMENTS TAB (VIEW WINNER QR CODES) */}
      {activeTab === 'prizes' && (
        <div className="space-y-6">
          <h3 className="font-heading font-bold text-xl text-white">Winner Prize Payments & QR Code Inspection</h3>
          <p className="text-xs text-slate-400">Review uploaded recipient QR codes and mark prize amounts as SENT after payment transfer.</p>

          <div className="overflow-x-auto max-w-full rounded-2xl glass-panel border border-slate-800 shadow-xl">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Winner / Player</th>
                  <th className="py-4 px-6">Tournament</th>
                  <th className="py-4 px-6">Award Rank</th>
                  <th className="py-4 px-6">Prize Amount</th>
                  <th className="py-4 px-6">Winner QR</th>
                  <th className="py-4 px-6">Payout Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {registrations
                  .filter(r => r.qrCodeUrl || r.prizeAmount > 0)
                  .map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">{reg.playerName}</td>
                      <td className="py-4 px-6 text-slate-300">{reg.tournamentTitle}</td>
                      <td className="py-4 px-6 font-bold text-amber-400">{reg.prizeRank || 'Winner'}</td>
                      <td className="py-4 px-6 font-mono font-black text-emerald-400 text-base">₹{reg.prizeAmount || 0}</td>
                      <td className="py-4 px-6">
                        {reg.qrCodeUrl ? (
                          <button
                            onClick={() => setViewQrModalReg(reg)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" /> View QR Code
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">Waiting for Winner QR</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          reg.prizePaymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {reg.prizePaymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {reg.prizePaymentStatus !== 'Paid' ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="text"
                              placeholder="Txn Ref ID"
                              value={prizeTxnInputs[reg.id] || ''}
                              onChange={(e) => setPrizeTxnInputs({ ...prizeTxnInputs, [reg.id]: e.target.value })}
                              className="px-2.5 py-1 rounded-lg glass-input text-xs w-28 bg-slate-900"
                            />
                            <button
                              onClick={() => adminMarkPrizePaid(reg.id, prizeTxnInputs[reg.id])}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              Mark PAID
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">Paid on {reg.paidAt || 'Confirmed'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR CODE INSPECTION MODAL */}
      {viewQrModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/40 max-w-sm w-full text-center space-y-4">
            <h4 className="font-heading font-black text-xl text-white">Winner Payment QR</h4>
            <p className="text-xs text-slate-300">{viewQrModalReg.playerName} • {viewQrModalReg.tournamentTitle}</p>

            <div className="p-3 rounded-2xl bg-white mx-auto max-w-[220px]">
              <img src={viewQrModalReg.qrCodeUrl} alt="Winner QR Code" className="w-full h-auto rounded-lg" />
            </div>

            <button
              onClick={() => setViewQrModalReg(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* EDIT TOURNAMENT MODAL */}
      {editingTrn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/40 max-w-2xl w-full my-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">EDIT TOURNAMENT</span>
                <h3 className="font-heading font-black text-2xl text-white">{editingTrn.title}</h3>
              </div>
              <button onClick={() => setEditingTrn(null)} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Tournament Title</label>
                <input
                  type="text"
                  value={editingTrn.title || ''}
                  onChange={(e) => setEditingTrn({ ...editingTrn, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Game Mode</label>
                <input
                  type="text"
                  value={editingTrn.mode || ''}
                  onChange={(e) => setEditingTrn({ ...editingTrn, mode: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Entry Type</label>
                <select
                  value={editingTrn.entryType || 'Solo'}
                  onChange={(e) => setEditingTrn({ ...editingTrn, entryType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-slate-900"
                >
                  <option value="Solo">Solo (Single Player)</option>
                  <option value="Duo">Duo (2 Players per Team)</option>
                  <option value="Team">Squad / Team (4 Players per Team)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Max Capacity / Slots</label>
                <input
                  type="number"
                  value={editingTrn.totalSlots || editingTrn.maxCapacity || 0}
                  onChange={(e) => setEditingTrn({ ...editingTrn, totalSlots: Number(e.target.value), maxCapacity: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Entry Fee (₹)</label>
                <input
                  type="number"
                  value={editingTrn.entryFee || 0}
                  onChange={(e) => setEditingTrn({ ...editingTrn, entryFee: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tournament Date</label>
                <input
                  type="date"
                  value={editingTrn.date || ''}
                  onChange={(e) => setEditingTrn({ ...editingTrn, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Start Time</label>
                <input
                  type="text"
                  value={editingTrn.time || ''}
                  onChange={(e) => setEditingTrn({ ...editingTrn, time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTrn(null)}
                className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await adminUpdateTournament(editingTrn.id, editingTrn);
                  setEditingTrn(null);
                }}
                className="w-2/3 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteTrn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-rose-500/50 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-heading font-black text-2xl text-white">Delete Tournament?</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                This tournament will be permanently removed from the platform. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteTrn(null)}
                className="w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = confirmDeleteTrn?.id || confirmDeleteTrn?._id;
                  if (targetId) {
                    await adminDeleteTournament(targetId);
                  }
                  setConfirmDeleteTrn(null);
                }}
                className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 transition-all"
              >
                Delete Tournament
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All System Data Confirmation Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border-2 border-red-500/60 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-red-500/30 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-white uppercase tracking-wide">DELETE ALL SYSTEM DATA</h3>
                <p className="text-xs text-red-300 font-semibold">Dangerous Action • Password Required</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ⚠️ Warning: This will <strong className="text-red-400">permanently delete ALL tournaments, player registrations, match results, notifications, and audit logs</strong>. This action cannot be undone!
            </p>

            {deleteAllError && (
              <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{deleteAllError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmDeleteAllData} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Enter Admin Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showDeleteAllPassword ? "text" : "password"}
                    required
                    value={deleteAllPassword}
                    onChange={(e) => setDeleteAllPassword(e.target.value)}
                    placeholder="Enter admin password (e.g. ddgaming2026)"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-sm font-semibold border-red-500/30 focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeleteAllPassword(!showDeleteAllPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                    title={showDeleteAllPassword ? "Hide Password" : "Show Password"}
                  >
                    {showDeleteAllPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAll || !deleteAllPassword.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-heading font-black uppercase tracking-wider shadow-lg shadow-red-950/50 flex items-center gap-2 cursor-pointer"
                >
                  {isDeletingAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Deleting All...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Confirm Delete All Data</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
