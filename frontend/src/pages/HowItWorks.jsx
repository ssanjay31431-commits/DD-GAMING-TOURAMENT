import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  Gamepad2,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Zap,
  Award,
  Clock,
  QrCode,
  DollarSign
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Register & Setup In-Game ID',
    subtitle: 'Step 1: Player Onboarding',
    icon: Gamepad2,
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-500/40',
    shadowColor: 'shadow-purple-500/20',
    badge: 'Quick Setup',
    description: 'Sign in using your Google account or email. Enter your official In-Game ID / Gaming Username in your profile to ensure instant match pairing across BGMI, Free Fire, Ludo King, 8 Ball Pool, Chess, and Carrom Pool.',
    points: [
      'Fast 1-click Google Sign-In or Email registration',
      'Save your In-Game ID for BGMI, Free Fire, Ludo, Pool, Chess & Carrom',
      'Safe profile details stored in MongoDB Atlas'
    ]
  },
  {
    step: '02',
    title: 'Select Esports Tournament & Enter',
    subtitle: 'Step 2: Slot Confirmation',
    icon: Trophy,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/40',
    shadowColor: 'shadow-cyan-500/20',
    badge: 'Multi-Game Events',
    description: 'Browse active esports contests across BGMI, Free Fire, Ludo King, 8 Ball Pool, Chess, and Carrom Pool. Click "Join Tournament" and enter your payment UTR / Transaction ID.',
    points: [
      'Guaranteed cash prize pool tournaments across all titles',
      'Transparent entry fees with fixed player/team slots',
      'Instant slot confirmation after payment verification'
    ]
  },
  {
    step: '03',
    title: 'Challenge Opponent & Play Match',
    subtitle: 'Step 3: Live Esports Matchplay',
    icon: Zap,
    color: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-500/40',
    shadowColor: 'shadow-amber-500/20',
    badge: 'Live Match',
    description: 'Add your assigned opponent in-game or join the designated Room ID & Password (BGMI / Free Fire / Ludo / Pool / Chess / Carrom). Compete fairly according to standard match rules.',
    points: [
      'Opponent In-Game ID / Room Pass provided on your registration ticket',
      'Supports Solo 1v1, Duo, and Squad Battle Royale / Knockout formats',
      'Official fair play guidelines apply for all games'
    ]
  },
  {
    step: '04',
    title: 'Upload Screenshot & Receive Payout',
    subtitle: 'Step 4: Instant Rewards',
    icon: Award,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/40',
    shadowColor: 'shadow-emerald-500/20',
    badge: 'Direct UPI Payout',
    description: 'Take an unedited end-of-match victory screenshot and submit it to Admin within 10 minutes. Admin verifies match logs and sends your prize money directly to your UPI ID.',
    points: [
      '10-minute victory screenshot submission window',
      'Automated Admin log inspection & fair dispute handling',
      'Instant prize payout directly to your UPI account'
    ]
  }
];

const RULES_LIST = [
  {
    title: 'Esports Match Formats',
    desc: 'Tournaments support Solo 1v1, Duo, and Squad Battle Royale / Knockout formats across BGMI, Free Fire, Ludo King, 8 Ball Pool, Chess, and Carrom Pool.'
  },
  {
    title: 'Screenshot Proof Mandatory',
    desc: 'Winners must upload an unedited end-of-game victory screenshot within 10 minutes of match completion.'
  },
  {
    title: 'Disconnection Policy',
    desc: 'Player disconnections without valid screenshot proof result in forfeiture to ensure fair play.'
  },
  {
    title: '100% Cancellation Refund',
    desc: 'If a tournament is cancelled by Admin due to game updates, entry fees are 100% refunded to your UPI within 24h.'
  }
];

const HOW_IT_WORKS_FAQS = [
  {
    q: 'How do I add my opponent or join custom room?',
    a: 'Once your tournament slot is confirmed, open your Registration Ticket from the Profile page. You will see your assigned opponent\'s In-Game ID or Custom Room ID & Password. Open your game, connect with your opponent, and start competing!'
  },
  {
    q: 'What happens if my opponent doesn\'t show up?',
    a: 'If your opponent does not respond or join within 10 minutes of scheduled match time, take a screenshot of your match invite room and submit it to Admin. You will receive an automatic forfeit win.'
  },
  {
    q: 'How fast are prize payouts processed?',
    a: 'Prize money is processed within 15 to 30 minutes after the final match result and victory screenshot are verified by Admin.'
  },
  {
    q: 'Is there a minimum or maximum entry fee?',
    a: 'Entry fees vary by tournament (ranging from Free Entry up to ₹150+ for premium prize pool events).'
  }
];

export default function HowItWorks() {
  const { navigateTo } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 overflow-hidden">
      
      {/* 🚀 HERO SECTION */}
      <section className="relative text-center space-y-6 pt-6">
        <div className="absolute inset-0 flex items-center justify-center -z-10 blur-3xl opacity-20">
          <div className="w-96 h-96 rounded-full bg-purple-600"></div>
          <div className="w-80 h-80 rounded-full bg-cyan-500"></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-400" /> Official DD Gaming Tournament Rules
        </div>

        <div className="space-y-3">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tight leading-tight"
          >
            How <span className="text-gradient-purple">DD Gaming</span> Works
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Complete step-by-step master guide to joining multi-game esports tournaments (<strong className="text-purple-300">BGMI, Free Fire, Ludo King, 8 Ball Pool, Chess, Carrom Pool</strong>), playing live matches, verifying victory screenshots, and receiving direct UPI payouts.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-300 pt-4"
          >
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Transparent Rules
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-4 h-4 text-cyan-400" /> Fast Match Verification
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-400">
              <DollarSign className="w-4 h-4 text-amber-400" /> Direct UPI Prize Money
            </span>
          </motion.div>
        </div>
      </section>

      {/* 🎯 STEP-BY-STEP PROCESS GRID */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
            4-Step Tournament Journey
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            From entering your In-Game ID to collecting your prize money — here is how every contest operates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STEPS.map((stepItem, index) => {
            const Icon = stepItem.icon;
            return (
              <motion.div
                key={stepItem.step}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-8 rounded-3xl bg-slate-950/80 border ${stepItem.borderColor} glass-panel space-y-6 relative overflow-hidden shadow-2xl flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stepItem.color} flex items-center justify-center text-white shadow-lg ${stepItem.shadowColor}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="font-mono font-black text-3xl text-white/20">
                      {stepItem.step}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {stepItem.subtitle}
                    </span>
                    <h3 className="font-heading font-black text-2xl text-white mt-1">
                      {stepItem.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/80">
                  {stepItem.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 📜 TOURNAMENT RULES & DISPUTE GUIDELINES */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-black text-2xl text-white">
              Official Match & Dispute Policies
            </h2>
            <p className="text-xs text-slate-400">
              Clear regulations to guarantee 100% fair competition for all players.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RULES_LIST.map((rule, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <h4 className="font-heading font-bold text-sm text-purple-300">{rule.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ❓ FREQUENTLY ASKED QUESTIONS */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> Common Questions
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {HOW_IT_WORKS_FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-white hover:text-purple-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-purple-400' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-900"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🚀 CALL TO ACTION */}
      <section className="text-center p-10 rounded-3xl glass-panel border border-purple-500/30 space-y-5 bg-gradient-to-r from-purple-950/30 via-slate-950 to-cyan-950/30">
        <h2 className="font-heading font-black text-2xl sm:text-4xl text-white">
          Ready to Compete in Multi-Game Esports Contests?
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Join active tournaments across BGMI, Free Fire, Ludo King, 8 Ball Pool, Chess, and Carrom Pool, challenge real players, and win guaranteed prize money!
        </p>
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('tournaments')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-500/25 inline-flex items-center gap-2"
          >
            Explore Active Tournaments <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </section>

    </div>
  );
}
