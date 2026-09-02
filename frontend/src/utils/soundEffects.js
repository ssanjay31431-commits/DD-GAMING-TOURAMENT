// Web Audio API Sound Effects Generator for DD GAMING
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const setSoundEnabledState = (enabled) => {
  soundEnabled = enabled;
  if (enabled) {
    try {
      getAudioContext();
      playPoolCueHitSound();
    } catch (e) {}
  }
  return soundEnabled;
};

export const toggleSoundMute = () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    try {
      getAudioContext();
      playTabSelectSound();
    } catch (e) {}
  }
  return soundEnabled;
};

export const isSoundEnabled = () => soundEnabled;

/**
 * Futuristic UI Button Click Sound
 */
export function playClickSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

/**
 * Audible Mechanical Keypress Typing Sound Effect ⌨️
 */
export function playTypingSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Primary Key Click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const pitch = 900 + Math.random() * 300; // 900-1200 Hz
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);

    // Mechanical Key Clack Resonance
    const clackOsc = ctx.createOscillator();
    const clackGain = ctx.createGain();

    clackOsc.type = 'triangle';
    clackOsc.frequency.setValueAtTime(pitch * 1.4, now);
    clackOsc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    clackGain.gain.setValueAtTime(0.18, now);
    clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    clackOsc.connect(clackGain);
    clackGain.connect(ctx.destination);

    clackOsc.start(now);
    clackOsc.stop(now + 0.03);
  } catch (e) {}
}

/**
 * Authentic 8 Ball Pool Cue Strike & Ball Clack Sound!
 */
export function playPoolCueHitSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Wood Cue Tip Impact
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(180, now);
    thudOsc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
    thudGain.gain.setValueAtTime(0.35, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.08);

    // High Resin Ball Clack
    const clackOsc = ctx.createOscillator();
    const clackGain = ctx.createGain();
    clackOsc.type = 'sine';
    clackOsc.frequency.setValueAtTime(2400, now + 0.01);
    clackOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
    clackGain.gain.setValueAtTime(0.25, now + 0.01);
    clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    clackOsc.connect(clackGain);
    clackGain.connect(ctx.destination);
    clackOsc.start(now + 0.01);
    clackOsc.stop(now + 0.04);

  } catch (e) {}
}

/**
 * Tab / Filter Select Pop Sound
 */
export function playTabSelectSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {}
}

/**
 * Tournament Victory / Registration Success Arpeggio Chime 🎉
 */
export function playSuccessChimeSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.25);
    });
  } catch (e) {}
}

/**
 * Coin Collect Sound 🪙
 */
export function playCoinSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain2.gain.setValueAtTime(0.2, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  } catch (e) {}
}

/**
 * Error / Invalid Action Buzz Sound ❌
 */
export function playErrorSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(120, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {}
}
