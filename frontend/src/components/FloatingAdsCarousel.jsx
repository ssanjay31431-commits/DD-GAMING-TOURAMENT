import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Gamepad2, Trophy, Flame } from 'lucide-react';
import { getGameBanner } from '../utils/gameBanners';
import { touchProps } from '../utils/touchHelper';
import { useApp } from '../context/AppContext';

export default function FloatingAdsCarousel({ className = '' }) {
  const { navigateTo, tournaments, openTournamentDetail } = useApp();

  const defaultPromoAds = [
    {
      id: 'promo-8ball',
      game: '8 Ball Pool',
      gameIcon: '🎱',
      title: '8 Ball Pool Cue Master Showdown',
      category: 'Cue Sports',
      prizePool: 2500,
      entryFee: 100,
      format: '1v1 Knockout',
      status: 'Registration Open',
      banner: '/assets/banners/8ball_banner.jpg',
      badge: '🔥 HOT EVENT'
    },
    {
      id: 'promo-bgmi',
      game: 'BGMI',
      gameIcon: '🎯',
      title: 'BGMI Squad Battle Royale Championship',
      category: 'Battle Royale',
      prizePool: 5000,
      entryFee: 150,
      format: 'Squad Custom Room',
      status: 'Registration Open',
      banner: '/assets/banners/bgmi_banner.jpg',
      badge: '🏆 ESPORTS LEAGUE'
    },
    {
      id: 'promo-freefire',
      game: 'Free Fire',
      gameIcon: '🔥',
      title: 'Free Fire Survival Championship',
      category: 'Battle Royale',
      prizePool: 3000,
      entryFee: 80,
      format: 'Duo & Squad Clash',
      status: 'Registration Open',
      banner: '/assets/banners/freefire_banner.jpg',
      badge: '⚡ POPULAR'
    },
    {
      id: 'promo-chess',
      game: 'Chess',
      gameIcon: '♟️',
      title: 'Chess Speed Blitz Masters',
      category: 'Strategy',
      prizePool: 1500,
      entryFee: 50,
      format: '1v1 Blitz Arena',
      status: 'Registration Open',
      banner: '/assets/banners/chess_banner.jpg',
      badge: '🧠 STRATEGY'
    },
    {
      id: 'promo-ludo',
      game: 'Ludo King',
      gameIcon: '🎲',
      title: 'Ludo King Star Cup',
      category: 'Casual Board',
      prizePool: 1000,
      entryFee: 40,
      format: 'Multiplayer Board',
      status: 'Registration Open',
      banner: '/assets/banners/ludo_banner.jpg',
      badge: '🎲 CASUAL'
    },
    {
      id: 'promo-carrom',
      game: 'Carrom Pool',
      gameIcon: '🥏',
      title: 'Carrom Precision Striker League',
      category: 'Board Sports',
      prizePool: 1200,
      entryFee: 60,
      format: '1v1 Board Match',
      status: 'Registration Open',
      banner: '/assets/banners/carrom_banner.jpg',
      badge: '🎯 PRECISION'
    }
  ];

  // Merge backend active tournaments if available
  const activePromoList = Array.isArray(tournaments) && tournaments.length > 0
    ? tournaments.map(t => ({
        id: t.id || t._id,
        game: t.game || 'Multi-Game',
        gameIcon: t.gameIcon || '🎮',
        title: t.title,
        category: t.category || t.game || 'Esports',
        prizePool: t.prizePool || t.totalPrize || 1000,
        entryFee: t.entryFee !== undefined ? t.entryFee : 50,
        format: t.format || '1v1 Match',
        status: t.status || 'Registration Open',
        banner: getGameBanner(t.game || t.title, t.banner),
        badge: t.status === 'Upcoming' ? '🕒 UPCOMING' : '🔴 LIVE REGISTER'
      }))
    : defaultPromoAds;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Automatic slide rotation every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activePromoList.length);
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activePromoList.length, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activePromoList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activePromoList.length) % activePromoList.length);
  };

  const currentItem = activePromoList[currentIndex] || defaultPromoAds[0];

  return (
    <div 
      className={`relative w-full max-w-sm mx-auto select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Floating 3D Outer Glowing Frame */}
      <div className="relative glass-panel p-5 sm:p-6 rounded-3xl border-2 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.35)] backdrop-blur-2xl space-y-4 animate-float-3d overflow-hidden">
        
        {/* Top Header Badge Row */}
        <div className="flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xl sm:text-2xl">{currentItem.gameIcon}</span>
            <span className="font-heading font-black text-white text-sm sm:text-base truncate">
              {currentItem.game}
            </span>
          </div>
          
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-cyan-300 border border-purple-400/40 uppercase tracking-widest shrink-0 animate-pulse">
            {currentItem.badge}
          </span>
        </div>

        {/* Banner Display Area (Auto + Manual Slider) */}
        <div className="relative h-48 w-full rounded-2xl border border-purple-500/30 overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id || currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Game Banner Image */}
              <img 
                src={currentItem.banner || getGameBanner(currentItem.game)} 
                alt={currentItem.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getGameBanner(currentItem.game);
                }}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
              />

              {/* Dark Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Title & Format Info */}
              <div className="absolute bottom-3 left-3 right-3 space-y-1 z-10 text-left">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {currentItem.category || currentItem.game}
                </span>
                <h4 className="font-heading font-black text-sm text-white truncate drop-shadow">
                  {currentItem.title}
                </h4>
              </div>

              {/* Top Corner Badges */}
              <div className="absolute top-2.5 left-2.5 bg-purple-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-purple-400/40 text-[10px] font-bold text-purple-200 shadow">
                Prize: ₹{currentItem.prizePool}
              </div>
              <div className="absolute top-2.5 right-2.5 bg-cyan-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-400/40 text-[10px] font-bold text-cyan-200 shadow">
                Entry: {currentItem.entryFee === 0 ? 'FREE' : `₹${currentItem.entryFee}`}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Manual Movement Arrow Buttons (Left & Right Overlay) */}
          <button
            type="button"
            {...touchProps(handlePrev)}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 border border-purple-500/40 text-white flex items-center justify-center hover:bg-purple-600 transition-colors z-20 cursor-pointer opacity-80 hover:opacity-100 touch-manipulation"
            title="Previous Banner"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            {...touchProps(handleNext)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 border border-purple-500/40 text-white flex items-center justify-center hover:bg-purple-600 transition-colors z-20 cursor-pointer opacity-80 hover:opacity-100 touch-manipulation"
            title="Next Banner"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CTA Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          {...touchProps(() => {
            if (currentItem.id && !currentItem.id.startsWith('promo-')) {
              openTournamentDetail(currentItem);
            } else {
              navigateTo('tournaments');
            }
          })}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 border border-purple-400/40 transition-all cursor-pointer touch-manipulation active:scale-95 z-10"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>JOIN EVENT ({currentItem.entryFee === 0 ? 'FREE ENTRY' : `₹${currentItem.entryFee} ENTRY`})</span>
        </motion.button>

        {/* Dots Carousel Slide Indicators */}
        <div className="flex items-center justify-center gap-1.5 pt-1 z-10">
          {activePromoList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              {...touchProps(() => setCurrentIndex(idx))}
              className={`h-1.5 rounded-full transition-all cursor-pointer touch-manipulation ${
                idx === currentIndex
                  ? 'w-6 bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
