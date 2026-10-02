import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, User, Phone, Mail, ShieldCheck, ArrowRight, ArrowLeft, Clock, Loader2, AlertCircle, RefreshCw, CreditCard, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export default function RegisterModal() {
  const {
    selectedTournamentRegister,
    closeRegistrationModal,
    submitRegistration,
    createCashfreeOrder,
    verifyCashfreePayment,
    createRazorpayOrder,
    verifyRazorpayPayment,
    userProfile,
    navigateTo
  } = useApp();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    rulesAccepted: false
  });

  const [submittedRegResult, setSubmittedRegResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedTournamentRegister) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedTournamentRegister]);

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
    return 'In-Game ID / Gaming Username (BGMI / Free Fire / Ludo / Pool / Chess)';
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
      handleFreeRegistration();
    } else {
      setStep(3);
    }
  };

  // FREE REGISTRATION (No payment required)
  const handleFreeRegistration = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const regResult = await submitRegistration({
        tournament: trn,
        fullName: formData.fullName,
        gamingId: formData.gamingId,
        phone: formData.phone,
        email: formData.email,
        txnId: 'FREE_ENTRY',
        entryType: trn.entryType || (isTeamGame ? 'Team' : 'Solo'),
        teamName: isTeamGame ? formData.teamName : undefined,
        teamMembers: isTeamGame ? formData.teamMembers.slice(0, teamMemberCount - 1) : []
      });

      setSubmittedRegResult(regResult || {
        id: `REG-DD-${Math.floor(1000 + Math.random() * 9000)}`,
        playerName: formData.fullName,
        gamingId: formData.gamingId,
        tournamentTitle: trn.title,
        status: 'Confirmed',
        paymentStatus: 'PAID'
      });
      setStep(4);
      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
    } catch (err) {
      setErrorMsg('An error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CASHFREE PAYMENT CHECKOUT LAUNCHER
  const handlePayWithCashfree = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Request server to create Cashfree Order
      const orderPayload = {
        tournament: trn,
        fullName: formData.fullName,
        gamingId: formData.gamingId,
        phone: formData.phone,
        email: formData.email,
        teamName: isTeamGame ? formData.teamName : '',
        teamMembers: isTeamGame ? formData.teamMembers.slice(0, teamMemberCount - 1) : [],
        entryType: trn.entryType || (isTeamGame ? 'Team' : 'Solo')
      };

      const orderRes = await (createCashfreeOrder || createRazorpayOrder)(orderPayload);

      if (!orderRes || !orderRes.success || !orderRes.paymentSessionId) {
        setErrorMsg(orderRes?.message || 'Failed to create Cashfree payment order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const paymentSessionId = orderRes.paymentSessionId;
      const orderId = orderRes.orderId;
      const registrationId = orderRes.registrationId;

      const verifyOrderOnServer = async () => {
        setIsSubmitting(true);
        setErrorMsg('');
        try {
          const verifyRes = await (verifyCashfreePayment || verifyRazorpayPayment)({
            orderId: orderId,
            registrationId: registrationId
          });

          if (verifyRes && verifyRes.success) {
            const finalReg = verifyRes.registration || {
              id: registrationId,
              playerName: formData.fullName,
              gamingId: formData.gamingId,
              tournamentTitle: trn.title,
              entryFee: trn.entryFee,
              status: 'Confirmed',
              paymentStatus: 'PAID',
              cashfreeOrderId: orderId
            };
            setSubmittedRegResult(finalReg);
            setStep(4);
            try {
              confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}
          } else {
            setErrorMsg(verifyRes?.message || 'Payment verification failed. Please contact support if money was deducted.');
          }
        } catch (err) {
          setErrorMsg('Payment verification failed. Please contact support if money was deducted.');
        } finally {
          setIsSubmitting(false);
        }
      };

      // 2. Initialize Cashfree Checkout JS
      if (window.Cashfree) {
        const cashfreeMode = (orderRes.cfEnvironment || 'PRODUCTION').toUpperCase() === 'SANDBOX' ? 'sandbox' : 'production';
        const cashfree = window.Cashfree({ mode: cashfreeMode });

        const checkoutOptions = {
          paymentSessionId: paymentSessionId,
          redirectTarget: '_modal'
        };

        cashfree.checkout(checkoutOptions).then((result) => {
          if (result.error) {
            console.warn('Cashfree Checkout Notice:', result.error);
            const msg = result.error.message || '';
            if (msg.includes('whitelist') || msg.includes('not enabled') || msg.includes('Broken Link')) {
              setErrorMsg('Domain Whitelisting Required: Please whitelist "https://dd-gaming-tourament.vercel.app" in your Cashfree Dashboard under Developers > Whitelisting.');
            } else {
              setErrorMsg(msg || 'Payment was cancelled or incomplete. Please try again.');
            }
            setIsSubmitting(false);
          } else if (result.redirect) {
            console.log('Cashfree Redirecting...');
          } else {
            verifyOrderOnServer();
          }
        }).catch((err) => {
          console.warn('Cashfree checkout modal notice:', err);
          verifyOrderOnServer();
        });
      } else {
        verifyOrderOnServer();
      }
    } catch (err) {
      console.error('Cashfree process error:', err);
      setErrorMsg('An unexpected error occurred while launching payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeRegistrationModal}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[150]"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-xl bg-slate-900 border-t-2 sm:border border-purple-500/40 rounded-t-3xl sm:rounded-2xl shadow-2xl z-[160] max-h-[100dvh] sm:max-h-[90vh] flex flex-col overflow-hidden my-0 sm:my-8"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xl shrink-0">{trn.gameIcon}</span>
                <span className="text-[11px] sm:text-xs font-extrabold uppercase text-purple-400 tracking-wider truncate">
                  Registration Portal
                </span>
              </div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white mt-0.5 truncate">
                {trn.title}
              </h3>
            </div>
            <button
              onClick={closeRegistrationModal}
              className="min-w-[44px] min-h-[44px] p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center touch-manipulation cursor-pointer active:scale-95 shrink-0 ml-2"
              title="Close Registration Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Header Bar */}
          <div className="px-3 sm:px-6 py-2.5 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between text-[11px] sm:text-xs font-bold shrink-0">
            <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 1 ? 'text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-slate-800'}`}>1</span>
              <span>Player Info</span>
            </div>
            <div className="w-4 sm:w-8 h-px bg-slate-800 shrink-0" />
            <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 2 ? 'text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-slate-800'}`}>2</span>
              <span>Confirm</span>
            </div>
            <div className="w-4 sm:w-8 h-px bg-slate-800 shrink-0" />
            <div className={`flex items-center gap-1 sm:gap-1.5 ${step >= 3 ? 'text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-slate-800'}`}>3</span>
              <span>Cashfree Payment</span>
            </div>
          </div>

          {/* Modal Body Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-[calc(5rem+env(safe-area-inset-bottom,20px))] sm:pb-6">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-medium space-y-2 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Cashfree Gateway Notice</span>
                </div>
                <p className="leading-relaxed">{errorMsg}</p>
                {(errorMsg.includes('whitelist') || errorMsg.includes('Whitelisting') || errorMsg.includes('Broken Link')) && (
                  <div className="pt-2 border-t border-rose-500/30 text-[11px] text-amber-200 space-y-1">
                    <p className="font-bold text-amber-300">💡 How to fix in 30 seconds on Cashfree Dashboard:</p>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-300">
                      <li>Log in to <a href="https://merchant.cashfree.com" target="_blank" rel="noreferrer" className="underline text-amber-400 font-bold">merchant.cashfree.com</a></li>
                      <li>Go to <strong>Developers &rarr; Whitelisting</strong></li>
                      <li>Add domain: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">https://dd-gaming-tourament.vercel.app</code></li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {trn.status === 'Upcoming' && (
              <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-semibold space-y-1 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Registration Opens Soon!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Registration for this tournament will automatically open on <strong>{trn.registrationStartDate || trn.date} at {trn.registrationStartTime || trn.time}</strong>.
                </p>
              </div>
            )}
            
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

                {isTeamGame && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <h5 className="font-heading font-bold text-xs text-purple-300 uppercase tracking-wider">
                      {teamMemberCount === 2 ? 'Duo Teammate Details' : `Squad Members Roster (${teamMemberCount - 1} Members)`}
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
                      Phone Number (WhatsApp) *
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
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
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
                  {trn.status === 'Upcoming' ? `Starts ${trn.registrationStartDate || trn.date}` : 'Continue to Confirmation'}
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Player Name:</span>
                    <span className="font-semibold text-white">{formData.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Gaming ID:</span>
                    <span className="font-mono font-bold text-purple-300">{formData.gamingId}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                  <strong>Rules Summary:</strong> Standard esports contest rules apply. Fair play is mandatory. Room ID will be published inside your account profile 15–30 minutes before match start.
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
                    {trn.entryFee === 0 ? 'Confirm Free Registration' : 'Proceed to Cashfree Payment'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Cashfree Payment Checkout */}
            {step === 3 && (
              <div className="space-y-5">
                <h4 className="font-heading font-bold text-base text-white flex items-center justify-between">
                  <span>Step 3: Cashfree Payment Gateway</span>
                  <span className="text-emerald-400 font-black font-mono text-xl">₹{trn.entryFee}</span>
                </h4>

                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Tournament</span>
                      <span className="font-bold text-white">{trn.title}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Player Name</span>
                      <span className="font-bold text-white">{formData.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Gaming ID</span>
                      <span className="font-mono font-bold text-purple-300">{formData.gamingId}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-sm">
                      <span className="font-bold text-white">Total Amount</span>
                      <span className="font-mono font-black text-emerald-400 text-lg">₹{trn.entryFee} INR</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Secure Payment Powered by Cashfree Payments</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePayWithCashfree}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span>Launching Cashfree...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 text-emerald-400" />
                        <span>Pay Now via Cashfree (₹{trn.entryFee})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Registration & Payment Success Screen */}
            {step === 4 && submittedRegResult && (
              <div className="text-center py-4 space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 animate-bounce shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
                    PAYMENT SUCCESSFUL! 🎉
                  </h3>
                  <p className="font-bold text-xs sm:text-sm text-emerald-400 uppercase tracking-widest mt-1">
                    TOURNAMENT REGISTRATION CONFIRMED
                  </p>
                  <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                    Your tournament pass has been generated and your slot is locked in!
                  </p>
                </div>

                {/* Ticket Details Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 text-left space-y-3 relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 px-3 py-1 border-b border-l text-[10px] font-black uppercase rounded-bl-xl bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                    PAID & CONFIRMED ✅
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registration ID</p>
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
                      <p className="font-bold text-white truncate">{submittedRegResult.tournamentTitle}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Entry Fee:</p>
                      <p className="font-mono font-bold text-emerald-400">₹{submittedRegResult.entryFee || trn.entryFee || 0}</p>
                    </div>
                    {(submittedRegResult.cashfreePaymentId || submittedRegResult.cashfreeOrderId || submittedRegResult.razorpayPaymentId) && (
                      <div className="col-span-2 pt-1 border-t border-slate-900">
                        <p className="text-slate-400">Cashfree Order / Payment ID:</p>
                        <p className="font-mono font-bold text-amber-300 text-[11px] truncate">{submittedRegResult.cashfreePaymentId || submittedRegResult.cashfreeOrderId || submittedRegResult.razorpayPaymentId}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      closeRegistrationModal();
                      navigateTo('profile');
                    }}
                    className="w-full sm:w-1/2 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
                  >
                    View My Ticket
                  </button>
                  <button
                    onClick={() => {
                      closeRegistrationModal();
                      navigateTo('my-tournaments');
                    }}
                    className="w-full sm:w-1/2 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    My Tournaments
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
