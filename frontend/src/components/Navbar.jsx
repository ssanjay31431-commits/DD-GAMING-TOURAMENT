import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gamepad2, Crown, User, Menu, X, Volume2, VolumeX, LogIn, LogOut, ChevronRight, Bell, CheckCircle2, Clock, Sparkles, Trash2, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { activePage, navigateTo, isLoggedIn, logout, userProfile, soundActive, toggleSound, playClickSound, notifications, unreadNotificationCount, markNotificationRead, clearAllNotifications } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'tournaments', label: 'Tournaments', badge: '🎱 8 Ball' },
    { id: 'my-tournaments', label: 'My Tournaments', badge: '🎟️ My Tickets' },
    { id: 'live', label: 'Watch Live', badge: '🔴 LIVE' },
    { id: 'games', label: 'Games' },
    { id: 'leaderboard', label: 'Rankings' },
    { id: 'winners', label: 'Winners' },
    { id: 'how-it-works', label: 'How It Works' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <button
            onClick={() => {
              if (isLoggedIn) navigateTo('home');
            }}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <span className="font-heading font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  DD
                </span>
                <div className="absolute -bottom-1 -right-1 text-[10px]">🎱</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-wider text-white">
                  DD <span className="text-purple-400">GAMING</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-300 uppercase tracking-widest hidden sm:inline-block">
                  ESPORTS
                </span>
              </div>
              <p className="text-[10px] font-subheading font-bold text-slate-400 tracking-widest uppercase">
                PLAY • COMPETE • WIN
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links - ONLY VISIBLE AFTER LOGGING IN */}
          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = activePage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => navigateTo(link.id)}
                    className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {link.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-500/30 text-purple-300 border border-purple-500/40">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Controls: SFX ON/OFF Always Retained + Profile CTA when Logged In */}
          <div className="flex items-center gap-3">
            {/* Sound Effects Toggle Button (ALWAYS RETAINED) */}
            <button
              onClick={toggleSound}
              className={`p-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                soundActive
                  ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundActive ? 'Sound Effects Active' : 'Sound Effects Muted'}
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span className="text-[11px] inline">{soundActive ? 'SFX ON' : 'SFX OFF'}</span>
            </button>

            {/* Notifications Bell Dropdown */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all relative ${
                    unreadNotificationCount > 0
                      ? 'bg-purple-600/30 border-purple-500/50 text-purple-300 animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="In-App Notifications"
                >
                  <Bell className="w-4 h-4 text-purple-400" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-purple-500/40 shadow-2xl p-4 z-50 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-1.5 font-heading font-bold text-sm text-white">
                          <Bell className="w-4 h-4 text-purple-400" /> Notifications
                        </div>
                        <div className="flex items-center gap-2">
                          {notifications && notifications.length > 0 && (
                            <button
                              onClick={() => clearAllNotifications()}
                              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-0.5 rounded-lg border border-purple-500/30 transition-all flex items-center gap-1"
                              title="Clear all notifications"
                            >
                              <CheckCheck className="w-3 h-3 text-purple-400" /> Clear All
                            </button>
                          )}
                          <span className="text-[10px] font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                            {unreadNotificationCount} Unread
                          </span>
                        </div>
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2 text-xs divide-y divide-slate-900">
                        {(!notifications || notifications.length === 0) ? (
                          <p className="text-center text-slate-500 text-xs py-6">No notifications yet.</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.tournamentId) {
                                  navigateTo('my-tournaments');
                                }
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-2.5 rounded-xl cursor-pointer transition-colors space-y-1 ${
                                n.isRead ? 'bg-slate-950 hover:bg-slate-900 text-slate-400' : 'bg-purple-950/40 border border-purple-500/30 text-white font-semibold'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-purple-300 text-xs flex items-center gap-1">
                                  {n.type === 'live' ? '🔴 LIVE' : n.type === 'result' ? '🥇 RESULTS' : '🎮 EVENT'}
                                </span>
                                <span className="text-[9px] text-slate-500">
                                  {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                </span>
                              </div>
                              <h5 className="font-bold text-white text-xs">{n.title}</h5>
                              <p className="text-[11px] text-slate-300 leading-tight">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications && notifications.length > 0 && (
                        <div className="pt-2 border-t border-slate-800">
                          <button
                            onClick={() => clearAllNotifications()}
                            className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white text-xs font-bold uppercase tracking-wider border border-purple-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Clear All Notifications
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile / Logout CTA - VISIBLE WHEN LOGGED IN */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => navigateTo('profile')}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg border ${
                    activePage === 'profile'
                      ? 'bg-purple-600 border-purple-400 text-white shadow-purple-500/30'
                      : 'bg-slate-900/90 border-purple-500/30 text-white hover:border-purple-500/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-purple-400 shrink-0">
                    <img
                      src={userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                      alt={userProfile?.name || 'Player'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{(userProfile?.name || 'Player').split(' ')[0]}</span>
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Mobile Hamburger Button - ONLY VISIBLE WHEN LOGGED IN */}
            {isLoggedIn && (
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={() => {
                    playClickSound();
                    setMobileMenuOpen(!mobileMenuOpen);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 focus:outline-none"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-purple-400" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu - ONLY VISIBLE WHEN LOGGED IN */}
      {isLoggedIn && (
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-purple-500/20 bg-slate-950/95 backdrop-blur-2xl overflow-hidden"
            >
              <div className="px-4 pt-3 pb-6 space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      navigateTo(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-base font-semibold transition-all ${
                      activePage === link.id
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {link.label}
                      {link.badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/30 text-purple-300">
                          {link.badge}
                        </span>
                      )}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </button>
                ))}

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </header>
  );
}
