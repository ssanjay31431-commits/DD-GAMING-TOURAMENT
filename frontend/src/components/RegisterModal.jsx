import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, User, Phone, Mail, QrCode, ShieldCheck, ArrowRight, ArrowLeft, Copy, Sparkles, AlertCircle, Upload, Image as ImageIcon, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export default function RegisterModal() {
  const { selectedTournamentRegister, closeRegistrationModal, submitRegistration, userProfile, navigateTo } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: userProfile?.name || '',
    gamingId: userProfile?.gamingUsername || '',
    phone: userProfile?.phone || '',
    email: userProfile?.email || '',
    teamName: '',
    teamMembers: [
      { name: '', gamingId: '' },
      { name: '', gamingId: '' },
      { name: '', gamingId: '' }
    ],
    rulesAccepted: false,
    txnId: '',
    paymentScreenshot: ''
  });

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittedRegResult, setSubmittedRegResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || userProfile.name || '',
        gamingId: prev.gamingId || userProfile.gamingUsername || '',
        phone: prev.phone || userProfile.phone || '',
        email: prev.email || userProfile.email || ''
      }));
    }
  }, [userProfile]);

  if (!selectedTournamentRegister) return null;

  const trn = selectedTournamentRegister;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('Screenshot file size should be less than 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, paymentScreenshot: reader.result }));
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    if (trn.entryFee > 0 && !formData.paymentScreenshot) {
      setErrorMsg('Please upload your payment screenshot from GPay / PhonePe / Paytm to complete registration.');
      return;
    }
    setErrorMsg('');

    const regResult = await submitRegistration({
      tournament: trn,
      fullName: formData.fullName,
      gamingId: formData.gamingId,
      phone: formData.phone,
      email: formData.email,
      txnId: `PAY-${Date.now()}`,
      paymentScreenshot: formData.paymentScreenshot,
      entryType: trn.entryType || (isTeamGame ? 'Team' : 'Solo'),
      teamName: isTeamGame ? formData.teamName : undefined,
      teamMembers: isTeamGame ? formData.teamMembers.slice(0, teamMemberCount - 1) : []
    });

    setSubmittedRegResult(regResult || {
      id: `REG-DD-${Math.floor(1000 + Math.random() * 9000)}`,
      playerName: formData.fullName,
      gamingId: formData.gamingId,
      tournamentTitle: trn.title,
      status: trn.entryFee === 0 ? 'Confirmed' : 'Pending Verification'
    });
    setStep(4);

    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.log('Confetti error:', err);
    }
  };

  const copyUpiToClipboard = () => {
    navigator.clipboard.writeText('david468468@airtel');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const entryTypeLower = (trn.entryType || '').toLowerCase();
  const modeLower = (trn.mode || '').toLowerCase();

  let teamMemberCount = 1;
  if (entryTypeLower === 'duo' || modeLower.includes('duo') || trn.teamSize === 2) {
    teamMemberCount = 2;
  } else if (entryTypeLower === 'team' || entryTypeLower === 'squad' || modeLower.includes('squad') || (trn.teamSize && trn.teamSize > 2)) {
    teamMemberCount = trn.teamSize && trn.teamSize > 1 ? trn.teamSize : 4;
  } else if (entryTypeLower === 'solo' || modeLower.includes('solo') || trn.teamSize === 1) {
    teamMemberCount = 1;
  } else if (trn.teamSize && trn.teamSize > 1) {
    teamMemberCount = trn.teamSize;
  }

  const isTeamGame = teamMemberCount > 1;

  const getGameIdLabel = (trn) => {
    const game = trn.game || '';
    if (game === 'BGMI') return 'BGMI Character ID / In-Game Name';
    if (game === 'Free Fire') return 'Free Fire UID / In-Game Name';
    if (game === 'Chess') return 'Chess.com / Lichess Username';
    if (game === 'Ludo King') return 'Ludo King User ID';
    if (game === 'Carrom Pool') return 'Carrom Pool User ID';
    return '8 Ball Pool Unique ID / Gaming Username';
  };

  const getGameIdPlaceholder = (trn) => {
    const game = trn.game || '';
    if (game === 'BGMI') return 'e.g. 518920491 or TeamLeader_BGMI';
    if (game === 'Free Fire') return 'e.g. 891029381 or FF_Hunter';
    if (game === 'Chess') return 'e.g. Grandmaster_Ramesh';
    if (game === 'Ludo King') return 'e.g. Ludo_King_1029';
    if (game === 'Carrom Pool') return 'e.g. CarromPro_99';
    return 'e.g. 8BallKing_Rahul or Miniclip ID: 39482109';
  };

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.gamingId.trim() || !formData.phone.trim()) {
      setErrorMsg('Please fill in all required player details.');
      return;
    }
    if (isTeamGame && !formData.teamName.trim()) {
      setErrorMsg('Please enter your Team Name.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!formData.rulesAccepted) {
      setErrorMsg('You must accept the tournament rules to proceed.');
      return;
    }
    setErrorMsg('');
    if (trn.entryFee === 0) {
      handleFinalSubmit();
    } else {
      setStep(3);
    }
  };


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeRegistrationModal}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-xl bg-slate-900 border-t-2 sm:border border-purple-500/40 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] sm:max-h-none flex flex-col my-0 sm:my-8 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-0"
        >
          {/* Header */}
          <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{trn.gameIcon}</span>
                <span className="text-xs font-extrabold uppercase text-purple-400 tracking-wider">
                  Registration Portal
                </span>
              </div>
              <h3 className="font-heading font-black text-xl text-white mt-0.5">
                {trn.title}
              </h3>
            </div>
            <button
              onClick={closeRegistrationModal}
              className="p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Header Bar */}
          <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between text-xs font-bold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-slate-800'}`}>1</span>
              <span>Player Info</span>
            </div>
            <div className="w-8 h-px bg-slate-800" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-slate-800'}`}>2</span>
              <span>Confirm</span>
            </div>
            <div className="w-8 h-px bg-slate-800" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-slate-800'}`}>3</span>
              <span>Payment</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {trn.status === 'Upcoming' && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-semibold space-y-1 shadow-lg">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Registration Opens Soon!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Registration for this tournament will automatically open on <strong>{trn.registrationStartDate || trn.date} at {trn.registrationStartTime || trn.time}</strong>. Slot booking will start automatically at that time!
              </p>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6">
            
            {/* STEP 1: Player / Team Details */}
            {step === 1 && (
              <form onSubmit={handleNextStep1} className="space-y-4">
                <h4 className="font-heading font-bold text-base text-white">
                  Step 1: Enter {isTeamGame ? 'Team & Member' : 'Player'} Details
                </h4>

                {isTeamGame && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-300 mb-1">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.teamName}
                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                        placeholder="e.g. TEAM ALPHA ESPORTS"
                        className="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-bold text-white"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isTeamGame ? 'Captain / Leader Full Name *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {getGameIdLabel(trn)} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm">{trn.gameIcon || '🎮'}</span>
                    <input
                      type="text"
                      required
                      value={formData.gamingId}
                      onChange={(e) => setFormData({ ...formData, gamingId: e.target.value })}
                      placeholder={getGameIdPlaceholder(trn)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                {/* DYNAMIC TEAM MEMBERS INPUTS FOR SQUAD / DUO (4 MEMBERS TOTAL) */}
                {isTeamGame && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <h5 className="font-heading font-bold text-xs text-purple-300 uppercase tracking-wider">
                      {teamMemberCount === 2 ? 'Duo Teammate Details (1 Remaining Member)' : `Squad Members Roster (${teamMemberCount - 1} Remaining Members)`}
                    </h5>

                    {Array.from({ length: teamMemberCount - 1 }).map((_, idx) => {
                      const memberNum = idx + 2;
                      const memberData = formData.teamMembers[idx] || { name: '', gamingId: '' };
                      return (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <span className="text-[11px] font-bold text-slate-400 block">
                            Member #{memberNum} Details *
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              value={memberData.name}
                              onChange={(e) => {
                                const newMembers = [...formData.teamMembers];
                                newMembers[idx] = { ...newMembers[idx], name: e.target.value };
                                setFormData({ ...formData, teamMembers: newMembers });
                              }}
                              placeholder={`Member #${memberNum} Full Name`}
                              className="px-3 py-2 rounded-lg glass-input text-xs"
                            />
                            <input
                              type="text"
                              required
                              value={memberData.gamingId}
                              onChange={(e) => {
                                const newMembers = [...formData.teamMembers];
                                newMembers[idx] = { ...newMembers[idx], gamingId: e.target.value };
                                setFormData({ ...formData, teamMembers: newMembers });
                              }}
                              placeholder={`Member #${memberNum} In-Game ID`}
                              className="px-3 py-2 rounded-lg glass-input text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      WhatsApp Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={trn.status === 'Upcoming'}
                  className={`w-full mt-4 py-3 rounded-xl font-heading font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${
                    trn.status === 'Upcoming'
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25'
                  }`}
                >
                  {trn.status === 'Upcoming' ? `Registration Starts ${trn.registrationStartDate || trn.date} @ ${trn.registrationStartTime || trn.time}` : 'Continue to Confirmation'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Tournament Confirmation & Rules */}
            {step === 2 && (
              <form onSubmit={handleNextStep2} className="space-y-5">
                <h4 className="font-heading font-bold text-base text-white">
                  Step 2: Confirm Tournament Details
                </h4>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Tournament:</span>
                    <span className="font-bold text-white">{trn.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Date & Time:</span>
                    <span className="font-semibold text-purple-300">{trn.date} at {trn.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Entry Fee:</span>
                    <span className="font-black text-emerald-400 text-base">
                      {trn.entryFee === 0 ? 'FREE ENTRY' : `₹${trn.entryFee}`}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                  <strong>Rules Summary:</strong> Matches are 1v1 in 8 Ball Pool. Both players must record victory screenshots. Fair play is mandatory. Disconnection without proof results in forfeiture.
                </div>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rulesAccepted}
                    onChange={(e) => setFormData({ ...formData, rulesAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    I accept the DD Gaming Tournament Rules & agree to fair play conduct.
                  </span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
                  >
                    {trn.entryFee === 0 ? 'Confirm Free Registration' : 'Proceed to Payment'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Payment Verification */}
            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-5">
                <h4 className="font-heading font-bold text-base text-white flex items-center justify-between">
                  <span>Step 3: Payment & Screenshot Verification</span>
                  <span className="text-emerald-400 font-black font-mono text-xl">₹{trn.entryFee}</span>
                </h4>

                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-4 text-center">
                  
                  {/* Supported UPI Apps Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase border border-rose-500/30">
                      Airtel
                    </span>
                    <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase border border-purple-500/30">
                      PhonePe
                    </span>
                    <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] uppercase border border-blue-500/30">
                      GPay
                    </span>
                    <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] uppercase border border-cyan-500/30">
                      Paytm
                    </span>
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-500/30">
                      BHIM UPI
                    </span>
                  </div>

                  {/* Payee Info & Dynamic Entry Fee */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Payee Account</p>
                    <h5 className="font-heading font-black text-xl text-white">Sagariya David S</h5>
                    
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <span className="font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg text-sm border border-emerald-500/30">
                        david468468@airtel
                      </span>
                      <button
                        type="button"
                        onClick={copyUpiToClipboard}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Copy UPI ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copiedUpi && <p className="text-[11px] text-emerald-400 font-bold">Copied UPI ID to clipboard!</p>}

                    {/* DYNAMIC AMOUNT BOX */}
                    <div className="mt-3 p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-between">
                      <span className="text-xs text-purple-200 font-bold uppercase">Dynamic Entry Fee:</span>
                      <span className="font-mono font-black text-2xl text-emerald-400">₹{trn.entryFee}</span>
                    </div>
                  </div>

                  {/* OFFICIAL UPI QR CODE IMAGE */}
                  <div className="p-3 rounded-2xl bg-white max-w-[260px] mx-auto shadow-2xl border-2 border-purple-500/40">
                    <img
                      src="/upi-qr-code.jpg"
                      alt="Official UPI QR Code - Sagariya David S"
                      className="w-full h-auto rounded-xl object-contain"
                    />
                    <p className="text-[11px] font-black text-slate-900 mt-2 uppercase tracking-wider">
                      Scan with GPay / PhonePe / Paytm
                    </p>
                  </div>
                </div>

                {/* UPLOAD PAYMENT SCREENSHOT INPUT (REPLACED UTR) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Upload Payment Screenshot * (GPay, PhonePe, Paytm, etc.)
                  </label>

                  {formData.paymentScreenshot ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={formData.paymentScreenshot}
                          alt="Payment Screenshot Preview"
                          className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                        />
                        <div className="truncate text-xs">
                          <p className="font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Screenshot Selected
                          </p>
                          <p className="text-slate-400 truncate">Ready for instant admin verification</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentScreenshot: '' })}
                        className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 text-xs font-bold shrink-0 border border-rose-500/30"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleImageUpload}
                        className="hidden"
                        id="payment-screenshot-input"
                      />
                      <label
                        htmlFor="payment-screenshot-input"
                        className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-purple-500/40 bg-slate-950 hover:bg-purple-950/20 cursor-pointer transition-all text-center group"
                      >
                        <Upload className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Click to Upload Payment Screenshot
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          Upload GPay, PhonePe, Paytm, or BHIM payment receipt
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Submit & Register
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Registration Success / Verification Pending Screen */}
            {step === 4 && submittedRegResult && (
              <div className="text-center py-4 space-y-6">
                
                {submittedRegResult.status === 'Pending Verification' ? (
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 animate-pulse">
                    <Clock className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                )}

                <div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
                    {submittedRegResult.status === 'Pending Verification' ? 'VERIFICATION IN PROGRESS! ⏳' : 'SLOT CONFIRMED! 🎉'}
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-300 mt-1 max-w-md mx-auto leading-relaxed">
                    {submittedRegResult.status === 'Pending Verification'
                      ? 'Your payment screenshot has been uploaded. Please wait for admin verification. Once verified by our team, your slot confirmation will be completed.'
                      : 'Your registration ticket has been generated and slot confirmed!'}
                  </p>
                </div>

                {/* Pending Verification Callout Banner */}
                {submittedRegResult.status === 'Pending Verification' && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-left space-y-1 text-xs text-amber-200">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Pending Admin Verification</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Our admin team is currently reviewing your uploaded payment screenshot. You can track your ticket verification status anytime under <strong>"My Tickets"</strong> in your profile.
                    </p>
                  </div>
                )}

                {/* Ticket Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 text-left space-y-3 relative overflow-hidden shadow-inner">
                  <div className={`absolute top-0 right-0 px-3 py-1 border-b border-l text-[10px] font-bold uppercase rounded-bl-xl ${
                    submittedRegResult.status === 'Pending Verification'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {submittedRegResult.status}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Registration Ticket ID</p>
                    <p className="font-mono font-extrabold text-lg text-emerald-400">{submittedRegResult.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <p className="text-slate-400">Player Name:</p>
                      <p className="font-bold text-white">{submittedRegResult.playerName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Gaming ID:</p>
                      <p className="font-bold text-purple-300 font-mono">{submittedRegResult.gamingId}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Tournament:</p>
                      <p className="font-bold text-white">{submittedRegResult.tournamentTitle}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Payment Status:</p>
                      <p className={`font-bold ${
                        submittedRegResult.status === 'Pending Verification' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {submittedRegResult.status} ⏳
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      closeRegistrationModal();
                      navigateTo('profile');
                    }}
                    className="w-full sm:w-1/2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-lg"
                  >
                    View My Tickets
                  </button>
                  <button
                    onClick={() => {
                      closeRegistrationModal();
                      navigateTo('home');
                    }}
                    className="w-full sm:w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider"
                  >
                    Back to Home
                  </button>
                </div>

              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
