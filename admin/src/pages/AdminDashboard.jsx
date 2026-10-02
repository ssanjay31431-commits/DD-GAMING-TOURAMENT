import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Plus, CheckCircle2, XCircle, Trash2, Edit3, Users, DollarSign,
  Trophy, Sparkles, Filter, RefreshCw, Eye, QrCode, AlertTriangle, Layers,
  Activity, Play, CheckSquare, Clock, History, Settings, Award, Crosshair, LogOut, ArrowLeft, Key,
  Mail, Send, MessageSquare, Lock, AlertCircle, EyeOff, Menu, X, ChevronDown, ChevronUp, Copy, Check, Search
} from 'lucide-react';
import { useAdminApp } from '../context/AdminContext';
import AdminLogin from '../components/AdminLogin';

export default function AdminDashboard() {
  const {
    tournaments,
    registrations,
    adminApprovePayment,
    adminRejectPayment,
    adminDeleteRegistration,
    adminCreateTournament,
    adminUpdateTournamentStatus,
    adminUpdateTournament,
    adminDeleteTournament,
    adminLiveUpdateTournament,
    adminVerifyResults,
    adminUpdateLiveStream,
    adminUpdateRoomId,
    adminSaveResults,
    isAdminAuth,
    adminLogin,
    adminLogout,
    adminMarkPrizePaid,
    adminSendEmail,
    adminDeleteAllData,
    fetchAdminParticipants,
    adminRestartJoiningWindow,
    showToast
  } = useAdminApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [tournamentFilter, setTournamentFilter] = useState('all');

  // Participants & Joining Window State
  const [selectedParticipantTrnId, setSelectedParticipantTrnId] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantStatusFilter, setParticipantStatusFilter] = useState('all');
  const [participantsData, setParticipantsData] = useState(null);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [expandedTeamIds, setExpandedTeamIds] = useState({});
  const [confirmRoomPublishModal, setConfirmRoomPublishModal] = useState(null); // { trn, roomId }
  const [nowTick, setNowTick] = useState(Date.now());
  const [viewQrModalReg, setViewQrModalReg] = useState(null);
  const [editingTrn, setEditingTrn] = useState(null);
  const [confirmDeleteTrn, setConfirmDeleteTrn] = useState(null);
  const [confirmDeleteReg, setConfirmDeleteReg] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const [selectedProofScreenshot, setSelectedProofScreenshot] = useState(null);
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [liveUrlInputs, setLiveUrlInputs] = useState({});
  const [roomIdInputs, setRoomIdInputs] = useState({});
  
  // Quick Email Sender State
  const [quickEmailModalReg, setQuickEmailModalReg] = useState(null);
  const [emailFormRecipientEmail, setEmailFormRecipientEmail] = useState('');
  const [emailFormRecipientName, setEmailFormRecipientName] = useState('');
  const [emailFormSubject, setEmailFormSubject] = useState('🎉 Slot CONFIRMED! Tournament Ticket - DD Gaming');
  const [emailFormMessage, setEmailFormMessage] = useState('Your payment proof has been verified and your slot is officially confirmed!');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendQuickEmail = async (e) => {
    if (e) e.preventDefault();
    if (!emailFormRecipientEmail || !emailFormRecipientEmail.trim()) {
      showToast('Recipient email is required.', 'error');
      return;
    }
    if (!emailFormSubject || !emailFormSubject.trim()) {
      showToast('Email subject is required.', 'error');
      return;
    }

    setIsSendingEmail(true);
    const res = await adminSendEmail({
      toEmail: emailFormRecipientEmail,
      toName: emailFormRecipientName,
      subject: emailFormSubject,
      message: emailFormMessage
    });
    setIsSendingEmail(false);

    if (res && res.success) {
      setQuickEmailModalReg(null);
    }
  };

  const handleOpenEmailModalForReg = (reg) => {
    setQuickEmailModalReg(reg);
    setEmailFormRecipientEmail(reg.email || '');
    setEmailFormRecipientName(reg.playerName || '');
    setEmailFormSubject(`✅ PAYMENT COMPLETED! Slot Confirmed - Ticket #${reg.id} - DD Gaming`);
    setEmailFormMessage(`Hello ${reg.playerName},\n\nYOUR PAYMENT IS COMPLETED & CONFIRMED! 🎉\n\nYour payment of ₹${reg.entryFee || 0} for "${reg.tournamentTitle}" has been verified. Below are your complete ticket and match schedule details:\n\n📋 TICKET & MATCH SCHEDULE DETAILS:\n• Ticket ID: ${reg.id}\n• Player Name: ${reg.playerName}\n• In-Game ID: ${reg.gamingId}\n• Tournament: ${reg.tournamentTitle}\n• Entry Fee Paid: ₹${reg.entryFee || 0} (PAID & COMPLETED)\n• Status: CONFIRMED ✅\n\n📌 Room ID & Password will be revealed 15 minutes before match start time on the DD Gaming Portal. Log in to your profile to view live match streams and standings!`);
  };

  const [selectedResultTrnId, setSelectedResultTrnId] = useState('');
  const [rankingsForm, setRankingsForm] = useState([
    { rank: 1, playerName: '', gamingId: '', prizeAmount: 1500 },
    { rank: 2, playerName: '', gamingId: '', prizeAmount: 1000 },
    { rank: 3, playerName: '', gamingId: '', prizeAmount: 500 },
    { rank: 4, playerName: '', gamingId: '', prizeAmount: 0 },
    { rank: 5, playerName: '', gamingId: '', prizeAmount: 0 },
    { rank: 6, playerName: '', gamingId: '', prizeAmount: 0 },
    { rank: 7, playerName: '', gamingId: '', prizeAmount: 0 },
    { rank: 8, playerName: '', gamingId: '', prizeAmount: 0 },
    { rank: 9, playerName: '', gamingId: '', prizeAmount: 0 },
    { rank: 10, playerName: '', gamingId: '', prizeAmount: 0 }
  ]);

  const handleAdminLogout = () => {
    adminLogout();
  };

  // 1-Second Timer Tick for live countdown displays
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto select default tournament for Participants tab
  useEffect(() => {
    if (tournaments && tournaments.length > 0 && !selectedParticipantTrnId) {
      const activeOrFirst = tournaments.find(t => t.status === 'Live' || t.status === 'Registration Open') || tournaments[0];
      setSelectedParticipantTrnId(activeOrFirst.id || activeOrFirst._id);
    }
  }, [tournaments]);

  // Load / Poll Participants data
  useEffect(() => {
    if (!selectedParticipantTrnId) return;

    let isMounted = true;
    const loadParticipants = async () => {
      const data = await fetchAdminParticipants(selectedParticipantTrnId, participantSearch, participantStatusFilter);
      if (isMounted && data) {
        setParticipantsData(data);
      }
    };

    loadParticipants();

    // Poll every 5s if activeTab is 'participants'
    let interval = null;
    if (activeTab === 'participants') {
      interval = setInterval(loadParticipants, 5000);
    }
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [selectedParticipantTrnId, participantSearch, participantStatusFilter, activeTab]);

  const uniqueRegistrations = (() => {
    const seen = new Set();
    const result = [];
    for (const r of (registrations || [])) {
      const key = `${r.tournamentId || r.tournamentTitle}_${(r.email || '').toLowerCase().trim()}_${(r.gamingId || '').trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(r);
      }
    }
    return result;
  })();

  const filteredRegistrations = uniqueRegistrations.filter(r => {
    if (paymentFilter === 'pending') return r.status === 'Pending Verification';
    if (paymentFilter === 'confirmed') return r.status === 'Confirmed';
    if (paymentFilter === 'rejected') return r.status === 'Rejected';
    return true;
  });

  const searchedRegistrations = uniqueRegistrations.filter(r => {
    const q = registrationSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.playerName || '').toLowerCase().includes(q) ||
      (r.gamingId || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q) ||
      (r.tournamentTitle || '').toLowerCase().includes(q) ||
      (r.teamName || '').toLowerCase().includes(q)
    );
  });

  if (!isAdminAuth) {
    return <AdminLogin onLoginSuccess={() => adminLogin({ username: 'ddgaming', password: 'ddgaming2026' })} />;
  }

  // Date & Time Helpers
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTimeString = (offsetMinutes = 60) => {
    const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
    let hours = d.getHours();
    const minutes = String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${minutes} ${ampm} IST`;
  };

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
  const [date, setDate] = useState(getTodayDateString);
  const [time, setTime] = useState(() => getCurrentTimeString(60));
  const [liveStartTime, setLiveStartTime] = useState(() => getCurrentTimeString(60));
  const [status, setStatus] = useState('Registration Open');
  const [registrationStartDate, setRegistrationStartDate] = useState(getTodayDateString);
  const [registrationStartTime, setRegistrationStartTime] = useState(() => getCurrentTimeString(0));
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
    const todayStr = getTodayDateString();
    const nowTimeStr = getCurrentTimeString(0);
    const startMatchTimeStr = getCurrentTimeString(60);

    setDate(todayStr);
    setRegistrationStartDate(todayStr);
    setTime(startMatchTimeStr);
    setLiveStartTime(startMatchTimeStr);
    setRegistrationStartTime(nowTimeStr);

    if (game === '8 Ball Pool') {
      setTitle('DD 8 Ball Pool Super Clash');
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
      setTitle('DD BGMI Battle Royale Squad Clash');
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
      setTitle('DD Free Fire Survival Squad Cup');
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
      setTitle('DD Chess Grandmaster Blitz Showdown');
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
      setTitle('DD Ludo King Royal Championship');
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
      setTitle('DD Carrom Pool Master Duels');
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
  const totalCollection = Number(maxCapacity || 0) * Number(entryFee || 0);
  const totalPrizesCalculated = Number(prize1 || 0) + Number(prize2 || 0) + Number(prize3 || 0) + Number(killReward || 0);
  const profitCalculated = totalCollection - totalPrizesCalculated;
  const isPrizeInvalid = totalPrizesCalculated > totalCollection && totalCollection > 0;

  // Auto recalculate target profit prizes when in targetProfit mode
  useEffect(() => {
    if (profitMode === 'targetProfit') {
      const collection = Number(maxCapacity || 0) * Number(entryFee || 0);
      const availablePool = Math.max(0, collection - Number(targetProfit || 0));
      setPrize1(Math.round(availablePool * 0.5));
      setPrize2(Math.round(availablePool * 0.3));
      setPrize3(Math.round(availablePool * 0.2));
      setKillReward(0);
    }
  }, [profitMode, maxCapacity, entryFee, targetProfit]);

  // Target profit auto calculation handler
  const applyTargetProfitAllocation = () => {
    const availablePool = Math.max(0, totalCollection - Number(targetProfit || 0));
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
      liveStartTime: liveStartTime || time,
      registrationStartDate: status === 'Upcoming' ? registrationStartDate : date,
      registrationStartTime: status === 'Upcoming' ? registrationStartTime : time,
      description,
      rules,
      status,
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
  const winnerClaimCount = registrations.filter(r => r.qrCodeUrl && r.prizePaymentStatus === 'Pending').length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#090713] text-white selection:bg-purple-600 selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden sticky top-0 z-30 bg-[#080611] border-b border-[#1e1933] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 border border-amber-400/40 flex items-center justify-center shadow-lg shrink-0">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-heading font-black text-xs text-white uppercase tracking-wider leading-none">ADMIN CONTROL</h2>
            <span className="text-[9px] font-bold text-purple-400 block mt-0.5">DD GAMING MASTER</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-xl bg-[#141026] border border-purple-500/30 text-purple-300 focus:outline-none"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION (Desktop Sticky + Mobile Drawer) */}
      <aside className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-[#080611] border-r border-[#1e1933] flex flex-col justify-between p-5 overflow-y-auto shrink-0 transition-transform duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        <div className="space-y-6">
          {/* Top Shield Branding Header */}
          <div className="flex items-center justify-between border-b border-[#1e1933] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading font-black text-sm text-white uppercase tracking-wider leading-none">ADMIN CONTROL</h2>
                <span className="text-[10px] font-bold text-purple-400 tracking-wider block mt-1">DD GAMING MASTER</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-[#141026] border border-slate-700 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Left Navigation Links List */}
          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Dashboard', icon: Activity },
              { id: 'create', label: 'Create Tournament', icon: Plus, highlight: true },
              { id: 'tournaments', label: `Tournaments (${tournaments.length})`, icon: Layers },
              { id: 'participants', label: 'Participants & Joining', icon: Users, highlight: true },
              { id: 'payments', label: `Payment Verification (${pendingCount})`, icon: DollarSign, badge: pendingCount },
              { id: 'email', label: 'Brevo Email Sender', icon: Mail, highlight: true },
              { id: 'registrations', label: 'Customers & Roster', icon: Users },
              { id: 'live', label: `Live Stream Control (${liveCount})`, icon: Play },
              { id: 'results', label: `Top 10 Results (${pendingResultCount})`, icon: CheckSquare },
              { id: 'prizes', label: `Prize Cash Claims (${winnerClaimCount})`, icon: QrCode },
              { id: 'history', label: 'Audit Logs', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl font-heading text-xs transition-all flex items-center justify-between text-left ${
                    isActive
                      ? 'bg-[#1c1438] border border-purple-500/40 text-white font-black shadow-lg shadow-purple-950/50'
                      : tab.highlight
                      ? 'bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:bg-purple-900/50 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-[#16112a] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white shadow">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Admin User Profile Card & Logout */}
        <div className="pt-4 border-t border-[#1e1933] space-y-3">
          <div className="p-3 rounded-2xl bg-[#0f0c1b] border border-[#251d45] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow">
              DA
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-white text-xs truncate">DD Gaming Admin</h5>
              <span className="text-[10px] text-purple-300 block font-semibold">Role: Super Admin</span>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="w-full py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/60 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
          >
            <LogOut className="w-4 h-4" /> Logout Admin
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA (Matching DD Mystery Box Admin layout) */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 space-y-6 overflow-y-auto">
        
        {/* Main Content Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1e1933]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className="w-9 h-9 rounded-full bg-[#16112a] border border-[#251d45] flex items-center justify-center text-slate-300 hover:text-white hover:border-purple-500/40 transition-all shrink-0"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-heading font-black text-xl sm:text-2xl text-white tracking-wide uppercase">
                DD GAMING MASTER CONTROL
              </h1>
              <p className="text-xs text-slate-400">
                Real-Time Esports Tournament Management & Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setDeleteAllPassword('');
                setDeleteAllError('');
                setIsDeleteAllModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 border border-red-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-200" />
              <span>Delete All Data</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> + Create Tournament
            </button>
          </div>
        </div>

        {/* Status Filter Bar */}
        <div className="p-4 rounded-2xl bg-[#0f0c1b] border border-[#251d45] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" /> Filter View:
          </span>
          {[
            { id: 'all', label: 'ALL TOURNAMENTS' },
            { id: 'Upcoming', label: 'UPCOMING' },
            { id: 'Registration Open', label: 'REGISTRATION OPEN' },
            { id: 'Live', label: 'LIVE STREAMING' },
            { id: 'Result Pending', label: 'RESULT PENDING' },
            { id: 'Completed', label: 'COMPLETED' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                setTournamentFilter(f.id);
                setActiveTab('tournaments');
              }}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all shrink-0 border ${
                tournamentFilter === f.id
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-[#16112a] border-[#251d45] text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
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
              <p className="text-xs text-slate-400">Verified Razorpay player payments</p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Pending Action Items</span>
              <p className="font-heading font-black text-3xl text-amber-400">{pendingCount + winnerClaimCount}</p>
              <p className="text-xs text-slate-400">{pendingCount} Pending verifications • {winnerClaimCount} Winner QR payouts</p>
            </div>
          </div>
        </div>
      )}

      {/* PARTICIPANTS & JOINING STATUS TAB */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          {/* TOURNAMENT SELECTOR DROPDOWN & REFRESH BAR */}
          <div className="p-6 rounded-3xl bg-[#0f0c1b] border border-[#251d45] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Select Tournament Arena
              </label>
              <select
                value={selectedParticipantTrnId}
                onChange={(e) => setSelectedParticipantTrnId(e.target.value)}
                className="w-full md:w-80 px-4 py-2.5 rounded-xl bg-slate-900 border border-purple-500/40 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {tournaments.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.gameIcon || '🎮'} {t.title} ({t.entryType || 'Solo'} • {t.status || 'Active'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={async () => {
                  setIsLoadingParticipants(true);
                  const data = await fetchAdminParticipants(selectedParticipantTrnId, participantSearch, participantStatusFilter);
                  if (data) setParticipantsData(data);
                  setIsLoadingParticipants(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-900/40 border border-purple-500/40 hover:bg-purple-800/60 text-purple-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingParticipants ? 'animate-spin' : ''}`} />
                Refresh Live Data
              </button>
            </div>
          </div>

          {/* SUMMARY BANNER */}
          {participantsData && participantsData.tournament && (() => {
            const trn = participantsData.tournament;
            const stats = participantsData.stats || {};
            const format = trn.entryType || 'Solo';
            const isTeamFormat = format === 'Duo' || format === 'Team';
            
            // Calculate remaining window countdown
            const isWindowActive = trn.roomPublishedAt && trn.joiningWindowEnd && new Date(trn.joiningWindowEnd).getTime() > nowTick;
            const remainingMs = isWindowActive ? Math.max(0, new Date(trn.joiningWindowEnd).getTime() - nowTick) : 0;
            const remainingMins = Math.floor(remainingMs / 60000);
            const remainingSecs = Math.floor((remainingMs % 60000) / 1000);
            const timerStr = `${String(remainingMins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;

            return (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 glass-panel shadow-2xl space-y-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-purple-500/20">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                        {trn.gameIcon || '🎮'} {trn.game} • {format} ({trn.teamSize || 1} Player{trn.teamSize > 1 ? 's' : ''}/Team)
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                        Status: {trn.status}
                      </span>
                    </div>
                    <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
                      {trn.title}
                    </h2>
                    <p className="text-xs text-purple-300 font-mono">
                      Match Date: {trn.date} @ {trn.time}
                    </p>
                  </div>

                  {/* 30-MINUTE JOINING WINDOW COUNTDOWN & CONTROLS */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/40 space-y-3 w-full lg:w-auto shrink-0 min-w-[280px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" /> JOINING WINDOW
                      </span>
                      {isWindowActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase animate-pulse">
                          🟢 ACTIVE NOW
                        </span>
                      ) : trn.roomPublishedAt ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                          🔴 EXPIRED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          ⏳ NOT STARTED
                        </span>
                      )}
                    </div>

                    {isWindowActive ? (
                      <div className="text-center py-1 bg-slate-900 rounded-xl border border-emerald-500/30">
                        <span className="font-mono font-black text-3xl text-emerald-400 tracking-wider">
                          {timerStr}
                        </span>
                        <span className="block text-[10px] text-emerald-300/80 font-bold uppercase">Time Remaining to Join</span>
                      </div>
                    ) : trn.roomPublishedAt ? (
                      <div className="text-center py-1 bg-slate-900 rounded-xl border border-rose-500/30">
                        <span className="font-mono font-bold text-sm text-rose-400 block">30-Min Window Closed</span>
                        <span className="text-[10px] text-slate-400">Published at {new Date(trn.roomPublishedAt).toLocaleTimeString()}</span>
                      </div>
                    ) : (
                      <div className="text-center py-1 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-xs text-amber-300 font-bold block">Room ID Not Published Yet</span>
                        <span className="text-[10px] text-slate-400">Publishing Room ID will start 30-min timer</span>
                      </div>
                    )}

                    {/* RESTART 30-MIN JOINING WINDOW BUTTON */}
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to RESTART the 30-minute joining window for "${trn.title}"?`)) {
                          await adminRestartJoiningWindow(trn.id || trn._id);
                          const freshData = await fetchAdminParticipants(selectedParticipantTrnId, participantSearch, participantStatusFilter);
                          if (freshData) setParticipantsData(freshData);
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {trn.roomPublishedAt ? 'Restart 30-Min Joining Window' : 'Start 30-Min Joining Window'}
                    </button>
                  </div>
                </div>

                {/* ROOM ID & PASSWORD EDIT SECTION */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-purple-300 uppercase mb-1">Room ID</label>
                    <input
                      type="text"
                      value={roomIdInputs[trn.id || trn._id] !== undefined ? roomIdInputs[trn.id || trn._id] : (trn.roomId || '')}
                      onChange={(e) => setRoomIdInputs(prev => ({ ...prev, [trn.id || trn._id]: e.target.value }))}
                      placeholder="Enter Room ID"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-cyan-300 uppercase mb-1">Room Password</label>
                    <input
                      type="text"
                      value={trn.roomPassword || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        adminUpdateTournament(trn.id || trn._id, { roomPassword: val });
                      }}
                      placeholder="Enter Room Password (Optional)"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        const currentInput = roomIdInputs[trn.id || trn._id] !== undefined ? roomIdInputs[trn.id || trn._id] : (trn.roomId || '');
                        if (!currentInput || !currentInput.trim()) {
                          showToast('Please enter a Room ID.', 'error');
                          return;
                        }
                        // If Room ID is not published yet, open confirmation modal
                        if (!trn.roomPublishedAt) {
                          setConfirmRoomPublishModal({ trn, roomId: currentInput.trim() });
                        } else {
                          // Update Room ID directly (preserving existing window as per Rule 12)
                          adminUpdateRoomId(trn.id || trn._id, currentInput.trim());
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Save / Publish Room ID
                    </button>
                  </div>
                </div>

                {/* METRICS & SLOTS STATS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {isTeamFormat ? 'Total Team Capacity' : 'Total Player Slots'}
                    </span>
                    <p className="font-heading font-black text-2xl text-white">{stats.totalCapacity || trn.maxCapacity}</p>
                    <span className="text-[10px] text-slate-400">Max configured</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {isTeamFormat ? 'Confirmed Paid Teams' : 'Confirmed Registrations'}
                    </span>
                    <p className="font-heading font-black text-2xl text-cyan-400">{stats.registeredCount || 0}</p>
                    <span className="text-[10px] text-cyan-300/80">Razorpay verified</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      {isTeamFormat ? 'Fully Joined Teams 🟢' : 'Joined Players 🟢'}
                    </span>
                    <p className="font-heading font-black text-2xl text-emerald-400">{stats.joinedCount || 0}</p>
                    {isTeamFormat && (
                      <span className="text-[10px] text-amber-300 block">{stats.partiallyJoinedCount || 0} Partially Joined 🟡</span>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase">
                      Remaining Joining Slots
                    </span>
                    <p className="font-heading font-black text-2xl text-purple-300">
                      {stats.remainingSlots !== undefined ? stats.remainingSlots : Math.max(0, (trn.maxCapacity || 0) - (stats.joinedCount || 0))}
                    </p>
                    <span className="text-[10px] text-purple-400">Available capacity</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* FILTER BAR & SEARCH */}
          <div className="p-4 rounded-2xl bg-[#0f0c1b] border border-[#251d45] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Filter Status:</span>
              {[
                { id: 'all', label: 'ALL PARTICIPANTS' },
                { id: 'JOINED', label: '🟢 JOINED' },
                { id: 'PARTIALLY JOINED', label: '🟡 PARTIALLY JOINED' },
                { id: 'NOT JOINED', label: '⚪ NOT JOINED' },
                { id: 'MISSED', label: '🔴 MISSED' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setParticipantStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all shrink-0 border ${
                    participantStatusFilter === f.id
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                      : 'bg-[#16112a] border-[#251d45] text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                placeholder="Search player, team, email..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* PARTICIPANTS LIST VIEW (FORMAT ADAPTIVE & MOBILE-FIRST ACCORDION CARDS) */}
          {participantsData && participantsData.participants && (
            <div className="space-y-4">
              {participantsData.participants.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
                  No participants found matching current search/filter.
                </div>
              ) : (
                participantsData.participants.map((item, idx) => {
                  const isTeam = Boolean(item.teamName || item.members);

                  if (isTeam) {
                    // DUO / SQUAD TEAM CARD
                    const isExpanded = expandedTeamIds[item.registrationId || idx];
                    const members = item.members || [];
                    const joinedCount = members.filter(m => m.joined).length;

                    return (
                      <div key={item.registrationId || idx} className="rounded-2xl bg-slate-900 border border-purple-500/30 overflow-hidden shadow-lg">
                        {/* Team Header Bar */}
                        <div
                          onClick={() => setExpandedTeamIds(prev => ({ ...prev, [item.registrationId || idx]: !prev[item.registrationId || idx] }))}
                          className="p-4 bg-slate-950/80 hover:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer border-b border-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-sm">
                              🛡️
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-heading font-black text-white text-base">{item.teamName || 'Team'}</h4>
                                <span className="text-xs font-mono text-purple-400 font-bold">({joinedCount}/{members.length} Joined)</span>
                              </div>
                              <span className="text-xs text-slate-400">Leader: <strong className="text-white">{item.leaderName || item.playerName}</strong> ({item.leaderEmail || item.email})</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border ${
                              item.joiningStatus === 'JOINED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : item.joiningStatus === 'PARTIALLY JOINED'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : item.joiningStatus === 'MISSED'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {item.joiningStatus === 'JOINED' ? '🟢 FULLY JOINED' : item.joiningStatus === 'PARTIALLY JOINED' ? '🟡 PARTIALLY JOINED' : item.joiningStatus === 'MISSED' ? '🔴 MISSED' : '⚪ NOT JOINED'}
                            </span>
                            <button className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Team Members Breakdown */}
                        {isExpanded && (
                          <div className="p-4 space-y-3 bg-slate-900/50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Team Roster Breakdown ({members.length} Members)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {members.map((m, mIdx) => (
                                <div key={mIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-purple-300 uppercase text-[10px]">
                                      {mIdx === 0 ? '👑 Team Leader' : `Member ${mIdx + 1}`}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      m.joined ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                      {m.joined ? '🟢 JOINED' : '⚪ NOT JOINED'}
                                    </span>
                                  </div>
                                  <p className="font-bold text-white text-sm">{m.playerName || 'Player'}</p>
                                  <div className="text-slate-400 font-mono text-[11px] space-y-0.5">
                                    <div>Gaming ID: <strong className="text-cyan-300">{m.gamingId || 'N/A'}</strong></div>
                                    <div>Email: {m.email || 'N/A'}</div>
                                    {m.joinedAt && <div className="text-[10px] text-emerald-400">Joined at: {new Date(m.joinedAt).toLocaleTimeString()}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // SOLO PARTICIPANT CARD / ROW
                    return (
                      <div key={item.registrationId || idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-sm">
                            👤
                          </div>
                          <div>
                            <h4 className="font-heading font-black text-white text-base">{item.playerName}</h4>
                            <div className="text-xs text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-0.5">
                              <span>Gaming ID: <strong className="text-purple-300">{item.gamingId}</strong></span>
                              <span>Email: {item.email}</span>
                              <span>Phone: {item.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                            Razorpay Confirmed
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border ${
                            item.joiningStatus === 'JOINED' || item.joined
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : item.joiningStatus === 'MISSED'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {item.joiningStatus === 'JOINED' || item.joined ? '🟢 JOINED' : item.joiningStatus === 'MISSED' ? '🔴 MISSED' : '⚪ NOT JOINED'}
                          </span>
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>
          )}

          {/* ROOM ID PUBLISH CONFIRMATION MODAL */}
          {confirmRoomPublishModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/40 max-w-md w-full space-y-5 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-white">Publish Room ID & Start Timer</h3>
                    <span className="text-xs text-purple-300">{confirmRoomPublishModal.trn?.title}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p>
                    Publishing Room ID <strong className="text-emerald-400 font-mono font-black">{confirmRoomPublishModal.roomId}</strong> will automatically start the <strong>30-Minute Joining Window</strong> for registered players.
                  </p>
                  <p className="text-amber-300 font-semibold">
                    Are you ready to start the joining timer now?
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setConfirmRoomPublishModal(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const trnId = confirmRoomPublishModal.trn.id || confirmRoomPublishModal.trn._id;
                      await adminUpdateRoomId(trnId, confirmRoomPublishModal.roomId);
                      setConfirmRoomPublishModal(null);
                      const freshData = await fetchAdminParticipants(selectedParticipantTrnId, participantSearch, participantStatusFilter);
                      if (freshData) setParticipantsData(freshData);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-black text-xs uppercase shadow"
                  >
                    Publish & Start 30-Min Window
                  </button>
                </div>
              </div>
            </div>
          )}
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
                  onClick={() => setGame(g.name)}
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

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Maximum Capacity *</label>
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
              <label className="block text-xs font-bold text-slate-300 mb-1">Entry Fee (₹) *</label>
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

            <div>
              <label className="block text-xs font-bold text-cyan-300 mb-1">Live Starting Time (Match Live Time) *</label>
              <input
                type="text"
                required
                value={liveStartTime}
                onChange={(e) => setLiveStartTime(e.target.value)}
                placeholder="11:00 AM IST"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm border-cyan-500/40 text-cyan-200 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Initial Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-slate-900 font-bold text-purple-300"
              >
                <option value="Registration Open">Registration Open (Immediate Slot Booking)</option>
                <option value="Upcoming">Upcoming (Auto-Starts Registration on Date)</option>
              </select>
            </div>

            {status === 'Upcoming' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-purple-300 mb-1">Registration Start Date *</label>
                  <input
                    type="date"
                    required
                    value={registrationStartDate}
                    onChange={(e) => setRegistrationStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm border-purple-500/40 text-purple-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-300 mb-1">Registration Start Time *</label>
                  <input
                    type="text"
                    required
                    value={registrationStartTime}
                    onChange={(e) => setRegistrationStartTime(e.target.value)}
                    placeholder="06:00 PM IST"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm border-purple-500/40 text-purple-200 font-bold"
                  />
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-semibold space-y-1 shadow-md">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Automated Registration Opening Schedule</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    When the clock reaches <strong>{registrationStartDate || date} at {registrationStartTime || time}</strong>, registration will automatically unlock on the main website and slot booking will begin for all players!
                  </p>
                </div>
              </>
            )}
          </div>

          {/* AUTOMATIC COLLECTION DISPLAY */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Automatic Total Collection Calculation</span>
              <p className="text-xs text-slate-500">Formula: {maxCapacity} × ₹{entryFee} fee</p>
            </div>
            <span className="font-mono font-black text-2xl text-emerald-400">₹{totalCollection.toLocaleString()}</span>
          </div>

          {/* ADMIN PRIZE & PROFIT SYSTEM */}
          <div className="space-y-4 border-t border-slate-800 pt-6">
            <h4 className="font-heading font-bold text-lg text-white">Prize Distribution & Profit Configuration</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            </div>

            {/* PRIZE VALIDATION ALERT */}
            {isPrizeInvalid ? (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <strong className="block font-black text-sm uppercase">INVALID PRIZE DISTRIBUTION!</strong>
                  Total prize distribution (₹{totalPrizesCalculated.toLocaleString()}) exceeds total collection (₹{totalCollection.toLocaleString()}).
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((trn) => (
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
                  <option value="Upcoming">Upcoming</option>
                  <option value="Registration Open">Registration Open</option>
                  <option value="Registration Closed">Registration Closed</option>
                  <option value="Live">Live</option>
                  <option value="Result Pending">Result Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <h4 className="font-heading font-black text-xl text-white">{trn.title}</h4>
                <p className="text-xs text-slate-400">{trn.date} at {trn.time} • Mode: {trn.mode || 'Standard'}</p>
                {trn.status === 'Upcoming' && (
                  <p className="text-[11px] font-bold text-purple-300 bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/30 mt-1 inline-block">
                    🗓️ Reg Starts: {trn.registrationStartDate || trn.date} at {trn.registrationStartTime || trn.time}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-3 rounded-2xl text-center">
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
              </div>

              {/* ROOM ID CONTROL BOX */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1 uppercase text-[10px]">
                    <Key className="w-3.5 h-3.5 text-cyan-400" /> Game Match Room ID
                  </span>
                  {trn.roomId ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-500/30">
                      ROOM ID: {trn.roomId}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[9px] uppercase">
                      No Room ID
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={roomIdInputs[trn.id] !== undefined ? roomIdInputs[trn.id] : (trn.roomId || '')}
                    onChange={(e) => setRoomIdInputs({ ...roomIdInputs, [trn.id]: e.target.value })}
                    placeholder="Enter Room ID (e.g. 12345678)"
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = roomIdInputs[trn.id] !== undefined ? roomIdInputs[trn.id] : trn.roomId;
                      if (!val || !String(val).trim()) {
                        showToast('Room ID cannot be empty when saving!', 'error');
                        return;
                      }
                      adminUpdateRoomId(trn.id, String(val).trim());
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-[11px] font-bold shrink-0 shadow border border-purple-400/40 transition-all cursor-pointer"
                  >
                    {trn.roomId ? 'Update Room ID' : 'Save Room ID'}
                  </button>
                </div>
              </div>

              {/* LIVE STREAM LINK CONTROL BOX */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 flex items-center gap-1 uppercase text-[10px]">
                    <Play className="w-3 h-3 text-rose-400" /> YouTube Live Stream URL
                  </span>
                  {trn.isLiveStreaming && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px] uppercase border border-rose-500/30 animate-pulse">
                      🔴 Currently Live
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={liveUrlInputs[trn.id] !== undefined ? liveUrlInputs[trn.id] : (trn.liveStreamUrl || '')}
                    onChange={(e) => setLiveUrlInputs({ ...liveUrlInputs, [trn.id]: e.target.value })}
                    placeholder="Paste YouTube Live Link (e.g. https://youtu.be/...)"
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => adminUpdateLiveStream(trn.id, { liveStreamUrl: liveUrlInputs[trn.id] || trn.liveStreamUrl, action: 'UPDATE' })}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold shrink-0 border border-slate-700"
                  >
                    Save Link
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentRoomId = roomIdInputs[trn.id] !== undefined ? roomIdInputs[trn.id] : trn.roomId;
                      adminUpdateLiveStream(trn.id, {
                        liveStreamUrl: liveUrlInputs[trn.id] || trn.liveStreamUrl,
                        action: 'START_LIVE',
                        roomId: currentRoomId
                      });
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow"
                  >
                    🔴 Start Live
                  </button>
                  <button
                    type="button"
                    onClick={() => adminUpdateLiveStream(trn.id, { action: 'END_LIVE' })}
                    className="flex-1 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    🏁 End Live
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => setEditingTrn({
                    ...trn,
                    registrationStartDate: trn.registrationStartDate || trn.date,
                    registrationStartTime: trn.registrationStartTime || trn.time
                  })}
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
      )}

      {/* 4. PAYMENTS VERIFICATION TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
            <div>
              <h3 className="font-heading font-black text-2xl text-white">Payment & Ticket Verifications</h3>
              <p className="text-xs text-slate-400">Review uploaded payment proof screenshots, verify player entry fees, and confirm slots.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: `All (${(registrations || []).length})` },
                { id: 'pending', label: `Pending (${(registrations || []).filter(r => r.status === 'Pending Verification').length})` },
                { id: 'confirmed', label: `Confirmed (${(registrations || []).filter(r => r.status === 'Confirmed').length})` },
                { id: 'rejected', label: `Rejected (${(registrations || []).filter(r => r.status === 'Rejected').length})` }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setPaymentFilter(filter.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    paymentFilter === filter.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <DollarSign className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="font-heading font-bold text-white text-lg">No Payment Tickets Found</h4>
              <p className="text-xs text-slate-400">No registrations match the selected payment filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRegistrations.map((reg) => (
                <div key={reg.id || reg._id} className="p-6 rounded-3xl glass-panel border border-purple-500/30 space-y-5 relative shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">TICKET ID</span>
                      <span className="font-mono font-extrabold text-lg text-emerald-400">{reg.id}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      reg.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      reg.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {reg.status}
                    </span>
                  </div>

                  {/* Submission Date & Time */}
                  <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      Submitted: {reg.createdAt ? new Date(reg.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : (reg.registeredAt || 'Recent')}
                    </span>
                    <span className="font-mono font-extrabold text-emerald-400">
                      Fee: ₹{reg.entryFee || 0}
                    </span>
                  </div>

                  {/* Player Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Player Name</span>
                      <span className="font-bold text-white text-sm">{reg.playerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Gaming ID</span>
                      <span className="font-mono font-bold text-purple-300 text-sm">{reg.gamingId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone / WhatsApp</span>
                      <span className="font-mono text-slate-200">{reg.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Tournament</span>
                      <span className="font-bold text-cyan-300">{reg.tournamentTitle}</span>
                    </div>
                  </div>

                  {/* Team Info & Roster if Duo / Team */}
                  {(reg.teamName || (reg.teamMembers && reg.teamMembers.length > 0)) && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300 uppercase text-[10px]">Team Name: {reg.teamName || 'Squad Team'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{reg.entryType || 'Team'}</span>
                      </div>
                      {reg.teamMembers && reg.teamMembers.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-800">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Team Roster ({reg.teamMembers.length} Members):</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                            {reg.teamMembers.map((m, mIdx) => (
                              <div key={mIdx} className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-300">
                                <span className="font-bold text-white">{m.name || `Member ${mIdx+1}`}</span> ({m.gamingId || 'No ID'})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Details Box */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Cashfree Payment Information</span>
                    <div className="space-y-1 text-xs font-mono">
                      <p className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cashfree Verified Online Payment
                      </p>
                      {(reg.cashfreePaymentId || reg.razorpayPaymentId) && (
                        <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Payment Ref ID:</span> {reg.cashfreePaymentId || reg.razorpayPaymentId}</p>
                      )}
                      {(reg.cashfreeOrderId || reg.razorpayOrderId) && (
                        <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Cashfree Order ID:</span> {reg.cashfreeOrderId || reg.razorpayOrderId}</p>
                      )}
                      {reg.txnId && reg.txnId !== 'FREE_ENTRY' && (
                        <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Txn / Ref:</span> {reg.txnId}</p>
                      )}
                      {reg.paymentStatus && (
                        <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Gateway Status:</span> <span className="text-emerald-400 font-bold">{reg.paymentStatus}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Admin Action Buttons: Approve / Reject / Quick Email / Delete */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => adminApprovePayment(reg.id)}
                      disabled={reg.status === 'Confirmed'}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Confirm Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => adminRejectPayment(reg.id)}
                      disabled={reg.status === 'Rejected'}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 disabled:opacity-40 text-rose-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEmailModalForReg(reg)}
                      className="py-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20"
                      title="Send Custom Email via Brevo"
                    >
                      <Mail className="w-4 h-4" /> Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteReg(reg)}
                      className="py-2.5 px-3.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      title="Delete Registration Ticket"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* BREVO QUICK EMAIL SENDER TAB */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> BREVO EMAIL API CONNECTED
              </span>
            </div>
            <h3 className="font-heading font-black text-2xl text-white">Quick Brevo Email Sender</h3>
            <p className="text-xs text-slate-400">Send custom emails, match notifications, or ticket verification updates directly to player emails using Brevo.</p>
          </div>

          {/* Quick Email Form */}
          <form onSubmit={handleSendQuickEmail} className="p-8 rounded-3xl glass-panel border border-purple-500/30 space-y-6 max-w-4xl shadow-2xl">
            
            {/* Quick Templates Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Choose Quick Template</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    title: '🎟️ Slot Approved',
                    subject: '✅ PAYMENT COMPLETED! Slot Confirmed - DD Gaming',
                    msg: 'Your payment is completed and confirmed! Your tournament slot has been verified. Below are your full tournament details and match schedule.'
                  },
                  {
                    title: '❌ Payment Issue',
                    subject: '⚠️ Action Required: Payment Verification - DD Gaming',
                    msg: 'We were unable to verify your payment proof screenshot. Please contact support or re-upload your UTR receipt.'
                  },
                  {
                    title: '🎮 Match Alert',
                    subject: '🚨 Tournament Match Starting Soon! - DD Gaming',
                    msg: 'Your tournament match is about to begin! Please join your game lobby now and stay active in your room.'
                  },
                  {
                    title: '🏆 Prize Claim',
                    subject: '🏆 Claim Your Tournament Prize Winnings - DD Gaming',
                    msg: 'Congratulations on your tournament ranking! Please upload your UPI / Paytm QR Code in your profile to claim your prize money.'
                  }
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setEmailFormSubject(tpl.subject);
                      setEmailFormMessage(tpl.msg);
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left text-xs space-y-1 transition-all hover:bg-slate-900"
                  >
                    <span className="font-bold text-white block">{tpl.title}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{tpl.subject}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Selection Dropdown or Manual Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Registered Player / Ticket</label>
                <select
                  onChange={(e) => {
                    const regId = e.target.value;
                    const match = registrations.find(r => r.id === regId);
                    if (match) {
                      setEmailFormRecipientEmail(match.email || '');
                      setEmailFormRecipientName(match.playerName || '');
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
                >
                  <option value="">-- Choose from Registered Players --</option>
                  {registrations.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.playerName} ({r.email || 'No email'}) - Ticket #{r.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={emailFormRecipientName}
                  onChange={(e) => setEmailFormRecipientName(e.target.value)}
                  placeholder="Player Name"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Recipient Email Address *</label>
                <input
                  type="email"
                  required
                  value={emailFormRecipientEmail}
                  onChange={(e) => setEmailFormRecipientEmail(e.target.value)}
                  placeholder="player@example.com"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono font-bold text-purple-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Subject *</label>
                <input
                  type="text"
                  required
                  value={emailFormSubject}
                  onChange={(e) => setEmailFormSubject(e.target.value)}
                  placeholder="Subject line"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Message / Body *</label>
                <textarea
                  rows="5"
                  required
                  value={emailFormMessage}
                  onChange={(e) => setEmailFormMessage(e.target.value)}
                  placeholder="Type message content here..."
                  className="w-full p-4 rounded-xl glass-input text-xs leading-relaxed font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSendingEmail}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-heading font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {isSendingEmail ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Sending Email via Brevo...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> 🚀 Send Email via Brevo
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 5. ALL REGISTRATIONS TAB */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
            <div>
              <h3 className="font-heading font-black text-2xl text-white">Player Registrations List</h3>
              <p className="text-xs text-slate-400">View complete roster, registration timestamps, and player tickets across all tournaments.</p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={registrationSearch}
                onChange={(e) => setRegistrationSearch(e.target.value)}
                placeholder="Search player, team, ID..."
                className="w-full px-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-slate-800 overflow-x-auto shadow-2xl">
            {searchedRegistrations.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-8">No player registrations found matching your query.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Player / Team</th>
                    <th className="p-3">Gaming ID</th>
                    <th className="p-3">Tournament</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Proof</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {searchedRegistrations.map((reg) => (
                    <tr key={reg.id || reg._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-400">{reg.id}</td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{reg.playerName}</span>
                        {reg.teamName && <span className="text-[10px] text-purple-300 font-bold block">Team: {reg.teamName}</span>}
                        <span className="text-[10px] text-slate-400 block">{reg.phone || reg.email}</span>
                      </td>
                      <td className="p-3 font-mono text-purple-300 font-bold">{reg.gamingId}</td>
                      <td className="p-3 font-bold text-slate-200">{reg.tournamentTitle}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : (reg.registeredAt || 'N/A')}
                      </td>
                      <td className="p-3">
                        {reg.paymentScreenshot ? (
                          <button
                            type="button"
                            onClick={() => setSelectedProofScreenshot(reg)}
                            className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px] font-bold hover:bg-purple-900"
                          >
                            View Proof
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">No Proof</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          reg.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          reg.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => adminApprovePayment(reg.id)}
                            disabled={reg.status === 'Confirmed'}
                            className="p-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 disabled:opacity-40"
                            title="Approve Ticket"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => adminRejectPayment(reg.id)}
                            disabled={reg.status === 'Rejected'}
                            className="p-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/30 disabled:opacity-40"
                            title="Reject Ticket"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 6. RESULT MANAGEMENT TAB (Top 10 Rankings) */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
            <div>
              <h3 className="font-heading font-black text-2xl text-white">Top 10 Result Management</h3>
              <p className="text-xs text-slate-400">Select a completed tournament, assign Top 10 rankings from registered participants, and publish official standings.</p>
            </div>

            <div className="w-full sm:w-80">
              <select
                value={selectedResultTrnId}
                onChange={(e) => {
                  const trnId = e.target.value;
                  setSelectedResultTrnId(trnId);
                  const selectedTrn = tournaments.find(t => t.id === trnId || t._id === trnId);
                  if (selectedTrn && selectedTrn.rankings && selectedTrn.rankings.length > 0) {
                    setRankingsForm(selectedTrn.rankings);
                  } else {
                    setRankingsForm([
                      { rank: 1, playerName: '', gamingId: '', prizeAmount: selectedTrn?.prizes?.[0]?.amount || 1500 },
                      { rank: 2, playerName: '', gamingId: '', prizeAmount: selectedTrn?.prizes?.[1]?.amount || 1000 },
                      { rank: 3, playerName: '', gamingId: '', prizeAmount: selectedTrn?.prizes?.[2]?.amount || 500 },
                      { rank: 4, playerName: '', gamingId: '', prizeAmount: 0 },
                      { rank: 5, playerName: '', gamingId: '', prizeAmount: 0 },
                      { rank: 6, playerName: '', gamingId: '', prizeAmount: 0 },
                      { rank: 7, playerName: '', gamingId: '', prizeAmount: 0 },
                      { rank: 8, playerName: '', gamingId: '', prizeAmount: 0 },
                      { rank: 9, playerName: '', gamingId: '', prizeAmount: 0 },
                      { rank: 10, playerName: '', gamingId: '', prizeAmount: 0 }
                    ]);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-500/40 text-xs font-bold text-white shadow-inner"
              >
                <option value="">-- Select Completed Tournament --</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.status} - {t.resultState || 'NOT_READY'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedResultTrnId ? (
            <div className="p-6 rounded-3xl glass-panel border border-purple-500/30 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-heading font-black text-xl text-white">
                    {tournaments.find(t => t.id === selectedResultTrnId)?.title}
                  </h4>
                  <p className="text-xs text-purple-300">
                    Result State: <strong className="text-emerald-400">{tournaments.find(t => t.id === selectedResultTrnId)?.resultState || 'NOT_READY'}</strong>
                  </p>
                </div>
              </div>

              {/* Ranks 1 to 10 Grid Inputs */}
              <div className="space-y-3">
                {rankingsForm.map((item, index) => {
                  const trnRegs = registrations.filter(r => r.tournamentId === selectedResultTrnId);
                  return (
                    <div key={index} className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                      index < 3 ? 'bg-purple-950/40 border-purple-500/40' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-2 w-full sm:w-28 shrink-0">
                        <span className="font-heading font-extrabold text-sm text-white">
                          {index === 0 ? '🥇 Rank 1' : index === 1 ? '🥈 Rank 2' : index === 2 ? '🥉 Rank 3' : `Rank ${index + 1}`}
                        </span>
                      </div>

                      {/* Participant Dropdown / Name Input */}
                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={item.playerName}
                          onChange={(e) => {
                            const val = e.target.value;
                            const regMatch = trnRegs.find(r => r.playerName === val);
                            const newRanks = [...rankingsForm];
                            newRanks[index] = {
                              ...newRanks[index],
                              playerName: val,
                              gamingId: regMatch ? regMatch.gamingId : newRanks[index].gamingId
                            };
                            setRankingsForm(newRanks);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                        >
                          <option value="">-- Select Registered Player / Team --</option>
                          {trnRegs.map((r, rIdx) => (
                            <option key={rIdx} value={r.playerName}>
                              {r.playerName} ({r.gamingId}) {r.teamName ? `[${r.teamName}]` : ''}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={item.gamingId || ''}
                          onChange={(e) => {
                            const newRanks = [...rankingsForm];
                            newRanks[index].gamingId = e.target.value;
                            setRankingsForm(newRanks);
                          }}
                          placeholder="Gaming ID / Tag"
                          className="px-3 py-2 rounded-xl glass-input text-xs font-mono"
                        />
                      </div>

                      {/* Prize Amount (Top 3) */}
                      {index < 3 ? (
                        <div className="w-full sm:w-32 shrink-0">
                          <label className="text-[10px] text-amber-400 font-bold uppercase block">Prize (₹)</label>
                          <input
                            type="number"
                            value={item.prizeAmount || 0}
                            onChange={(e) => {
                              const newRanks = [...rankingsForm];
                              newRanks[index].prizeAmount = Number(e.target.value);
                              setRankingsForm(newRanks);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-bold text-amber-400 font-mono"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic shrink-0 hidden sm:inline">
                          Motivational Badge
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons: Save Draft & Publish */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => adminSaveResults(selectedResultTrnId, { rankings: rankingsForm, resultState: 'DRAFT' })}
                  className="w-full sm:w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider"
                >
                  💾 Save as Draft (Hidden from Users)
                </button>
                <button
                  type="button"
                  onClick={() => adminSaveResults(selectedResultTrnId, { rankings: rankingsForm, resultState: 'PUBLISHED' })}
                  className="w-full sm:w-1/2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  🚀 Publish Official Top 10 Results
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Award className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="font-heading font-bold text-white text-lg">Select a Tournament Above</h4>
              <p className="text-xs text-slate-400">Select any tournament to enter and manage Top 10 player rankings.</p>
            </div>
          )}
        </div>
      )}

      {/* PAYMENT PROOF FULL IMAGE INSPECTOR MODAL */}
      {selectedProofScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/40 max-w-2xl w-full my-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">PAYMENT PROOF SCREENSHOT</span>
                <h4 className="font-heading font-bold text-white text-lg">{selectedProofScreenshot.playerName} ({selectedProofScreenshot.id})</h4>
              </div>
              <button
                onClick={() => setSelectedProofScreenshot(null)}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800 max-h-[65vh] overflow-y-auto flex items-center justify-center">
              <img
                src={selectedProofScreenshot.paymentScreenshot}
                alt="Full Payment Proof"
                className="max-w-full h-auto rounded-xl object-contain shadow-2xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400">Tournament: </span>
                <strong className="text-white">{selectedProofScreenshot.tournamentTitle}</strong>
                <span className="text-emerald-400 font-mono font-bold ml-2">Fee: ₹{selectedProofScreenshot.entryFee}</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    adminApprovePayment(selectedProofScreenshot.id);
                    setSelectedProofScreenshot(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-1 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => {
                    adminRejectPayment(selectedProofScreenshot.id);
                    setSelectedProofScreenshot(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase flex items-center justify-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
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

              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">Live Starting Time (Match Live Time)</label>
                <input
                  type="text"
                  value={editingTrn.liveStartTime !== undefined ? editingTrn.liveStartTime : (editingTrn.time || '')}
                  onChange={(e) => setEditingTrn({ ...editingTrn, liveStartTime: e.target.value })}
                  placeholder="11:00 AM IST"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-cyan-200 font-bold border-cyan-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                <select
                  value={editingTrn.status || 'Registration Open'}
                  onChange={(e) => setEditingTrn({ ...editingTrn, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-slate-900 font-bold text-purple-300"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Registration Open">Registration Open</option>
                  <option value="Registration Closed">Registration Closed</option>
                  <option value="Live">Live</option>
                  <option value="Result Pending">Result Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {editingTrn.status === 'Upcoming' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-purple-300 mb-1">Registration Start Date</label>
                    <input
                      type="date"
                      value={editingTrn.registrationStartDate || editingTrn.date || ''}
                      onChange={(e) => setEditingTrn({ ...editingTrn, registrationStartDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm border-purple-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-300 mb-1">Registration Start Time</label>
                    <input
                      type="text"
                      value={editingTrn.registrationStartTime || editingTrn.time || ''}
                      onChange={(e) => setEditingTrn({ ...editingTrn, registrationStartTime: e.target.value })}
                      placeholder="06:00 PM IST"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm border-purple-500/40 text-purple-200 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-semibold space-y-1 shadow-md">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Automated Registration Opening Schedule</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      When the clock reaches <strong>{editingTrn.registrationStartDate || editingTrn.date} at {editingTrn.registrationStartTime || editingTrn.time}</strong>, registration will automatically unlock on the main website and slot booking will begin for all players!
                    </p>
                  </div>
                </>
              )}
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
                  const targetId = editingTrn.id || editingTrn._id;
                  await adminUpdateTournament(targetId, editingTrn);
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
                This tournament (<span className="text-white font-bold">{confirmDeleteTrn.title}</span>) will be permanently removed from the platform. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteTrn(null)}
                className="w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!confirmDeleteTrn || isDeleting) return;
                  const targetId = confirmDeleteTrn.id || confirmDeleteTrn._id;
                  if (!targetId) {
                    showToast('Tournament ID not found. Cannot delete.', 'error');
                    console.error('Delete failed: Missing tournament ID on selected object', confirmDeleteTrn);
                    return;
                  }

                  setIsDeleting(true);
                  try {
                    console.log('🗑️ [UI] Initiating deletion for tournament:', { id: targetId, title: confirmDeleteTrn.title, obj: confirmDeleteTrn });
                    const result = await adminDeleteTournament(targetId);
                    if (result && result.success) {
                      setConfirmDeleteTrn(null);
                    } else {
                      console.error('❌ [UI] Delete tournament operation failed:', result?.message);
                    }
                  } catch (err) {
                    console.error('❌ [UI] Unhandled error during tournament deletion:', err);
                    showToast(err.message || 'Server connection failed', 'error');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 disabled:opacity-50 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'DELETE TOURNAMENT'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {quickEmailModalReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/40 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">Send Quick Email</h3>
                  <p className="text-[11px] text-purple-300">Ticket ID: {quickEmailModalReg.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickEmailModalReg(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendQuickEmail} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">To Email</label>
                <input
                  type="email"
                  required
                  value={emailFormRecipientEmail}
                  onChange={(e) => setEmailFormRecipientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-bold text-purple-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={emailFormSubject}
                  onChange={(e) => setEmailFormSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-bold text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Message</label>
                <textarea
                  rows="5"
                  required
                  value={emailFormMessage}
                  onChange={(e) => setEmailFormMessage(e.target.value)}
                  className="w-full p-3.5 rounded-xl glass-input text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickEmailModalReg(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1.5"
                >
                  {isSendingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSendingEmail ? 'Sending...' : 'Send via Brevo'}
                </button>
              </div>
            </form>
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

      {/* Registration Ticket Deletion Confirmation Modal */}
      {confirmDeleteReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/40 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-white">Delete Ticket {confirmDeleteReg.id}?</h3>
                <p className="text-xs text-rose-300">Player: {confirmDeleteReg.playerName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete registration ticket <strong className="text-white">{confirmDeleteReg.id}</strong> for <strong className="text-white">{confirmDeleteReg.playerName}</strong> ({confirmDeleteReg.gamingId || 'No ID'})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteReg(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = confirmDeleteReg.id || confirmDeleteReg._id;
                  setConfirmDeleteReg(null);
                  await adminDeleteRegistration(targetId);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-heading font-black uppercase tracking-wider shadow-lg shadow-rose-950/50 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
