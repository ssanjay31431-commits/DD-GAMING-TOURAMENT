import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { touchProps } from '../utils/touchHelper';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (username.trim() === 'ddgaming' && (password === 'ddgaming2026' || password === 'ddgaming20')) {
      localStorage.setItem('dd_admin_auth', 'true');
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError('Invalid Admin Credentials! Please verify username and password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-rose-500/40 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6"
      >
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-purple-600 border border-rose-400/40 text-white shadow-xl shadow-rose-500/30 mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase tracking-widest border border-rose-500/30">
              RESTRICTED ACCESS
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-2">
              ADMIN PORTAL LOGIN
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized personnel only. Authenticate to manage tournaments.
            </p>
          </div>
        </div>

        {/* Animated Error Alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-semibold flex items-center gap-3 shadow-lg"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Admin Username *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm font-semibold touch-manipulation min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Admin Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl glass-input text-sm font-semibold touch-manipulation min-h-[44px]"
              />
              <button
                type="button"
                {...touchProps(() => setShowPassword(!showPassword))}
                className="absolute right-2 top-2 p-2.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none touch-manipulation cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4 pointer-events-none" /> : <Eye className="w-4 h-4 pointer-events-none" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            {...touchProps(handleSubmit)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-heading font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all mt-6 touch-manipulation cursor-pointer min-h-[46px] active:scale-95"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight className="w-4 h-4 pointer-events-none" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-500">
          DD Gaming Esports System • Secure Admin Authentication
        </div>
      </motion.div>
    </div>
  );
}
