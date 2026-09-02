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
    title: 'Register & Setup Gaming ID',
    subtitle: 'Step 1: Player Onboarding',
    icon: Gamepad2,
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-500/40',
    shadowColor: 'shadow-purple-500/20',
    badge: 'Quick Setup',
    description: 'Sign in using your Google account or email. Enter your official 8 Ball Pool Unique ID in your profile to ensure instant match pairing with your opponent.',
    points: [
      'Fast 1-click Google Sign-In or Email registration',
      'Save your 8 Ball Pool Unique ID for 1v1 challenges',
      'Safe profile details stored in MongoDB Atlas'
    ]
  },
  {
    step: '02',
    title: 'Select 1v1 Tournament & Enter',
    subtitle: 'Step 2: Slot Confirmation',
    icon: Trophy,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/40',
    shadowColor: 'shadow-cyan-500/20',
    badge: 'Fixed 32 Slots',
    description: 'Browse active 8 Ball Pool contests (e.g. ₹100 entry fee, ₹2,500 prize pool, 32 fixed slots). Click "Join Tournament" and enter your payment UTR ID.',
    points: [
      'Guaranteed ₹2,500 prize pool tournaments',
      'Transparent ₹100 entry fee with 32 fixed player slots',
      'Instant slot confirmation after payment verification'
    ]
  },
  {
    step: '03',
    title: 'Challenge Opponent in 8 Ball Pool',
    subtitle: 'Step 3: 1v1 Matchplay',
    icon: Zap,
    color: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-500/40',
    shadowColor: 'shadow-amber-500/20',
    badge: 'Live Duel',
    description: 'Add your assigned opponent in 8 Ball Pool using their Unique ID. Start your classic 1v1 knockout duel according to standard pool rules.',
    points: [
      'Opponent Unique ID provided on your registration ticket',
      'Classic 1v1 knockout match format',
      'Break and run rule applies; standard 8 ball pocketing'
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
    title: '1v1 Match Format',
    desc: 'All 8 Ball Pool contests follow a strict 1v1 knockout format with fixed 32 player slots.'
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
    q: 'How do I add my opponent in 8 Ball Pool?',
    a: 'Once your tournament slot is confirmed, open your Registration Ticket from the Profile page. You will see your assigned opponent\'s 8 Ball Pool Unique ID. Open 8 Ball Pool, tap "Friends" -> "Add Friend", enter their ID, and send a match invitation!'
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
    a: 'Our standard launch 1v1 tournaments feature a ₹100 entry fee for 32 fixed slots, with occasional ₹0 Free-Entry growth cups for community players.'
  }
];

export default function HowItWorks() {
  const { navigateTo } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 🚀 HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 rounded-3xl glass-panel border border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/40 via-slate-950/80 to-cyan-950/40" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/10"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            Official DD Gaming Player Manual
          </motion.div>

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
            Complete step-by-step master guide to joining <strong className="text-purple-300">1v1 8 Ball Pool tournaments</strong>, playing live duels with real players, verifying victory screenshots, and receiving direct UPI payouts.
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
            From entering your 8 Ball Pool ID to collecting your prize money — here is how every contest operates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STEPS.map((stepItem, index) => {
            const Icon = stepItem.icon;
            return (
              <motion.div
                key={stepItem.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`glass-panel p-6 sm:p-8 rounded-3xl border ${stepItem.borderColor} relative overflow-hidden shadow-xl ${stepItem.shadowColor}`}
              >
                {/* Floating Step Number */}
                <span className="absolute top-4 right-6 font-heading font-black text-6xl text-slate-800/40 pointer-events-none">
                  {stepItem.step}
                </span>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stepItem.color} shadow-lg text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] font-extrabold text-purple-300">
                      {stepItem.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      {stepItem.subtitle}
                    </span>
                    <h3 className="font-heading font-bold text-xl text-white mt-1">
                      {stepItem.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {stepItem.description}
                  </p>

                  <ul className="space-y-2 pt-2 border-t border-slate-800">
                    {stepItem.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ⚖️ OPERATIONAL RULES & FAIR PLAY */}
      <section className="p-8 rounded-3xl glass-panel border border-cyan-500/20 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white">
              Official Match Rules & Standards
            </h3>
            <p className="text-xs text-slate-400">
              Fair play standards enforced across all DD Gaming 1v1 tournaments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RULES_LIST.map((rule, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
              <h4 className="font-heading font-bold text-sm text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {rule.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ❓ FREQUENTLY ASKED QUESTIONS */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-purple-400" /> Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            Got questions about match pairing, tickets, or payouts?
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {HOW_IT_WORKS_FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl glass-panel border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between font-heading font-bold text-base text-white hover:text-purple-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3"
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
          Ready to Compete in 1v1 Pool Duels?
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Join our active tournaments, challenge real 8 Ball Pool players, and win guaranteed prize money!
        </p>
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('tournaments')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-500/25 inline-flex items-center gap-2"
          >
            Explore Active 1v1 Tournaments <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </section>

    </div>
  );
}
