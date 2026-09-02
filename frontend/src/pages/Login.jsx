import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useApp } from '../context/AppContext';
import { playTypingSound } from '../utils/soundEffects';
import { checkUsernameAvailabilityAPI } from '../utils/api';

export default function Login() {
  const { login, registerUser, googleLogin } = useApp();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    gamingUsername: ''
  });

  // Check username availability in real time
  const handleUsernameChange = async (val) => {
    setFormData((prev) => ({ ...prev, gamingUsername: val }));
    if (isRegisterMode && val.trim().length >= 3) {
      const res = await checkUsernameAvailabilityAPI(val);
      if (!res.available) {
        setErrorMsg(res.message);
        setSuggestions(res.suggestions || []);
      } else {
        setErrorMsg('');
        setSuggestions([]);
      }
    } else {
      setErrorMsg('');
      setSuggestions([]);
    }
  };

  // Official Google OAuth 2.0 Popup Trigger
  const triggerGoogleOAuth = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setIsLoadingGoogle(false);
      googleLogin(tokenResponse);
    },
    onError: (errorResponse) => {
      setIsLoadingGoogle(false);
      console.warn('Google OAuth error notice:', errorResponse);
      setErrorMsg('User has cancelled sign in.');
    },
    onNonOAuthError: (nonOAuthError) => {
      setIsLoadingGoogle(false);
      console.warn('Google non-OAuth notice:', nonOAuthError);
      setErrorMsg('User has cancelled sign in.');
    }
  });

  const handleGoogleAuthClick = () => {
    setErrorMsg('');
    setSuggestions([]);
    setIsLoadingGoogle(true);

    const timer = setTimeout(() => {
      setIsLoadingGoogle((prev) => {
        if (prev) {
          setErrorMsg('User has cancelled sign in.');
          return false;
        }
        return false;
      });
    }, 6000);

    try {
      triggerGoogleOAuth();
    } catch (err) {
      clearTimeout(timer);
      setIsLoadingGoogle(false);
      setErrorMsg('User has cancelled sign in.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuggestions([]);

    if (isRegisterMode) {
      if (!formData.email.trim() || !formData.password.trim() || !formData.fullName.trim()) {
        setErrorMsg('Please complete all required registration fields.');
        return;
      }
      const res = await registerUser(formData);
      if (res && res.success === false) {
        setErrorMsg(res.message || 'Registration failed.');
        if (res.suggestions) setSuggestions(res.suggestions);
      }
    } else {
      if (!formData.email.trim() || !formData.password.trim()) {
        setErrorMsg('Please enter your email and password.');
        return;
      }
      const res = await login(formData.email, formData.password);
      if (res && res.success === false) {
        setErrorMsg(res.message || 'Incorrect password or account not found.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[75vh] relative">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/90 border-2 border-purple-500/40 rounded-3xl p-8 shadow-2xl glass-panel relative overflow-hidden space-y-6"
      >
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-3xl">🎱</span>
            </div>
          </div>

          <h2 className="font-heading font-black text-2xl text-white tracking-wide">
            {isRegisterMode ? 'CREATE PLAYER ACCOUNT' : 'LOGIN TO DD GAMING'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegisterMode
              ? 'Join 8 Ball Pool tournaments & claim cash prize rewards'
              : 'Enter your player credentials to access tournaments'}
          </p>
        </div>

        {/* Auth Mode Tabs (Sign In / Create Account) */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg('');
              setSuggestions([]);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              !isRegisterMode
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg('');
              setSuggestions([]);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isRegisterMode
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>

        {/* Error & Suggested Username Banner */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center space-y-2">
            <p>{errorMsg}</p>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-semibold w-full">Click to select an available username:</span>
                {suggestions.map((suggested, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, gamingUsername: suggested });
                      setErrorMsg('');
                      setSuggestions([]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-600/40 hover:bg-purple-600 text-purple-200 border border-purple-400/40 text-xs font-mono font-bold transition-all"
                  >
                    {suggested}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Official Google Sign-In Button */}
        <button
          type="button"
          disabled={isLoadingGoogle}
          onClick={handleGoogleAuthClick}
          className="w-full py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-md active:scale-98 disabled:opacity-75"
        >
          {isLoadingGoogle ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest absolute">
            Or with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onKeyDown={playTypingSound}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Player Name"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">8 Ball Pool Unique ID / Gaming Username</label>
                <input
                  type="text"
                  value={formData.gamingUsername}
                  onKeyDown={playTypingSound}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="e.g. Player_8Ball"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onKeyDown={playTypingSound}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onKeyDown={playTypingSound}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {isRegisterMode ? 'Register & Enter Arena' : 'Login to DD Gaming'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        {/* Toggle Login vs Register footer link */}
        <div className="text-center pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg('');
              setSuggestions([]);
            }}
            className="text-xs text-purple-300 hover:text-purple-200 font-bold"
          >
            {isRegisterMode
              ? 'Already have an account? Sign in here'
              : 'Need a new player account? Create account here'}
          </button>
        </div>

      </motion.div>

    </div>
  );
}
