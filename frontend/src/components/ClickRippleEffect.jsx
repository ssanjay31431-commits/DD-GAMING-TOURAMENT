import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClickSound, playTypingSound } from '../utils/soundEffects';

export default function ClickRippleEffect() {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    // Global Background Click Listener
    const handleGlobalClick = (e) => {
      // Play background click sound effect
      playClickSound();

      // Create expanding click shockwave
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY
      };

      setRipples((prev) => [...prev.slice(-8), newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 700);
    };

    // Global Keypress Listener for Input & Password Typing Sounds ⌨️
    const handleGlobalKeyDown = (e) => {
      const target = e.target;
      const tagName = target?.tagName;

      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target?.isContentEditable) {
        // Skip modifier keys for pure typing sound
        if (!['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
          playTypingSound();
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ opacity: 0.8, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              left: ripple.x - 35,
              top: ripple.y - 35,
              width: 70,
              height: 70
            }}
            className="absolute rounded-full border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.8)] pointer-events-none"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
