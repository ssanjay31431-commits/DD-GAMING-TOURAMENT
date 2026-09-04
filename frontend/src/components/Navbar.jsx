import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home as HomeIcon, Trophy, Gamepad2, Ticket, Menu, X, Volume2, VolumeX, LogIn, LogOut, 
  ChevronRight, Bell, CheckCircle2, Clock, Sparkles, Trash2, CheckCheck, Play, Radio, 
  Award, HelpCircle, User 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { touchProps, handleTouchOrClick } from '../utils/touchHelper';
import { playClickSound } from '../utils/soundEffects';

export default function Navbar() {
  const { 
    activePage, navigateTo, isLoggedIn, logout, userProfile, soundActive, toggleSound, 
    notifications, unreadNotificationCount, markNotificationRead, clearAllNotifications 
  } = useApp();
  
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

  const getPageTitle = (pageId) => {
    switch (pageId) {
      case 'home': return 'Home';
      case 'tournaments': return 'Tournaments';
      case 'my-tournaments': return 'My Tournaments';
      case 'my-tickets': return 'My Tickets';
      case 'live': return 'Watch Live';
      case 'games': return 'Games Ecosystem';
      case 'leaderboard': return 'Player Rankings';
      case 'winners': return 'Hall of Fame';
      case 'profile': return 'Player Profile';
      case 'how-it-works': return 'How It Works';
      case 'admin': return 'Admin Portal';
      default: return 'DD Gaming';
    }
  };

  const handleNavClick = (pageId, label = '') => {
    console.log('MOBILE NAV CLICK:', label || pageId.toUpperCase());
    try {
      if (typeof playClickSound === 'function') playClickSound();
    } catch (_) {}
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
    navigateTo(pageId);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* TOP HEADER (DESKTOP HORIZONTAL NAVBAR + COMPACT MOBILE HEADER) */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-[90] w-full glass-panel border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* BRAND LOGO (DESKTOP & MOBILE) */}
            <button
              {...touchProps(() => {
                if (isLoggedIn) handleNavClick('home', 'BRAND_LOGO');
              })}
              className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none shrink-0 cursor-pointer touch-manipulation"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  <span className="font-heading font-black text-base sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    DD
                  </span>
                  <div className="absolute -bottom-1 -right-1 text-[9px] sm:text-[10px]">🎱</div>
                </div>
              </div>

              {/* Desktop Full Logo Text */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-lg sm:text-xl tracking-wider text-white">
                    DD <span className="text-purple-400">GAMING</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-300 uppercase tracking-widest">
                    ESPORTS
                  </span>
                </div>
                <p className="text-[10px] font-subheading font-bold text-slate-400 tracking-widest uppercase">
                  PLAY • COMPETE • WIN
                </p>
              </div>

              {/* Mobile Compact Logo Badge */}
              <div className="sm:hidden flex items-center gap-1">
                <span className="font-heading font-black text-sm tracking-wider text-white">
                  DD <span className="text-purple-400">GAMING</span>
                </span>
              </div>
            </button>

            {/* MOBILE COMPACT CENTER TITLE (< 1024px) */}
            <div className="lg:hidden flex-1 min-w-0 flex items-center justify-center px-2 overflow-hidden">
              <span className="font-heading font-extrabold text-xs sm:text-sm text-purple-300 uppercase tracking-wider truncate block w-full text-center">
                {getPageTitle(activePage)}
              </span>
            </div>

            {/* DESKTOP NAVIGATION LINKS (ONLY VISIBLE ON >= 1024px DESKTOP SCREENS) */}
            {isLoggedIn && (
              <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink min-w-0 overflow-x-auto no-scrollbar py-1">
                {navLinks.map((link) => {
                  const isActive = activePage === link.id;
                  return (
                    <button
                      key={link.id}
                      {...touchProps(() => handleNavClick(link.id, link.label))}
                      className={`relative px-2.5 xl:px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1 shrink-0 cursor-pointer touch-manipulation whitespace-nowrap ${
                        isActive
                          ? 'text-white font-bold bg-white/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="hidden 2xl:inline-block px-1.5 py-0.5 rounded-full text-[9px] xl:text-[10px] bg-purple-500/30 text-purple-300 border border-purple-500/40">
                          {link.badge}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute bottom-0 left-1 right-1 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* RIGHT CONTROLS: SFX + NOTIFICATIONS + PROFILE */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-2">
              {/* Sound Effects Toggle Button (DESKTOP + TABLET) */}
              <button
                {...touchProps(toggleSound)}
                className={`hidden sm:flex h-10 px-2.5 sm:px-3 rounded-xl border text-xs font-bold transition-all items-center gap-1.5 cursor-pointer touch-manipulation shrink-0 ${
                  soundActive
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30 shadow-sm shadow-purple-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title={soundActive ? 'Sound Effects Active (Click to mute)' : 'Sound Effects Muted (Click to enable)'}
              >
                {soundActive ? (
                  <Volume2 className="w-4 h-4 text-purple-400 shrink-0 pointer-events-none" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500 shrink-0 pointer-events-none" />
                )}
                <span className="text-[11px] font-mono tracking-tight shrink-0 pointer-events-none hidden md:inline">
                  {soundActive ? 'SFX ON' : 'SFX OFF'}
                </span>
              </button>

              {/* Notifications Bell Button */}
              {isLoggedIn && (
                <div className="relative shrink-0">
                  <button
                    {...touchProps(() => {
                      console.log('MOBILE NAV CLICK: NOTIFICATIONS_BELL');
                      setNotifDropdownOpen(!notifDropdownOpen);
                    })}
                    className={`h-10 w-10 sm:w-auto sm:px-3 rounded-xl border text-xs font-bold transition-all relative cursor-pointer touch-manipulation flex items-center justify-center gap-1.5 shrink-0 ${
                      unreadNotificationCount > 0
                        ? 'bg-purple-600/30 border-purple-500/50 text-purple-300 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                    title="In-App Notifications"
                  >
                    <Bell className="w-4 h-4 text-purple-400 pointer-events-none shrink-0" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono font-black text-[9px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow pointer-events-none">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  <AnimatePresence>
                    {notifDropdownOpen && (
                      <>
                        <div
                          onClick={() => setNotifDropdownOpen(false)}
                          className="fixed inset-0 z-[115] bg-transparent"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 rounded-2xl bg-slate-950 border border-purple-500/40 shadow-2xl p-4 z-[120] space-y-3"
                        >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-1.5 font-heading font-bold text-xs sm:text-sm text-white">
                            <Bell className="w-4 h-4 text-purple-400" /> Notifications
                          </div>
                          <div className="flex items-center gap-2">
                            {notifications && notifications.length > 0 && (
                              <button
                                {...touchProps(clearAllNotifications)}
                                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/30 transition-all flex items-center gap-1 cursor-pointer touch-manipulation"
                              >
                                <CheckCheck className="w-3 h-3" /> Clear
                              </button>
                            )}
                            <span className="text-[9px] font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                              {unreadNotificationCount} New
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
                                {...touchProps(() => {
                                  markNotificationRead(n.id);
                                  if (n.tournamentId) {
                                    handleNavClick('my-tournaments', 'NOTIFICATION_ITEM');
                                  }
                                  setNotifDropdownOpen(false);
                                })}
                                className={`p-2.5 rounded-xl cursor-pointer transition-colors space-y-1 touch-manipulation ${
                                  n.isRead ? 'bg-slate-950 hover:bg-slate-900 text-slate-400' : 'bg-purple-950/40 border border-purple-500/30 text-white font-semibold'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-purple-300 text-[10px] flex items-center gap-1">
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
                      </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Desktop Player Profile CTA Button / Login Button */}
              {isLoggedIn ? (
                <div className="hidden lg:flex items-center gap-2 shrink-0">
                  <button
                    {...touchProps(() => handleNavClick('profile', 'DESKTOP_PROFILE'))}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg border max-w-[170px] cursor-pointer touch-manipulation ${
                      activePage === 'profile'
                        ? 'bg-purple-600 border-purple-400 text-white shadow-purple-500/30'
                        : 'bg-slate-900/90 border-purple-500/30 text-white hover:border-purple-500/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-purple-400 shrink-0">
                      <img
                        src={userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                        alt={userProfile?.name || 'Player'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="truncate">{(userProfile?.name || 'Player').split(' ')[0]}</span>
                  </button>

                  <button
                    {...touchProps(logout)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all shrink-0 cursor-pointer touch-manipulation"
                    title="Logout Account"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  {...touchProps(() => handleNavClick('login', 'DESKTOP_LOGIN'))}
                  className="hidden lg:flex px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 items-center gap-1.5 border border-purple-400/40 shrink-0 cursor-pointer touch-manipulation"
                >
                  <LogIn className="w-4 h-4 text-white" />
                  <span>LOGIN / SIGN IN</span>
                </button>
              )}

              {/* Mobile Right Action Controls (< 1024px) */}
              <div className="lg:hidden flex items-center gap-2 shrink-0">
                {!isLoggedIn && (
                  <button
                    {...touchProps(() => handleNavClick('login', 'MOBILE_HEADER_LOGIN'))}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 flex items-center gap-1 border border-purple-400/40 shrink-0 cursor-pointer touch-manipulation active:scale-95"
                  >
                    <LogIn className="w-3.5 h-3.5 text-white pointer-events-none" />
                    <span className="pointer-events-none">LOGIN</span>
                  </button>
                )}

                <button
                  {...touchProps(() => {
                    console.log('MOBILE NAV CLICK: HAMBURGER_MENU');
                    playClickSound();
                    setMobileMenuOpen(prev => !prev);
                  })}
                  className="p-2 rounded-xl bg-slate-900 border border-purple-500/30 text-slate-200 focus:outline-none flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] justify-center"
                  title="Open Navigation Menu"
                >
                  {isLoggedIn && (
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-purple-400 shrink-0 pointer-events-none">
                      <img
                        src={userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                        alt={userProfile?.name || 'Player'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Menu className="w-5 h-5 text-purple-400 pointer-events-none" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE FIXED BOTTOM ESPORTS NAVIGATION BAR (< 1024px) */}
      {/* ========================================================= */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[130] glass-panel border-t border-purple-500/30 bg-slate-950/95 backdrop-blur-2xl px-2 py-1.5 shadow-2xl touch-manipulation"
        style={{ paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom, 12px))' }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          
          {/* 1. HOME */}
          <button
            type="button"
            {...touchProps(() => handleNavClick('home', 'HOME'))}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer touch-manipulation active:scale-95 min-w-[54px] min-h-[46px] ${
              activePage === 'home' ? 'text-purple-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HomeIcon className={`w-5 h-5 pointer-events-none transition-transform ${activePage === 'home' ? 'scale-110 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''}`} />
            <span className="text-[10px] tracking-tight mt-0.5 font-bold pointer-events-none">Home</span>
            {activePage === 'home' && (
              <motion.div layoutId="mobileNavActivePill" className="absolute top-0 w-7 h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)] pointer-events-none" />
            )}
          </button>

          {/* 2. TOURNAMENTS */}
          <button
            type="button"
            {...touchProps(() => handleNavClick('tournaments', 'TOURNAMENTS'))}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer touch-manipulation active:scale-95 min-w-[54px] min-h-[46px] ${
              activePage === 'tournaments' ? 'text-purple-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className={`w-5 h-5 pointer-events-none transition-transform ${activePage === 'tournaments' ? 'scale-110 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''}`} />
            <span className="text-[10px] tracking-tight mt-0.5 font-bold pointer-events-none">Tournaments</span>
            {activePage === 'tournaments' && (
              <motion.div layoutId="mobileNavActivePill" className="absolute top-0 w-7 h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)] pointer-events-none" />
            )}
          </button>

          {/* 3. MY ARENA OR WATCH LIVE */}
          <button
            type="button"
            {...touchProps(() => handleNavClick(isLoggedIn ? 'my-tournaments' : 'live', isLoggedIn ? 'MY_ARENA' : 'WATCH_LIVE'))}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer touch-manipulation active:scale-95 min-w-[54px] min-h-[46px] ${
              (isLoggedIn ? activePage === 'my-tournaments' : activePage === 'live') ? 'text-purple-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isLoggedIn ? (
              <Gamepad2 className={`w-5 h-5 pointer-events-none transition-transform ${activePage === 'my-tournaments' ? 'scale-110 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''}`} />
            ) : (
              <Radio className={`w-5 h-5 pointer-events-none transition-transform ${activePage === 'live' ? 'scale-110 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : ''}`} />
            )}
            <span className="text-[10px] tracking-tight mt-0.5 font-bold pointer-events-none">{isLoggedIn ? 'My Arena' : 'Watch Live'}</span>
            {(isLoggedIn ? activePage === 'my-tournaments' : activePage === 'live') && (
              <motion.div layoutId="mobileNavActivePill" className="absolute top-0 w-7 h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)] pointer-events-none" />
            )}
          </button>

          {/* 4. TICKETS OR LOGIN */}
          <button
            type="button"
            {...touchProps(() => handleNavClick(isLoggedIn ? 'my-tickets' : 'login', isLoggedIn ? 'TICKETS' : 'LOGIN'))}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer touch-manipulation active:scale-95 min-w-[54px] min-h-[46px] ${
              (isLoggedIn ? activePage === 'my-tickets' : activePage === 'login') ? 'text-purple-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isLoggedIn ? (
              <Ticket className={`w-5 h-5 pointer-events-none transition-transform ${activePage === 'my-tickets' ? 'scale-110 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''}`} />
            ) : (
              <LogIn className={`w-5 h-5 pointer-events-none transition-transform ${activePage === 'login' ? 'scale-110 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''}`} />
            )}
            <span className="text-[10px] tracking-tight mt-0.5 font-bold pointer-events-none">{isLoggedIn ? 'Tickets' : 'Login'}</span>
            {(isLoggedIn ? activePage === 'my-tickets' : activePage === 'login') && (
              <motion.div layoutId="mobileNavActivePill" className="absolute top-0 w-7 h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)] pointer-events-none" />
            )}
          </button>

          {/* 5. MORE */}
          <button
            type="button"
            {...touchProps(() => {
              console.log('MOBILE NAV CLICK: MORE');
              playClickSound();
              setMobileMenuOpen(prev => !prev);
            })}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer touch-manipulation active:scale-95 min-w-[54px] min-h-[46px] ${
              mobileMenuOpen ? 'text-purple-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5 pointer-events-none" />
            <span className="text-[10px] tracking-tight mt-0.5 font-bold pointer-events-none">More</span>
          </button>

        </div>
      </nav>

      {/* ========================================================= */}
      {/* MOBILE MORE MENU BOTTOM SHEET DRAWER (< 1024px) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[110] flex flex-col justify-end">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              {...touchProps(() => setMobileMenuOpen(false))}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Bottom Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-h-[85vh] overflow-y-auto bg-slate-950 border-t-2 border-purple-500/50 rounded-t-3xl p-5 space-y-4 shadow-2xl z-10 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
            >
              {/* Drag Handle Top Bar */}
              <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mb-2" />

              {/* Player Profile Header Box or Login Card */}
              {isLoggedIn ? (
                <div
                  {...touchProps(() => { handleNavClick('profile'); setMobileMenuOpen(false); })}
                  className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/40 flex items-center justify-between cursor-pointer touch-manipulation hover:border-purple-400 transition-all shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-purple-400 shrink-0">
                      <img
                        src={userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                        alt={userProfile?.name || 'Player'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-heading font-black text-sm text-white">{userProfile?.name || 'Esports Player'}</h4>
                      <p className="text-[11px] text-purple-300 font-mono">Rank: {userProfile?.rank || 'ROOKIE'} • Points: {userProfile?.ddPoints || 0}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                </div>
              ) : (
                <div
                  {...touchProps(() => { handleNavClick('login'); setMobileMenuOpen(false); })}
                  className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/80 via-slate-900 to-cyan-900/80 border border-purple-400/50 flex items-center justify-between cursor-pointer touch-manipulation hover:border-purple-400 transition-all shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300 shrink-0">
                      <LogIn className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-sm text-white">Login / Sign In</h4>
                      <p className="text-[11px] text-purple-200">Access tournaments & paid tickets</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-300" />
                </div>
              )}

              {/* Quick Feature Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  {...touchProps(() => { handleNavClick('live'); setMobileMenuOpen(false); })}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 hover:border-rose-500 flex items-center gap-2.5 text-left transition-all cursor-pointer touch-manipulation"
                >
                  <Radio className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
                  <div>
                    <span className="font-heading font-bold text-xs text-white block">Watch Live</span>
                    <span className="text-[9px] text-rose-300 font-mono">🔴 BROADCAST</span>
                  </div>
                </button>

                <button
                  {...touchProps(() => { handleNavClick('games'); setMobileMenuOpen(false); })}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/30 hover:border-purple-400 flex items-center gap-2.5 text-left transition-all cursor-pointer touch-manipulation"
                >
                  <Gamepad2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-heading font-bold text-xs text-white block">Games</span>
                    <span className="text-[9px] text-slate-400">8 Ball & BGMI</span>
                  </div>
                </button>

                <button
                  {...touchProps(() => { handleNavClick('leaderboard'); setMobileMenuOpen(false); })}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 flex items-center gap-2.5 text-left transition-all cursor-pointer touch-manipulation"
                >
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-heading font-bold text-xs text-white block">Rankings</span>
                    <span className="text-[9px] text-slate-400">Leaderboard</span>
                  </div>
                </button>

                <button
                  {...touchProps(() => { handleNavClick('winners'); setMobileMenuOpen(false); })}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 flex items-center gap-2.5 text-left transition-all cursor-pointer touch-manipulation"
                >
                  <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-heading font-bold text-xs text-white block">Winners</span>
                    <span className="text-[9px] text-slate-400">Hall of Fame</span>
                  </div>
                </button>
              </div>

              {/* Additional Menu Items */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-semibold">
                <button
                  {...touchProps(toggleSound)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 cursor-pointer touch-manipulation"
                >
                  <span className="flex items-center gap-2.5">
                    {soundActive ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    Sound Effects (SFX)
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${soundActive ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-500'}`}>
                    {soundActive ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  {...touchProps(() => { handleNavClick('how-it-works'); setMobileMenuOpen(false); })}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 cursor-pointer touch-manipulation"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    How It Works & Rules
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {isLoggedIn ? (
                  <button
                    {...touchProps(() => {
                      logout();
                      setMobileMenuOpen(false);
                    })}
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold uppercase tracking-wider mt-2 cursor-pointer touch-manipulation shadow-lg"
                  >
                    <LogOut className="w-4 h-4" /> Logout Account
                  </button>
                ) : (
                  <button
                    {...touchProps(() => {
                      handleNavClick('login');
                      setMobileMenuOpen(false);
                    })}
                    className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider mt-2 cursor-pointer touch-manipulation shadow-lg shadow-purple-500/30"
                  >
                    <LogIn className="w-4 h-4" /> Login Account
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                {...touchProps(() => setMobileMenuOpen(false))}
                className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs uppercase cursor-pointer touch-manipulation"
              >
                Close Menu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}


