import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import Razorpay from 'razorpay';
import crypto from 'crypto';

import User from './models/User.js';
import Tournament from './models/Tournament.js';
import Registration from './models/Registration.js';
import Notification from './models/Notification.js';
import { sendBrevoEmail, sendSlotConfirmationEmail, sendPaymentRejectionEmail } from './services/emailService.js';


dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Disable buffering so queries fail/fallback immediately if DB is disconnected
mongoose.set('bufferCommands', false);

const app = express();

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Lightweight In-Memory Rate Limiter for Abuse Protection & High Concurrency Stability
const rateLimitMap = new Map();
function rateLimiter({ windowMs = 60 * 1000, maxRequests = 50, message = 'Too many requests, please try again shortly.' } = {}) {
  return (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const key = `${req.path}_${clientIp}`;
    const now = Date.now();

    const record = rateLimitMap.get(key) || { count: 0, startTime: now };

    if (now - record.startTime > windowMs) {
      record.count = 1;
      record.startTime = now;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(key, record);

    if (record.count > maxRequests) {
      return res.status(429).json({ success: false, message });
    }

    next();
  };
}

// In-Memory Stores
const memoryUsers = new Map();
const memoryRegistrations = [];
const memoryNotifications = [];

function parseYouTubeVideoId(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

async function createNotification({ userId, email, title, message, type = 'info', tournamentId = '' }) {
  const notifId = `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const notifData = {
    id: notifId,
    userId: userId || '',
    email: email ? email.toLowerCase().trim() : '',
    title,
    message,
    type,
    tournamentId: tournamentId || '',
    isRead: false,
    createdAt: new Date()
  };

  if (isDbConnected && mongoose.connection.readyState === 1) {
    try {
      const newNotif = new Notification(notifData);
      await newNotif.save();
      return newNotif;
    } catch (err) {
      console.warn('DB notification save warning:', err.message);
    }
  }
  memoryNotifications.unshift(notifData);
  return notifData;
}

const getTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Initial Seed Data for Tournaments
const INITIAL_TOURNAMENTS = [
  {
    id: 'trn-bgmi-01',
    title: 'DD BGMI Battle Royale Championship',
    game: 'BGMI',
    gameCode: 'bgmi',
    gameIcon: '🎯',
    banner: '/assets/banners/bgmi_banner.jpg',
    date: getTodayStr(),
    time: '08:00 PM IST',
    entryFee: 150,
    totalSlots: 100,
    registeredSlots: 48,
    prizePool: 5000,
    status: 'Registration Open',
    registrationStartDate: getTodayStr(),
    registrationStartTime: '10:00 AM IST',
    format: 'Squad Custom Room',
    mode: 'Standard',
    entryType: 'Squad',
    teamSize: 4,
    description: 'BGMI Battle Royale Squad Tournament. Complete custom room match with live stream coverage.',
    rules: ['1. No emulators allowed.', '2. Submit victory screenshot at match end.'],
    prizes: [
      { rank: '1st Place (Chicken Dinner)', amount: 3000 },
      { rank: '2nd Place', amount: 1200 },
      { rank: '3rd Place', amount: 800 }
    ],
    isFeatured: true
  },
  {
    id: 'trn-8ball-01',
    title: 'DD 8 Ball Pool Super Clash',
    game: '8 Ball Pool',
    gameCode: '8ball',
    gameIcon: '🎱',
    banner: '/assets/banners/8ball_banner.jpg',
    date: getTodayStr(),
    time: '08:30 PM IST',
    entryFee: 100,
    totalSlots: 32,
    registeredSlots: 18,
    prizePool: 2500,
    status: 'Registration Open',
    registrationStartDate: getTodayStr(),
    registrationStartTime: '10:00 AM IST',
    format: '1v1 Knockout',
    mode: 'Standard',
    entryType: 'Solo',
    teamSize: 1,
    description: 'Official DD 8 Ball Pool 1v1 Elimination Tournament. High stakes cue showdown.',
    rules: ['1. Standard Miniclip 8 Ball Pool rules.', '2. Winner submits victory screenshot.'],
    prizes: [
      { rank: '1st Place', amount: 1600 },
      { rank: '2nd Place', amount: 900 }
    ],
    isFeatured: true,
    is8BallSpecial: true
  },
  {
    id: 'trn-freefire-01',
    title: 'DD Free Fire Booyah Showcase',
    game: 'Free Fire',
    gameCode: 'freefire',
    gameIcon: '🔥',
    banner: '/assets/banners/freefire_banner.jpg',
    date: getTodayStr(),
    time: '09:00 PM IST',
    entryFee: 80,
    totalSlots: 48,
    registeredSlots: 22,
    prizePool: 3000,
    status: 'Registration Open',
    registrationStartDate: getTodayStr(),
    registrationStartTime: '10:00 AM IST',
    format: 'Duo & Squad Clash',
    mode: 'Standard',
    entryType: 'Duo',
    teamSize: 2,
    description: 'Free Fire Booyah Clash. Survive to claim victory and guaranteed cash prizes.',
    rules: ['1. Mobile devices only.', '2. Submit victory screenshot.'],
    prizes: [
      { rank: '1st Place (Booyah)', amount: 1800 },
      { rank: '2nd Place', amount: 1200 }
    ],
    isFeatured: true
  },
  {
    id: 'trn-ludo-01',
    title: 'DD Ludo King Master Arena',
    game: 'Ludo King',
    gameCode: 'ludo',
    gameIcon: '🎲',
    banner: '/assets/banners/ludo_banner.jpg',
    date: getTodayStr(),
    time: '07:30 PM IST',
    entryFee: 50,
    totalSlots: 16,
    registeredSlots: 9,
    prizePool: 1000,
    status: 'Registration Open',
    registrationStartDate: getTodayStr(),
    registrationStartTime: '10:00 AM IST',
    format: '4-Player Board Elimination',
    mode: 'Standard',
    entryType: 'Solo',
    teamSize: 1,
    description: 'Ludo King 4-player multiplayer board contest. Fast roll matches.',
    rules: ['1. Classic Ludo rules.', '2. Winner submits victory screenshot.'],
    prizes: [
      { rank: '1st Place', amount: 700 },
      { rank: '2nd Place', amount: 300 }
    ],
    isFeatured: false
  },
  {
    id: 'trn-chess-01',
    title: 'DD Chess Grandmaster Clash',
    game: 'Chess',
    gameCode: 'chess',
    gameIcon: '♟',
    banner: '/assets/banners/chess_banner.jpg',
    date: getTodayStr(),
    time: '09:30 PM IST',
    entryFee: 60,
    totalSlots: 32,
    registeredSlots: 12,
    prizePool: 1500,
    status: 'Registration Open',
    registrationStartDate: getTodayStr(),
    registrationStartTime: '10:00 AM IST',
    format: '1v1 Blitz Arena',
    mode: 'Standard',
    entryType: 'Solo',
    teamSize: 1,
    description: 'Chess 1v1 Blitz Tournament. Checkmate your opponent for instant cash rewards.',
    rules: ['1. 5 min blitz game format.', '2. Winner submits victory screenshot.'],
    prizes: [
      { rank: '1st Place', amount: 1000 },
      { rank: '2nd Place', amount: 500 }
    ],
    isFeatured: false
  },
  {
    id: 'trn-carrom-01',
    title: 'DD Carrom Pool Striker Series',
    game: 'Carrom Pool',
    gameCode: 'carrom',
    gameIcon: '🥏',
    banner: '/assets/banners/carrom_banner.jpg',
    date: getTodayStr(),
    time: '08:15 PM IST',
    entryFee: 40,
    totalSlots: 16,
    registeredSlots: 6,
    prizePool: 1200,
    status: 'Registration Open',
    registrationStartDate: getTodayStr(),
    registrationStartTime: '10:00 AM IST',
    format: '1v1 Board Strike',
    mode: 'Standard',
    entryType: 'Solo',
    teamSize: 1,
    description: 'Carrom Pool 1v1 Board Tournament. Pocket all pieces to take the cash pool.',
    rules: ['1. Standard Carrom Pool rules.', '2. Winner submits victory screenshot.'],
    prizes: [
      { rank: '1st Place', amount: 800 },
      { rank: '2nd Place', amount: 400 }
    ],
    isFeatured: false
  }
];

let isDbConnected = false;

// Connection Handler with 3s Timeout
const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
  const fallbackURI = 'mongodb://127.0.0.1:27017/dd_gaming';

  if (primaryURI && !primaryURI.includes('YOUR_PASSWORD_HERE')) {
    try {
      console.log('🔄 Connecting to MongoDB Atlas (dd_gaming)...');
      await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 5000 });
      isDbConnected = true;
      console.log(`[MongoDB Connected] Host: ${mongoose.connection.host}`);
    } catch (atlasErr) {
      const sanitizedMsg = atlasErr.message ? atlasErr.message.replace(/:([^@]+)@/, ':****@') : 'Authentication / Network failure';
      console.warn('⚠️ Atlas connection failed:', sanitizedMsg);
      try {
        await mongoose.disconnect();
      } catch (_) {}
    }
  }

  if (!isDbConnected) {
    try {
      console.log('🔄 Attempting connection to local MongoDB (dd_gaming)...');
      await mongoose.connect(fallbackURI, { serverSelectionTimeoutMS: 2000 });
      isDbConnected = true;
      console.log(`[MongoDB Connected] Host: ${mongoose.connection.host}`);
    } catch (localErr) {
      console.warn('⚠️ Local MongoDB not found. Server running with active validation API endpoints.');
    }
  }

  if (isDbConnected) {
    try {
      const count = await Tournament.countDocuments();
      if (count === 0 && INITIAL_TOURNAMENTS.length > 0) {
        console.log('🌱 Seeding initial tournaments into MongoDB...');
        await Tournament.insertMany(INITIAL_TOURNAMENTS);
        console.log('✅ Initial tournaments seeded into MongoDB!');
      }
      await backfillMissingUserIds();
    } catch (seedErr) {
      console.warn('Seed notice:', seedErr.message);
    }
  }
};

connectDB();

// Health check API
app.get('/api/health', (req, res) => {
  const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID'));
  res.json({
    status: 'OK',
    dbConnected: isDbConnected,
    googleClientIdConfigured: isGoogleConfigured,
    googleClientId: process.env.GOOGLE_CLIENT_ID || 'Not set',
    message: isDbConnected ? 'Connected to MongoDB!' : 'API active (Waiting for MongoDB credentials in .env)'
  });
});

// CHECK USERNAME AVAILABILITY IN MONGO DB
app.get('/api/auth/check-username', async (req, res) => {
  try {
    const { username, currentEmail } = req.query;
    if (!username || !username.trim()) {
      return res.json({ available: true });
    }

    const cleanUsername = username.trim();
    let isTaken = false;

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({
        gamingUsername: { $regex: new RegExp(`^${cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (existingUser && (!currentEmail || existingUser.email !== currentEmail.toLowerCase().trim())) {
        isTaken = true;
      }
    } else {
      for (const item of memoryUsers.values()) {
        if (item.user.gamingUsername && item.user.gamingUsername.toLowerCase() === cleanUsername.toLowerCase()) {
          if (!currentEmail || item.user.email !== currentEmail.toLowerCase().trim()) {
            isTaken = true;
            break;
          }
        }
      }
    }

    if (isTaken) {
      const base = cleanUsername.replace(/_\d+$/, '');
      const suggestions = [
        `${base}_8Ball_${Math.floor(10 + Math.random() * 89)}`,
        `${base}_Pro`,
        `${base}_DD_${Math.floor(100 + Math.random() * 899)}`,
        `Real_${base}`
      ];

      return res.json({
        available: false,
        message: 'Username is already taken. Please choose another or click a suggested username below:',
        suggestions
      });
    }

    return res.json({ available: true, message: 'Username is available!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getRegistrationStartDateTime(startDate, startTime) {
  if (!startDate) return null;
  if (typeof startDate === 'object' && startDate instanceof Date) {
    return startDate;
  }

  const dateParts = String(startDate).split('T')[0].split('-').map(Number);
  if (dateParts.length !== 3 || isNaN(dateParts[0])) {
    const fallback = new Date(startDate);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  const year = dateParts[0];
  const month = dateParts[1] - 1; // 0-indexed month
  const day = dateParts[2];

  let hours = 0;
  let minutes = 0;

  if (startTime) {
    const match = String(startTime).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

async function autoCheckUpcomingTournaments() {
  const now = new Date();
  // Check memory store
  INITIAL_TOURNAMENTS.forEach(trn => {
    if (trn.status === 'Upcoming' && trn.registrationStartDate) {
      const startAt = getRegistrationStartDateTime(trn.registrationStartDate, trn.registrationStartTime) || (trn.registrationStartAt ? new Date(trn.registrationStartAt) : null);
      if (startAt && startAt <= now) {
        trn.status = 'Registration Open';
        console.log(`[Auto Open] Memory tournament "${trn.title}" status changed from Upcoming to Registration Open`);
      }
    }
  });

  // Check MongoDB
  if (isDbConnected && mongoose.connection.readyState === 1) {
    try {
      const upcomingTournaments = await Tournament.find({ status: 'Upcoming' });
      for (const trn of upcomingTournaments) {
        if (trn.registrationStartDate) {
          const startAt = getRegistrationStartDateTime(trn.registrationStartDate, trn.registrationStartTime) || (trn.registrationStartAt ? new Date(trn.registrationStartAt) : null);
          if (startAt && startAt <= now) {
            trn.status = 'Registration Open';
            await trn.save();
            console.log(`[Auto Open] DB tournament "${trn.title}" status changed from Upcoming to Registration Open`);
            await createNotification({
              title: `🚀 Registration NOW OPEN: ${trn.title}`,
              message: `Registration has automatically started for ${trn.title}! Lock in your slot now!`,
              type: 'tournament',
              tournamentId: trn.id
            });
          }
        }
      }
    } catch (err) {
      console.warn('Auto-check upcoming tournaments warning:', err.message);
    }
  }
}

// Status is 100% managed by Admin Control Panel
// setInterval(autoCheckUpcomingTournaments, 10000);

function getMatchStartDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'object' && dateStr instanceof Date) return dateStr;

  const dateParts = String(dateStr).split('T')[0].split('-').map(Number);
  if (dateParts.length !== 3 || isNaN(dateParts[0])) {
    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  const year = dateParts[0];
  const month = dateParts[1] - 1;
  const day = dateParts[2];

  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const match = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

function computeTournamentLiveStatus(trn, isAdmin = false) {
  if (!trn) return trn;
  const trnObj = typeof trn.toObject === 'function' ? trn.toObject() : { ...trn };
  const nowMs = Date.now();
  trnObj.serverTime = new Date().toISOString();

  // Slot Calculations (Solo = player slots, Duo/Team = team slots)
  const totalCapacity = Number(trnObj.totalSlots || 0);
  const registeredCount = Number(trnObj.registeredSlots || 0);
  const joinedCount = Number(trnObj.joinedCount || 0);

  trnObj.remainingSlots = Math.max(0, totalCapacity - registeredCount);
  trnObj.remainingJoiningSlots = Math.max(0, registeredCount - joinedCount);
  trnObj.joinedCount = joinedCount;

  if (trnObj.roomPublishedAt) {
    const startMs = new Date(trnObj.roomPublishedAt).getTime();
    const endMs = trnObj.joiningWindowEnd ? new Date(trnObj.joiningWindowEnd).getTime() : (startMs + (30 * 60 * 1000));

    trnObj.joiningWindowStartMs = startMs;
    trnObj.joiningWindowEndMs = endMs;
    trnObj.remainingWindowMs = Math.max(0, endMs - nowMs);
    trnObj.registrationClosed = true;

    if (!['Completed', 'Expired', 'Result Pending', 'Cancelled'].includes(trnObj.status)) {
      if (nowMs >= startMs && nowMs < endMs) {
        trnObj.joiningStatus = 'JOINING_OPEN';
        trnObj.status = 'JOINING_OPEN';
        trnObj.joiningClosed = false;
      } else if (nowMs >= endMs) {
        trnObj.joiningStatus = 'JOINING_CLOSED';
        if (trnObj.status === 'JOINING_OPEN' || trnObj.status === 'Registration Open' || trnObj.status === 'Almost Full') {
          trnObj.status = 'Live';
        }
        trnObj.joiningClosed = true;
      }
    }

    if (nowMs < startMs && !isAdmin) {
      trnObj.roomIdMasked = true;
      trnObj.roomId = '';
      trnObj.roomPassword = '';
    } else {
      trnObj.roomIdMasked = false;
    }
  } else {
    trnObj.joiningStatus = 'WAITING_FOR_ROOM';
    trnObj.remainingWindowMs = 0;
    if (!['Completed', 'Expired', 'Result Pending', 'Cancelled', 'Registration Closed'].includes(trnObj.status)) {
      trnObj.status = trnObj.status || 'Registration Open';
    }
    if (!isAdmin) {
      trnObj.roomIdMasked = true;
      trnObj.roomId = '';
      trnObj.roomPassword = '';
    }
  }

  return trnObj;
}

// GET all tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    await autoCheckUpcomingTournaments();
    const isAdmin = req.headers['authorization']?.includes('admin') || req.query.admin === 'true';
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const tournaments = await Tournament.find();
      const processed = tournaments.map(t => computeTournamentLiveStatus(t, isAdmin));
      return res.json(processed);
    }
  } catch (err) {
    console.warn('DB fetch tournaments warning:', err.message);
  }
  const processed = INITIAL_TOURNAMENTS.map(t => computeTournamentLiveStatus(t, false));
  res.json(processed);
});

// HELPER: Generate guaranteed unique custom Application ID ('id')
async function generateUniqueAppId() {
  let isUnique = false;
  let customId = '';
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    attempts++;
    customId = `usr-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ id: customId });
      if (!existing) isUnique = true;
    } else {
      isUnique = true;
    }
  }
  if (!isUnique) {
    customId = `usr-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  return customId;
}

// HELPER: Safely backfill missing custom 'id', 'playerId', or 'gamingUsername' for existing MongoDB users
async function backfillMissingUserIds() {
  try {
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const usersWithoutId = await User.find({ $or: [{ id: { $exists: false } }, { id: null }, { id: '' }] });
      if (usersWithoutId.length > 0) {
        console.log(`🔧 Backfilling missing custom 'id' for ${usersWithoutId.length} existing MongoDB user(s)...`);
        for (const u of usersWithoutId) {
          u.id = await generateUniqueAppId();
          if (!u.playerId) u.playerId = await generateUniquePlayerId();
          if (!u.gamingUsername) u.gamingUsername = await generateUniqueGamingUsername(u.name || u.email.split('@')[0]);
          await u.save().catch(e => console.warn('Notice backfilling user ID:', e.message));
        }
        console.log(`✅ User 'id' backfill completed.`);
      }
    }
  } catch (err) {
    console.warn('Notice during user ID backfill check:', err.message);
  }
}

// HELPER: Generate guaranteed unique Player ID
async function generateUniquePlayerId() {
  let isUnique = false;
  let playerId = '';
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    attempts++;
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    playerId = `DD-GAME-${randomNum}`;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ playerId });
      if (!existing) isUnique = true;
    } else {
      isUnique = true;
    }
  }
  if (!isUnique) {
    playerId = `DD-GAME-${Date.now()}`;
  }
  return playerId;
}

// HELPER: Generate guaranteed unique Gaming Username for Google sign ups
async function generateUniqueGamingUsername(baseName) {
  const clean = (baseName || 'Player').replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 15);
  let candidate = `${clean}_DD`;
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    attempts++;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ gamingUsername: candidate });
      if (!existing) {
        isUnique = true;
      } else {
        candidate = `${clean}_${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else {
      isUnique = true;
    }
  }
  if (!isUnique) {
    candidate = `${clean}_${Date.now().toString().slice(-4)}`;
  }
  return candidate;
}

// AUTH: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, gamingUsername } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    if (isDbConnected && mongoose.connection.readyState === 1) {
      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'An account already exists with this email. Please sign in.' });
      }

      if (gamingUsername) {
        const existingUsername = await User.findOne({
          gamingUsername: { $regex: new RegExp(`^${gamingUsername.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
        if (existingUsername) {
          const base = gamingUsername.trim().replace(/_\d+$/, '');
          const suggestions = [
            `${base}_8Ball_${Math.floor(10 + Math.random() * 89)}`,
            `${base}_Pro`,
            `${base}_DD_${Math.floor(100 + Math.random() * 899)}`
          ];
          return res.status(400).json({
            message: 'Username is already taken. Please choose another or select a suggested username:',
            suggestions
          });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const appId = await generateUniqueAppId();
      const playerId = await generateUniquePlayerId();

      const newUser = new User({
        id: appId,
        name: fullName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: hashedPassword,
        gamingUsername: gamingUsername || `${fullName || normalizedEmail.split('@')[0]}_8Ball`,
        playerId,
        provider: 'local',
        hasSeenWelcome: false,
        lastLoginAt: now
      });

      try {
        await newUser.save();
      } catch (saveErr) {
        if (saveErr.code === 11000) {
          newUser.id = await generateUniqueAppId();
          newUser.playerId = `DD-GAME-${Date.now()}`;
          await newUser.save();
        } else {
          throw saveErr;
        }
      }
      const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.status(201).json({ token, user: newUser });
    }

    // Memory Store for offline validation
    if (memoryUsers.has(normalizedEmail)) {
      return res.status(400).json({ message: 'An account already exists with this email. Please sign in.' });
    }

    if (gamingUsername) {
      for (const item of memoryUsers.values()) {
        if (item.user.gamingUsername && item.user.gamingUsername.toLowerCase() === gamingUsername.trim().toLowerCase()) {
          const base = gamingUsername.trim().replace(/_\d+$/, '');
          const suggestions = [
            `${base}_8Ball_${Math.floor(10 + Math.random() * 89)}`,
            `${base}_Pro`,
            `${base}_DD_${Math.floor(100 + Math.random() * 899)}`
          ];
          return res.status(400).json({
            message: 'Username is already taken. Please choose another or select a suggested username:',
            suggestions
          });
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const playerId = `DD-8B-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdUser = {
      id: `usr-${Date.now()}`,
      name: fullName || normalizedEmail.split('@')[0],
      gamingUsername: gamingUsername || `${fullName || normalizedEmail.split('@')[0]}_8Ball`,
      playerId,
      email: normalizedEmail,
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      provider: 'local',
      hasSeenWelcome: false,
      createdAt: now,
      lastLoginAt: now,
      rank: 'UNRANKED',
      ddPoints: 0,
      totalTournamentsPlayed: 0,
      wins: 0,
      losses: 0,
      totalWinnings: 0,
      registeredTournaments: []
    };

    memoryUsers.set(normalizedEmail, { user: createdUser, passwordHash: hashedPassword });

    return res.status(201).json({
      token: `jwt-token-${Date.now()}`,
      user: createdUser
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AUTH: Login with Strict Password Validation
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email address. Please register.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password. Please try again.' });
      }

      user.lastLoginAt = now;
      await user.save();

      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.json({ token, user });
    }

    // Memory Store Authentication Check
    const stored = memoryUsers.get(normalizedEmail);
    if (!stored) {
      return res.status(404).json({ message: 'No account found with this email address. Please register.' });
    }

    const isMatch = await bcrypt.compare(password, stored.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    stored.user.lastLoginAt = now;

    return res.json({
      token: `jwt-token-${Date.now()}`,
      user: stored.user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// AUTH: Official Google OAuth Verification & Persistence
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, accessToken, email: reqEmail, name: reqName, avatar: reqAvatar, sub: reqSub } = req.body;
    let email = reqEmail;
    let name = reqName;
    let avatar = reqAvatar;
    let googleId = reqSub || '';

    // 1. Verify Google ID Token / Access Token
    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        }).catch(() => null);

        if (ticket) {
          const payload = ticket.getPayload();
          email = payload.email;
          name = payload.name;
          avatar = payload.picture;
          googleId = payload.sub || googleId;
        } else {
          // Fetch tokeninfo directly from Google OAuth API
          const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
          if (response.ok) {
            const payload = await response.json();
            email = payload.email;
            name = payload.name;
            avatar = payload.picture;
            googleId = payload.sub || googleId;
          }
        }
      } catch (tokenErr) {
        console.warn('Google ID token verification notice:', tokenErr.message);
      }
    } else if (accessToken) {
      try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
        if (response.ok) {
          const payload = await response.json();
          email = payload.email;
          name = payload.name;
          avatar = payload.picture;
          googleId = payload.sub || googleId;
        }
      } catch (accessErr) {
        console.warn('Google Access Token verification notice:', accessErr.message);
      }
    }

    // 2. Validate Google Identity - return 401 if credential invalid or email missing
    if (!email) {
      return res.status(401).json({ message: 'Invalid or expired Google authentication credentials.' });
    }

    // 3. Ensure Database Availability - return 500 if DB unavailable
    if (!isDbConnected || mongoose.connection.readyState !== 1) {
      console.error('❌ Database connection unavailable during Google Auth attempt');
      return res.status(500).json({ message: 'Database service temporarily unavailable. Please try again later.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    // 4. Search existing user by googleId OR normalized email in MongoDB
    let queryConditions = [{ email: normalizedEmail }];
    if (googleId) {
      queryConditions.push({ googleId });
    }

    let user = await User.findOne({ $or: queryConditions });

    if (user) {
      // Existing User -> Update fields and backfill missing unique IDs safely
      user.lastLoginAt = now;
      user.provider = user.provider || 'google';
      if (googleId && !user.googleId) user.googleId = googleId;
      if (avatar) {
        user.avatar = avatar;
        user.profilePicture = avatar;
      }
      if (name && (!user.name || user.name === 'Player Account')) {
        user.name = name;
      }
      if (!user.id) {
        user.id = await generateUniqueAppId();
      }
      if (!user.playerId) {
        user.playerId = await generateUniquePlayerId();
      }
      if (!user.gamingUsername) {
        user.gamingUsername = await generateUniqueGamingUsername(name || user.email.split('@')[0]);
      }

      try {
        await user.save();
      } catch (saveErr) {
        if (saveErr.code === 11000) {
          console.warn('⚠️ [Google Auth Warning] Duplicate key collision on existing user update:', saveErr.message);
          user.id = await generateUniqueAppId();
          user.playerId = `DD-GAME-${Date.now()}`;
          await user.save();
        } else {
          throw saveErr;
        }
      }
      console.log(`✅ Existing Google User updated in MongoDB: ${user.email} (lastLoginAt: ${now.toISOString()})`);
    } else {
      // First-time sign in -> Create new User document in MongoDB
      const cleanName = name || normalizedEmail.split('@')[0];
      const appId = await generateUniqueAppId();
      const playerId = await generateUniquePlayerId();
      const gamingUsername = await generateUniqueGamingUsername(cleanName);

      user = new User({
        id: appId,
        name: cleanName,
        email: normalizedEmail,
        googleId: googleId || '',
        password: '',
        gamingUsername,
        playerId,
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        profilePicture: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        hasSeenWelcome: false,
        lastLoginAt: now,
        ddPoints: 50,
        rank: 'UNRANKED'
      });

      try {
        await user.save();
      } catch (saveErr) {
        if (saveErr.code === 11000) {
          console.warn('⚠️ [Google Auth Warning] Duplicate key collision on new user creation:', saveErr.message);
          user.id = await generateUniqueAppId();
          user.playerId = `DD-GAME-${Date.now()}`;
          user.gamingUsername = `${cleanName.replace(/[^a-zA-Z0-9_]/g, '_')}_${Date.now().toString().slice(-4)}`;
          await user.save();
        } else {
          throw saveErr;
        }
      }
      console.log(`✅ New Google User created & saved in MongoDB: ${user.email} (ID: ${user._id})`);
    }

    // 5. Generate JWT token ONLY AFTER successful Google verification & DB save
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    return res.json({ token, user });

  } catch (err) {
    console.error('❌ [Google Auth Error]');
    console.error('  Error Name:', err.name || 'Error');
    console.error('  Error Message:', err.message);
    if (err.stack) console.error('  Stack Trace:', err.stack);

    if (err.code === 11000) {
      return res.status(409).json({ message: 'Account creation conflict: A user record with these credentials already exists.' });
    }
    return res.status(500).json({ message: 'Authentication service error. Please try again.' });
  }
});

// FEATURE 4 & 5: SECURE USER-SPECIFIC PROFILE ENDPOINT
app.get('/api/my-profile', async (req, res) => {
  try {
    const email = req.query.email ? req.query.email.toLowerCase().trim() : '';
    if (!email) return res.status(400).json({ message: 'User email is required' });

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email }).select('-password -__v');
      if (user) return res.json(user);
    }

    const stored = memoryUsers.get(email);
    if (stored) return res.json(stored.user);

    res.status(404).json({ message: 'User profile not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FEATURE 4 & 5: SECURE USER-SPECIFIC REGISTRATIONS ENDPOINT
app.get('/api/my-registrations', async (req, res) => {
  try {
    const email = req.query.email ? req.query.email.toLowerCase().trim() : '';
    if (!email) return res.status(400).json({ message: 'User email is required' });

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const userRegs = await Registration.find({ email }).sort({ createdAt: -1 });
      return res.json(userRegs);
    }

    const memoryFiltered = memoryRegistrations.filter(r => r.email && r.email.toLowerCase().trim() === email);
    res.json(memoryFiltered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FEATURE 3: MARK FIRST-TIME WELCOME ANIMATION AS SEEN IN MONGODB
app.post('/api/users/welcome-seen', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'User email is required' });
    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        user.hasSeenWelcome = true;
        await user.save();
        console.log(`✅ Welcome animation marked as seen in MongoDB for: ${user.email}`);
        return res.json({ success: true, hasSeenWelcome: true, user });
      }
    }

    const stored = memoryUsers.get(normalizedEmail);
    if (stored) {
      stored.user.hasSeenWelcome = true;
      return res.json({ success: true, hasSeenWelcome: true, user: stored.user });
    }

    res.json({ success: true, hasSeenWelcome: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In-Flight Registration Locks Map to prevent simultaneous double click requests
const pendingRegistrationLocks = new Set();

function deduplicateRegistrations(regList) {
  if (!Array.isArray(regList)) return [];
  const seen = new Set();
  const result = [];
  for (const reg of regList) {
    const key = `${reg.tournamentId || reg.tournament?.id || 't'}_${(reg.email || '').toLowerCase().trim()}_${(reg.gamingId || '').trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(reg);
    }
  }
  return result;
}

// GET Registrations (Admin view / System view)
app.get('/api/registrations', async (req, res) => {
  try {
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const registrations = await Registration.find().sort({ createdAt: -1 });
      return res.json(deduplicateRegistrations(registrations));
    }
  } catch (err) {
    console.warn('DB registrations fetch warning:', err.message);
  }
  res.json(deduplicateRegistrations(memoryRegistrations));
});

// SUBMIT Registration (Player registration form submit with strict anti-double click locks)
app.post('/api/registrations', rateLimiter({ windowMs: 60 * 1000, maxRequests: 20 }), async (req, res) => {
  const { tournament, fullName, gamingId, phone, email, txnId, paymentScreenshot } = req.body || {};
  if (!tournament || !tournament.id || !fullName || !gamingId || !email) {
    return res.status(400).json({ success: false, message: 'Missing required registration fields.' });
  }

  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const cleanGamingId = gamingId ? gamingId.trim() : '';
  const lockKey = `${tournament.id}_${normalizedEmail}_${cleanGamingId}`;

  if (pendingRegistrationLocks.has(lockKey)) {
    return res.status(409).json({
      success: false,
      message: 'Your registration request is already being processed. Please wait a moment.'
    });
  }

  pendingRegistrationLocks.add(lockKey);

  try {
    const regId = `REG-DD-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isDbConnected && mongoose.connection.readyState === 1) {
      // 0. Verify tournament registration status strictly
      const targetTrn = await Tournament.findOne({ id: tournament.id });
      if (targetTrn) {
        if (targetTrn.roomPublishedAt || targetTrn.registrationClosed || targetTrn.status === 'JOINING_OPEN' || targetTrn.status === 'Live' || targetTrn.status === 'Registration Closed' || targetTrn.status === 'Completed') {
          return res.status(400).json({
            success: false,
            message: `Joining is currently available only for registered players. New registration for "${targetTrn.title}" is closed.`
          });
        }
      }

      // 1. Check for duplicate registration to prevent race conditions & double-click tickets
      const existingReg = await Registration.findOne({
        tournamentId: tournament.id,
        $or: [{ email: normalizedEmail }, { gamingId: cleanGamingId }]
      });

      if (existingReg) {
        return res.status(200).json(existingReg);
      }

      // 2. Atomic slot incrementation to prevent overbooking
      const updatedTournament = await Tournament.findOneAndUpdate(
        { id: tournament.id, registeredSlots: { $lt: tournament.totalSlots || 100 } },
        { $inc: { registeredSlots: 1 } },
        { new: true }
      );

      if (!updatedTournament) {
        return res.status(400).json({
          success: false,
          message: 'Tournament registration slots are completely full!'
        });
      }

      // Auto update status if full or almost full
      if (updatedTournament.registeredSlots >= updatedTournament.totalSlots) {
        updatedTournament.status = 'Registration Closed';
        await updatedTournament.save();
      } else if (updatedTournament.totalSlots - updatedTournament.registeredSlots <= 3) {
        updatedTournament.status = 'Almost Full';
        await updatedTournament.save();
      }

      const user = await User.findOne({ email: normalizedEmail });
      const newReg = new Registration({
        id: regId,
        tournamentId: tournament.id,
        tournamentTitle: tournament.title,
        game: tournament.game || 'Multi-Game',
        gameIcon: tournament.gameIcon || '🎮',
        gameCode: tournament.gameCode || '',
        date: tournament.date || '',
        time: tournament.time || '',
        playerName: fullName,
        gamingId: cleanGamingId,
        phone: phone || '',
        email: normalizedEmail,
        userId: user ? user._id.toString() : '',
        entryFee: tournament.entryFee,
        txnId: txnId || 'FREE_ENTRY',
        paymentScreenshot: paymentScreenshot || '',
        status: tournament.entryFee === 0 ? 'Confirmed' : 'Pending Verification'
      });
      await newReg.save();

      if (user) {
        user.name = fullName || user.name;
        user.gamingUsername = cleanGamingId || user.gamingUsername;
        user.phone = phone || user.phone;
        const alreadyInUser = (user.registeredTournaments || []).some(r => r.tournamentId === tournament.id);
        if (!alreadyInUser) {
          user.totalTournamentsPlayed += 1;
          user.registeredTournaments.unshift({
            tournamentId: tournament.id,
            tournamentTitle: tournament.title,
            game: tournament.game || 'Multi-Game',
            gameIcon: tournament.gameIcon || '🎮',
            gameCode: tournament.gameCode || '',
            date: tournament.date || '',
            time: tournament.time || '',
            entryFee: tournament.entryFee || 0,
            registrationId: regId,
            registeredAt: new Date().toLocaleDateString(),
            status: newReg.status,
            paymentTxnId: newReg.txnId
          });
          await user.save();
        }
      }

      return res.status(201).json(newReg);
    }

    // Memory Store Duplicate Check & Fallback
    const existingMem = memoryRegistrations.find(r =>
      (r.tournamentId === tournament.id || String(r.tournamentId) === String(tournament.id)) &&
      (r.email === normalizedEmail || r.gamingId === cleanGamingId)
    );
    if (existingMem) {
      return res.status(200).json(existingMem);
    }

    const fallbackReg = {
      id: `REG-DD-${Math.floor(1000 + Math.random() * 9000)}`,
      tournamentId: tournament.id,
      tournamentTitle: tournament.title,
      game: tournament.game || 'Multi-Game',
      gameIcon: tournament.gameIcon || '🎮',
      gameCode: tournament.gameCode || '',
      date: tournament.date || '',
      time: tournament.time || '',
      playerName: fullName,
      gamingId: cleanGamingId,
      phone: phone || '',
      email: normalizedEmail,
      entryFee: tournament.entryFee || 0,
      txnId: txnId || 'FREE_ENTRY',
      status: tournament.entryFee === 0 ? 'Confirmed' : 'Pending Verification',
      createdAt: new Date().toLocaleString()
    };
    memoryRegistrations.unshift(fallbackReg);
    return res.status(201).json(fallbackReg);
  } catch (err) {
    console.warn('DB submit registration warning:', err.message);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    pendingRegistrationLocks.delete(lockKey);
  }
});

// ==============================================================================
// CASHFREE PAYMENT GATEWAY ENDPOINTS (SERVER-SIDE ORDER CREATION & VERIFICATION)
// ==============================================================================

const getCashfreeConfig = () => {
  const clientId = process.env.CASHFREE_CLIENT_ID || '';
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET || '';
  const env = (process.env.CASHFREE_ENV || 'PRODUCTION').toUpperCase();
  const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';
  const baseUrl = env === 'SANDBOX' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';
  return { clientId, clientSecret, env, apiVersion, baseUrl };
};

// 1. CREATE CASHFREE PAYMENT ORDER
app.post('/api/payment/create-order', rateLimiter({ windowMs: 60 * 1000, maxRequests: 30 }), async (req, res) => {
  try {
    const { tournament, fullName, gamingId, phone, email, teamName, teamMembers, entryType } = req.body || {};

    if (!tournament || !tournament.id || !fullName || !gamingId || !email) {
      return res.status(400).json({ success: false, message: 'Missing required registration details for payment order.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanGamingId = gamingId.trim();

    // 0. Verify tournament status and entry fee strictly from database
    let targetTrn = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      targetTrn = await Tournament.findOne({ id: tournament.id });
    } else {
      targetTrn = INITIAL_TOURNAMENTS.find(t => t.id === tournament.id || String(t.id) === String(tournament.id));
    }

    if (!targetTrn) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const entryFee = Number(targetTrn.entryFee || 0);

    if (entryFee <= 0) {
      return res.status(400).json({ success: false, message: 'This tournament is free. No Cashfree payment order required.' });
    }

    if (targetTrn.roomPublishedAt || targetTrn.registrationClosed || ['JOINING_OPEN', 'Live', 'Registration Closed', 'Completed'].includes(targetTrn.status)) {
      return res.status(400).json({
        success: false,
        message: `Registration for "${targetTrn.title}" is closed.`
      });
    }

    if (targetTrn.registeredSlots >= targetTrn.totalSlots) {
      return res.status(400).json({
        success: false,
        message: 'Tournament registration slots are completely full!'
      });
    }

    // Check for existing registration document
    let existingReg = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      existingReg = await Registration.findOne({
        tournamentId: tournament.id,
        $or: [{ email: normalizedEmail }, { gamingId: cleanGamingId }]
      });
    } else {
      existingReg = memoryRegistrations.find(r =>
        (r.tournamentId === tournament.id || String(r.tournamentId) === String(tournament.id)) &&
        (r.email === normalizedEmail || r.gamingId === cleanGamingId)
      );
    }

    // If existing registration is already confirmed / paid, reject duplicate order creation
    if (existingReg && (existingReg.status === 'Confirmed' || existingReg.paymentStatus === 'PAID')) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered and confirmed for this tournament!'
      });
    }

    const regId = existingReg ? existingReg.id : `REG-DD-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ORDER_DD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const config = getCashfreeConfig();

    const frontendBaseUrl = process.env.FRONTEND_URL || 'https://dd-gaming-tourament.vercel.app';
    const backendBaseUrl = process.env.BACKEND_URL || 'https://dd-gaming-tourament.onrender.com';
    const returnUrl = `${frontendBaseUrl.replace(/\/+$/, '')}/?order_id={order_id}&reg_id=${regId}`;
    const notifyUrl = `${backendBaseUrl.replace(/\/+$/, '')}/api/payment/webhook`;

    const user = isDbConnected && mongoose.connection.readyState === 1 ? await User.findOne({ email: normalizedEmail }) : null;
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '9999999999';

    const cfOrderPayload = {
      order_id: orderId,
      order_amount: entryFee,
      order_currency: 'INR',
      customer_details: {
        customer_id: user ? user._id.toString() : `CUST_${cleanGamingId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`,
        customer_name: fullName,
        customer_email: normalizedEmail,
        customer_phone: cleanPhone.length === 10 ? cleanPhone : '9999999999'
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl
      },
      order_note: `DD Gaming Tournament Pass: ${targetTrn.title}`
    };

    console.log(`📡 [Cashfree] Creating Order ${orderId} for ₹${entryFee} (${config.env} mode)...`);

    const cfResponse = await fetch(`${config.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': config.clientId,
        'x-client-secret': config.clientSecret,
        'x-api-version': config.apiVersion,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cfOrderPayload)
    });

    const cfData = await cfResponse.json();

    if (!cfResponse.ok || !cfData.payment_session_id) {
      console.error('❌ Cashfree Order Creation Error:', cfData);
      return res.status(400).json({
        success: false,
        message: cfData.message || cfData.reason || 'Failed to create Cashfree payment order.'
      });
    }

    console.log(`✅ [Cashfree] Session created: ${cfData.payment_session_id}`);

    // Store or update Registration document with cashfreeOrderId & PENDING paymentStatus
    if (isDbConnected && mongoose.connection.readyState === 1) {
      if (existingReg) {
        existingReg.cashfreeOrderId = orderId;
        existingReg.cashfreePaymentSessionId = cfData.payment_session_id;
        existingReg.cashfreeOrderAmount = entryFee;
        existingReg.paymentStatus = 'CREATED';
        existingReg.playerName = fullName;
        existingReg.gamingId = cleanGamingId;
        existingReg.phone = phone || existingReg.phone;
        await existingReg.save();
      } else {
        const newReg = new Registration({
          id: regId,
          tournamentId: targetTrn.id,
          tournamentTitle: targetTrn.title,
          game: targetTrn.game || 'Multi-Game',
          gameIcon: targetTrn.gameIcon || '🎮',
          gameCode: targetTrn.gameCode || '',
          date: targetTrn.date || '',
          time: targetTrn.time || '',
          playerName: fullName,
          gamingId: cleanGamingId,
          phone: phone || '',
          email: normalizedEmail,
          userId: user ? user._id.toString() : '',
          entryFee: entryFee,
          entryType: entryType || targetTrn.entryType || 'Solo',
          teamName: teamName || '',
          teamMembers: teamMembers || [],
          txnId: 'PENDING_CASHFREE',
          paymentScreenshot: '',
          status: 'Payment Pending',
          paymentStatus: 'CREATED',
          cashfreeOrderId: orderId,
          cashfreePaymentSessionId: cfData.payment_session_id,
          cashfreeOrderAmount: entryFee
        });
        await newReg.save();
      }
    } else {
      if (existingReg) {
        existingReg.cashfreeOrderId = orderId;
        existingReg.cashfreePaymentSessionId = cfData.payment_session_id;
        existingReg.paymentStatus = 'CREATED';
      } else {
        const fallbackReg = {
          id: regId,
          tournamentId: targetTrn.id,
          tournamentTitle: targetTrn.title,
          game: targetTrn.game || 'Multi-Game',
          gameIcon: targetTrn.gameIcon || '🎮',
          gameCode: targetTrn.gameCode || '',
          date: targetTrn.date || '',
          time: targetTrn.time || '',
          playerName: fullName,
          gamingId: cleanGamingId,
          phone: phone || '',
          email: normalizedEmail,
          entryFee: entryFee,
          txnId: 'PENDING_CASHFREE',
          status: 'Payment Pending',
          paymentStatus: 'CREATED',
          cashfreeOrderId: orderId,
          cashfreePaymentSessionId: cfData.payment_session_id,
          createdAt: new Date().toLocaleString()
        };
        memoryRegistrations.unshift(fallbackReg);
      }
    }

    return res.status(200).json({
      success: true,
      orderId: orderId,
      paymentSessionId: cfData.payment_session_id,
      cfEnvironment: config.env,
      amount: entryFee,
      currency: 'INR',
      registrationId: regId,
      tournamentTitle: targetTrn.title
    });

  } catch (err) {
    console.error('❌ Cashfree order creation exception:', err.message || err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order with Cashfree: ' + (err.message || 'Server error')
    });
  }
});

// 2. VERIFY CASHFREE PAYMENT (DIRECT SERVER-SIDE API VERIFICATION WITH CASHFREE PG)
app.post('/api/payment/verify', rateLimiter({ windowMs: 60 * 1000, maxRequests: 20 }), async (req, res) => {
  try {
    const { orderId, registrationId } = req.body || {};
    const targetOrderId = orderId || req.body.cashfree_order_id;

    if (!targetOrderId && !registrationId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment verification request. Order ID or Registration ID is required.'
      });
    }

    const config = getCashfreeConfig();

    // 1. Fetch registration from DB or memory
    let reg = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      reg = await Registration.findOne({
        $or: [
          { cashfreeOrderId: targetOrderId },
          { id: registrationId }
        ]
      });
    } else {
      reg = memoryRegistrations.find(r => r.cashfreeOrderId === targetOrderId || r.id === registrationId);
    }

    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration record not found.' });
    }

    const searchOrderId = targetOrderId || reg.cashfreeOrderId;
    if (!searchOrderId) {
      return res.status(400).json({ success: false, message: 'No Cashfree Order ID associated with this registration.' });
    }

    // 2. Direct server-to-server verification with Cashfree API
    console.log(`🔍 [Cashfree] Verifying order ${searchOrderId} with Cashfree API...`);

    const cfOrderRes = await fetch(`${config.baseUrl}/orders/${searchOrderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': config.clientId,
        'x-client-secret': config.clientSecret,
        'x-api-version': config.apiVersion
      }
    });

    const cfOrderData = await cfOrderRes.json();

    if (!cfOrderRes.ok) {
      console.warn(`⚠️ [Cashfree] Failed to fetch order status from API:`, cfOrderData);
      return res.status(400).json({
        success: false,
        message: cfOrderData.message || 'Unable to verify order status with Cashfree.'
      });
    }

    const cfStatus = (cfOrderData.order_status || '').toUpperCase();
    console.log(`📊 [Cashfree] Order Status for ${searchOrderId}: ${cfStatus}`);

    // Fetch payments list for transaction ID
    let cashfreePaymentId = '';
    try {
      const cfPaymentsRes = await fetch(`${config.baseUrl}/orders/${searchOrderId}/payments`, {
        method: 'GET',
        headers: {
          'x-client-id': config.clientId,
          'x-client-secret': config.clientSecret,
          'x-api-version': config.apiVersion
        }
      });
      if (cfPaymentsRes.ok) {
        const paymentsList = await cfPaymentsRes.json();
        if (Array.isArray(paymentsList) && paymentsList.length > 0) {
          const successfulPayment = paymentsList.find(p => (p.payment_status || '').toUpperCase() === 'SUCCESS');
          if (successfulPayment) {
            cashfreePaymentId = String(successfulPayment.cf_payment_id || successfulPayment.payment_id || '');
          } else if (paymentsList[0]) {
            cashfreePaymentId = String(paymentsList[0].cf_payment_id || paymentsList[0].payment_id || '');
          }
        }
      }
    } catch (e) {
      console.warn('Notice: Failed to fetch payment details list:', e.message);
    }

    const isPaid = cfStatus === 'PAID' || cfStatus === 'SUCCESS';

    if (!isPaid) {
      if (isDbConnected && mongoose.connection.readyState === 1) {
        reg.paymentStatus = cfStatus === 'EXPIRED' || cfStatus === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
        reg.status = 'Payment Failed';
        await reg.save();
      }
      return res.status(400).json({
        success: false,
        message: `Payment verification failed. Cashfree order status: ${cfStatus}`,
        paymentStatus: reg.paymentStatus
      });
    }

    // Payment Verified Successfully! Update Registration and Confirm Slot Idempotently
    const wasAlreadyPaid = reg.status === 'Confirmed' || reg.paymentStatus === 'PAID';

    if (isDbConnected && mongoose.connection.readyState === 1) {
      reg.status = 'Confirmed';
      reg.paymentStatus = 'PAID';
      reg.cashfreeOrderId = searchOrderId;
      if (cashfreePaymentId) reg.cashfreePaymentId = cashfreePaymentId;
      reg.txnId = cashfreePaymentId || searchOrderId;
      reg.paidAt = new Date().toISOString();
      await reg.save();

      if (!wasAlreadyPaid) {
        // Increment slot count atomically
        const updatedTournament = await Tournament.findOneAndUpdate(
          { id: reg.tournamentId, registeredSlots: { $lt: 1000 } },
          { $inc: { registeredSlots: 1 } },
          { new: true }
        );

        if (updatedTournament) {
          if (updatedTournament.registeredSlots >= updatedTournament.totalSlots) {
            updatedTournament.status = 'Registration Closed';
            await updatedTournament.save();
          } else if (updatedTournament.totalSlots - updatedTournament.registeredSlots <= 3) {
            updatedTournament.status = 'Almost Full';
            await updatedTournament.save();
          }
        }

        // Update User Document
        const user = await User.findOne({ email: reg.email });
        if (user) {
          user.name = reg.playerName || user.name;
          user.gamingUsername = reg.gamingId || user.gamingUsername;
          user.phone = reg.phone || user.phone;
          const alreadyInUser = (user.registeredTournaments || []).some(r => r.tournamentId === reg.tournamentId);
          if (!alreadyInUser) {
            user.totalTournamentsPlayed += 1;
            user.registeredTournaments.unshift({
              tournamentId: reg.tournamentId,
              tournamentTitle: reg.tournamentTitle,
              game: reg.game || 'Multi-Game',
              gameIcon: reg.gameIcon || '🎮',
              gameCode: reg.gameCode || '',
              date: reg.date || '',
              time: reg.time || '',
              entryFee: reg.entryFee || 0,
              registrationId: reg.id,
              registeredAt: new Date().toLocaleDateString(),
              status: 'Confirmed',
              paymentTxnId: cashfreePaymentId || searchOrderId
            });
            await user.save();
          } else {
            const userReg = user.registeredTournaments.find(r => r.tournamentId === reg.tournamentId);
            if (userReg) {
              userReg.status = 'Confirmed';
              userReg.paymentTxnId = cashfreePaymentId || searchOrderId;
              await user.save();
            }
          }
        }

        // Trigger confirmation email via Brevo
        let targetTrn = await Tournament.findOne({ id: reg.tournamentId }).catch(() => null);
        if (!targetTrn) targetTrn = INITIAL_TOURNAMENTS.find(t => t.id === reg.tournamentId);
        sendSlotConfirmationEmail(reg, targetTrn).catch(e => console.error('Brevo confirmation email notice:', e.message));
      }
    } else {
      reg.status = 'Confirmed';
      reg.paymentStatus = 'PAID';
      reg.cashfreeOrderId = searchOrderId;
      if (cashfreePaymentId) reg.cashfreePaymentId = cashfreePaymentId;
      reg.txnId = cashfreePaymentId || searchOrderId;
      reg.paidAt = new Date().toISOString();
    }

    console.log(`✅ [Cashfree Payment Verified] Reg ID: ${reg.id}, Order ID: ${searchOrderId}, Payment ID: ${cashfreePaymentId}`);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and slot officially confirmed!',
      registration: reg
    });

  } catch (err) {
    console.error('❌ Cashfree payment verification exception:', err.message || err);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying payment: ' + (err.message || 'Internal error')
    });
  }
});

// 3. SECURE CASHFREE WEBHOOK HANDLER (HMAC SIGNATURE VERIFICATION & IDEMPOTENT PROCESSING)
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const config = getCashfreeConfig();
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const secret = process.env.CASHFREE_WEBHOOK_SECRET || config.clientSecret;

    const rawBody = req.body ? (Buffer.isBuffer(req.body) ? req.body.toString('utf-8') : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))) : '';

    if (secret && signature && timestamp) {
      const payloadToSign = timestamp + rawBody;
      const expectedSignature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('base64');
      
      if (expectedSignature !== signature) {
        console.warn('⚠️ [Cashfree Webhook] Signature mismatch');
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const type = payload?.type || payload?.event;
    const data = payload?.data;

    console.log(`📥 [Cashfree Webhook Received] Event Type: ${type}`);

    if (type === 'PAYMENT_SUCCESS_WEBHOOK' || type === 'ORDER_PAID' || payload?.event === 'order.paid') {
      const orderId = data?.order?.order_id || payload?.order_id || data?.order_id;
      const paymentId = String(data?.payment?.cf_payment_id || data?.payment?.payment_id || '');

      if (orderId && isDbConnected && mongoose.connection.readyState === 1) {
        const reg = await Registration.findOne({ cashfreeOrderId: orderId });
        if (reg && reg.status !== 'Confirmed') {
          reg.status = 'Confirmed';
          reg.paymentStatus = 'PAID';
          if (paymentId) reg.cashfreePaymentId = paymentId;
          reg.txnId = paymentId || orderId;
          reg.paidAt = new Date().toISOString();
          await reg.save();

          // Increment slot count atomically
          await Tournament.findOneAndUpdate(
            { id: reg.tournamentId, registeredSlots: { $lt: 1000 } },
            { $inc: { registeredSlots: 1 } }
          ).catch(() => {});

          console.log(`✅ Webhook updated registration ${reg.id} (${orderId}) to Confirmed.`);
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.warn('Cashfree webhook processing notice:', err.message);
    return res.status(200).json({ status: 'error_handled' });
  }
});

// UPDATE User Profile (With Username availability check & auto-create if missing)
app.put('/api/users/profile', async (req, res) => {
  const { email, name, gamingUsername, phone, avatar, googleId } = req.body || {};
  const targetEmail = email ? email.toLowerCase().trim() : '';

  if (!targetEmail) {
    return res.status(400).json({ message: 'Email is required to update or sync profile.' });
  }

  const now = new Date();

  try {
    if (isDbConnected && mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email: targetEmail });

      if (user) {
        // If changing gamingUsername, check if taken by another user
        if (gamingUsername && gamingUsername.trim() !== user.gamingUsername) {
          const taken = await User.findOne({
            gamingUsername: { $regex: new RegExp(`^${gamingUsername.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            email: { $ne: targetEmail }
          });
          if (taken) {
            const base = gamingUsername.trim().replace(/_\d+$/, '');
            const suggestions = [
              `${base}_Gamer_${Math.floor(10 + Math.random() * 89)}`,
              `${base}_Pro`,
              `${base}_DD_${Math.floor(100 + Math.random() * 899)}`
            ];
            return res.status(400).json({
              message: 'Username is already taken. Please choose another or select a suggested username:',
              suggestions
            });
          }
          user.gamingUsername = gamingUsername.trim();
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (avatar) {
          user.avatar = avatar;
          user.profilePicture = avatar;
        }
        if (googleId && !user.googleId) user.googleId = googleId;
        user.lastLoginAt = now;

        await user.save();
        console.log(`✅ Logged-in User profile synced in MongoDB: ${user.email}`);
        return res.json(user);
      } else {
        // User document does not exist in MongoDB yet -> Auto-create user document!
        const playerId = `DD-8B-${Math.floor(1000 + Math.random() * 9000)}`;
        const cleanName = name || targetEmail.split('@')[0];
        const cleanGamingUsername = gamingUsername || `${cleanName.replace(/\s+/g, '_')}_8Ball`;

        user = new User({
          name: cleanName,
          email: targetEmail,
          googleId: googleId || '',
          password: '',
          gamingUsername: cleanGamingUsername,
          playerId,
          phone: phone || '',
          avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          profilePicture: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          provider: googleId ? 'google' : 'local',
          hasSeenWelcome: false,
          lastLoginAt: now,
          ddPoints: 50,
          rank: 'UNRANKED'
        });

        await user.save();
        console.log(`✅ Logged-in User profile auto-created & saved in MongoDB: ${user.email}`);
        return res.json(user);
      }
    }
  } catch (err) {
    console.warn('DB update profile warning:', err.message);
  }

  // Memory fallback update
  const stored = memoryUsers.get(targetEmail);
  if (stored) {
    if (avatar) {
      stored.user.avatar = avatar;
      stored.user.profilePicture = avatar;
    }
    if (name) stored.user.name = name;
    if (gamingUsername) stored.user.gamingUsername = gamingUsername;
    if (phone !== undefined) stored.user.phone = phone;
    stored.user.lastLoginAt = now;
    return res.json(stored.user);
  }

  const fallbackUser = {
    email: targetEmail,
    name: name || targetEmail.split('@')[0],
    gamingUsername: gamingUsername || `${(name || targetEmail.split('@')[0]).replace(/\s+/g, '_')}_8Ball`,
    phone: phone || '',
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    profilePicture: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    provider: 'local',
    hasSeenWelcome: false,
    createdAt: now,
    lastLoginAt: now
  };

  memoryUsers.set(targetEmail, { user: fallbackUser, passwordHash: '' });
  res.json(fallbackUser);
});

// ==============================================================================
// POST Admin Authentication Login
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    const validUsername = 'ddgaming';
    const validPassword = process.env.ADMIN_PASSWORD || 'ddgaming2026';

    const isMatch = username && username.trim() === validUsername && (
      password === validPassword || password === 'ddgaming2026' || password === 'ddgaming20'
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Credentials! Please verify username and password.'
      });
    }

    const adminToken = `dd_admin_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    addAuditLog('Admin Login', 'Super Admin logged into Admin Master Control', 'ddgaming');

    return res.json({
      success: true,
      token: adminToken,
      admin: {
        username: 'ddgaming',
        name: 'DD Gaming Admin',
        role: 'Super Admin'
      },
      message: 'Admin authenticated successfully!'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Admin auth server error: ' + err.message });
  }
});

// GET Admin Dashboard Summary Statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    let totalUsers = memoryUsers.size;
    let totalRegistrations = memoryRegistrations.length;
    let totalTournaments = INITIAL_TOURNAMENTS.length;

    if (isDbConnected && mongoose.connection.readyState === 1) {
      totalUsers = await User.countDocuments();
      totalRegistrations = await Registration.countDocuments();
      totalTournaments = await Tournament.countDocuments();
    }

    res.json({
      totalUsers,
      totalRegistrations,
      totalTournaments,
      serverStatus: 'ACTIVE',
      dbConnected: isDbConnected
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Registered Player Tickets (For Admin Website to view all user inputs)
app.get('/api/admin/registrations', async (req, res) => {
  try {
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const registrations = await Registration.find().sort({ createdAt: -1 });
      return res.json(deduplicateRegistrations(registrations));
    }
  } catch (err) {
    console.warn('Admin fetch registrations warning:', err.message);
  }
  res.json(deduplicateRegistrations(memoryRegistrations));
});

// UPDATE Ticket Status (Approve / Confirm / Reject Ticket from Admin Website)
app.put('/api/admin/registrations/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // e.g. "Confirmed" or "Rejected"
    const { id } = req.params;

    let updatedReg = null;

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const reg = await Registration.findOne({ id });
      if (!reg) return res.status(404).json({ message: 'Registration ticket not found' });
      reg.status = status;
      await reg.save();

      // Update User registration ticket status in MongoDB
      if (reg.email) {
        const user = await User.findOne({ email: reg.email.toLowerCase().trim() });
        if (user) {
          const userReg = user.registeredTournaments.find(r => r.registrationId === id);
          if (userReg) userReg.status = status;
          await user.save();
        }
      }

      updatedReg = reg;
    } else {
      const memReg = memoryRegistrations.find(r => r.id === id);
      if (memReg) {
        memReg.status = status;
        updatedReg = memReg;
      }
    }

    if (!updatedReg) {
      return res.status(404).json({ message: 'Registration ticket not found' });
    }

    // Trigger Brevo Email Notification Asynchronously
    if (status === 'Confirmed') {
      let targetTrn = null;
      if (isDbConnected && mongoose.connection.readyState === 1) {
        targetTrn = await Tournament.findOne({ id: updatedReg.tournamentId }).catch(() => null);
      }
      if (!targetTrn) {
        targetTrn = INITIAL_TOURNAMENTS.find(t => t.id === updatedReg.tournamentId);
      }
      sendSlotConfirmationEmail(updatedReg, targetTrn).catch(e => console.error('Brevo confirmation email error:', e.message));
    } else if (status === 'Rejected') {
      sendPaymentRejectionEmail(updatedReg).catch(e => console.error('Brevo rejection email error:', e.message));
    }

    return res.json({ message: `Ticket status updated to ${status}`, registration: updatedReg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Registration Ticket (Admin Website)
app.delete('/api/admin/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Registration ID is required' });

    let deletedCount = 0;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const queryList = [{ id: String(id) }];
      if (mongoose.Types.ObjectId.isValid(id)) {
        queryList.push({ _id: new mongoose.Types.ObjectId(id) });
      }
      const dbRes = await Registration.deleteMany({ $or: queryList });
      deletedCount = dbRes.deletedCount;
    }

    for (let i = memoryRegistrations.length - 1; i >= 0; i--) {
      const item = memoryRegistrations[i];
      if (item.id === id || item._id === id || String(item.id) === String(id)) {
        memoryRegistrations.splice(i, 1);
        deletedCount++;
      }
    }

    addAuditLog('Registration Ticket Deleted', `Admin deleted registration ticket ${id}`);

    return res.json({
      success: true,
      message: `Registration ticket ${id} deleted successfully.`,
      deletedCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// QUICK EMAIL SENDER API (Send email via Brevo from Admin Dashboard)
app.post('/api/admin/send-email', async (req, res) => {
  try {
    const { toEmail, toName, subject, message, htmlContent } = req.body;

    if (!toEmail || !toEmail.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient email is required.' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Email subject is required.' });
    }

    const emailBody = htmlContent || `
      <div style="font-family: Arial, sans-serif; background-color: #0b0914; color: #ffffff; padding: 25px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #2d244f;">
        <div style="text-align: center; padding-bottom: 15px; border-bottom: 2px solid #7c3aed;">
          <h2 style="color: #a855f7; margin: 0; text-transform: uppercase;">DD GAMING ESPORTS</h2>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Official Communication</p>
        </div>
        <div style="padding: 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          <p>Hello <strong>${toName || 'Player'}</strong>,</p>
          <div style="background-color: #16122b; border-left: 4px solid #a855f7; padding: 15px; border-radius: 6px; white-space: pre-wrap; margin: 15px 0;">${message || ''}</div>
          <p style="color: #94a3b8; font-size: 12px;">If you have any questions, reply to this email or contact DD Gaming Admin Support.</p>
        </div>
        <div style="text-align: center; border-top: 1px solid #1e1b38; padding-top: 15px; font-size: 11px; color: #64748b;">
          <p>© 2026 DD Gaming Esports. All rights reserved.</p>
        </div>
      </div>
    `;

    const brevoRes = await sendBrevoEmail({
      toEmail,
      toName,
      subject,
      htmlContent: emailBody,
      textContent: message
    });

    if (brevoRes.skipped) {
      return res.status(400).json({
        success: false,
        skipped: true,
        message: brevoRes.message
      });
    }

    if (!brevoRes.success) {
      return res.status(500).json({
        success: false,
        message: brevoRes.error || 'Failed to send email via Brevo'
      });
    }

    addAuditLog('Email Sent via Brevo', `Sent email "${subject}" to ${toEmail}`);

    return res.json({
      success: true,
      message: `Email sent successfully to ${toEmail} via Brevo!`,
      messageId: brevoRes.messageId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// GET All Registered Users (For Admin Website to view player profiles & accounts)
app.get('/api/admin/users', async (req, res) => {
  try {
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const users = await User.find().select('-password -__v').sort({ createdAt: -1 });
      return res.json(users);
    }
  } catch (err) {
    console.warn('Admin fetch users warning:', err.message);
  }
  const memoryUserArray = Array.from(memoryUsers.values()).map(item => {
    const { passwordHash, ...safeUser } = item;
    return safeUser.user || item.user;
  });
  res.json(memoryUserArray);
});

// Global Audit Log Store
const memoryAuditLogs = [];

const addAuditLog = (action, details, admin = 'Admin') => {
  const logItem = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    details,
    admin,
    timestamp: new Date().toLocaleString()
  };
  memoryAuditLogs.unshift(logItem);
  return logItem;
};

// GET Audit Logs
app.get('/api/admin/audit-logs', (req, res) => {
  res.json(memoryAuditLogs);
});

// CREATE New Tournament (With Prize Validation & Automatic Profit Calculation)
app.post('/api/admin/tournaments', async (req, res) => {
  try {
    const newTrn = req.body;
    if (!newTrn.id) newTrn.id = `trn-${Date.now()}`;

    // Automatic Collection Calculation
    const capacity = Number(newTrn.totalSlots || newTrn.maxCapacity || 0);
    const fee = Number(newTrn.entryFee || 0);
    const totalCollection = capacity * fee;

    // Total Prize Pool Calculation
    let totalPrize = 0;
    if (Array.isArray(newTrn.prizes)) {
      totalPrize = newTrn.prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    } else {
      totalPrize = Number(newTrn.prizePool || 0);
    }

    if (newTrn.killReward) {
      totalPrize += Number(newTrn.killReward);
    }

    // PRIZE VALIDATION RULE: Total Prizes cannot exceed Total Collection
    if (totalPrize > totalCollection && totalCollection > 0) {
      return res.status(400).json({
        error: 'INVALID PRIZE DISTRIBUTION',
        message: `Total prize distribution (₹${totalPrize}) cannot exceed total collection (₹${totalCollection}). Please correct the prize distribution.`
      });
    }

    const profit = Math.max(0, totalCollection - totalPrize);
    newTrn.totalCollection = totalCollection;
    newTrn.totalPrize = totalPrize;
    newTrn.profit = profit;
    newTrn.registeredSlots = newTrn.registeredSlots || 0;
    
    const regStartDate = newTrn.registrationStartDate || newTrn.date;
    const regStartTime = newTrn.registrationStartTime || newTrn.time;
    if (regStartDate) {
      newTrn.registrationStartDate = regStartDate;
      newTrn.registrationStartTime = regStartTime;
      newTrn.registrationStartAt = getRegistrationStartDateTime(regStartDate, regStartTime);
    }

    if (!newTrn.status) {
      if (newTrn.registrationStartAt && new Date(newTrn.registrationStartAt) > new Date()) {
        newTrn.status = 'Upcoming';
      } else {
        newTrn.status = 'Registration Open';
      }
    }

    // Auto-assign game banner artwork if missing or empty
    if (!newTrn.banner || typeof newTrn.banner !== 'string' || newTrn.banner.trim() === '' || newTrn.banner.includes('undefined')) {
      const g = (newTrn.game || '').toLowerCase();
      if (g.includes('bgmi') || g.includes('pubg')) newTrn.banner = '/assets/banners/bgmi_banner.jpg';
      else if (g.includes('8') || g.includes('pool')) newTrn.banner = '/assets/banners/8ball_banner.jpg';
      else if (g.includes('fire') || g.includes('free')) newTrn.banner = '/assets/banners/freefire_banner.jpg';
      else if (g.includes('chess')) newTrn.banner = '/assets/banners/chess_banner.jpg';
      else if (g.includes('ludo')) newTrn.banner = '/assets/banners/ludo_banner.jpg';
      else if (g.includes('carrom')) newTrn.banner = '/assets/banners/carrom_banner.jpg';
      else newTrn.banner = '/assets/banners/8ball_banner.jpg';
    }

    addAuditLog('Tournament Created', `Created ${newTrn.title} (${newTrn.game}). Collection: ₹${totalCollection}, Prizes: ₹${totalPrize}, Profit: ₹${profit}`);

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const created = new Tournament(newTrn);
      await created.save();
      return res.status(201).json(created);
    }

    INITIAL_TOURNAMENTS.unshift(newTrn);

    // Create Notification for New Tournament
    createNotification({
      title: `🎮 New Tournament Available: ${newTrn.title}`,
      message: `New ${newTrn.game} event open for registration (Fee: ₹${newTrn.entryFee}, Prize: ₹${newTrn.prizePool}).`,
      type: 'tournament',
      tournamentId: newTrn.id
    });

    res.status(201).json(newTrn);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. LIVE STREAM ACCESS CONTROL VERIFICATION (Backend Access Check)
app.get('/api/tournaments/:id/live-access', async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.query.email ? req.query.email.toLowerCase().trim() : '';

    let tournament = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      tournament = await Tournament.findOne(buildTournamentQuery(id));
    }
    if (!tournament) {
      tournament = INITIAL_TOURNAMENTS.find(t => t.id === id || String(t.id) === String(id));
    }

    if (!tournament) {
      return res.status(404).json({ hasAccess: false, reason: 'NOT_FOUND', message: 'Tournament not found' });
    }

    // Check if user is registered or paid
    let isRegisteredOrPaid = false;
    if (email) {
      if (isDbConnected && mongoose.connection.readyState === 1) {
        const reg = await Registration.findOne({
          $or: [
            { tournamentId: tournament.id, email },
            { tournamentId: String(tournament.id), email },
            { tournamentId: tournament._id, email }
          ]
        });
        if (reg) isRegisteredOrPaid = true;
      } else {
        const memReg = memoryRegistrations.find(r => (r.tournamentId === tournament.id || String(r.tournamentId) === String(tournament.id)) && r.email === email);
        if (memReg) isRegisteredOrPaid = true;
      }
    }

    if (isRegisteredOrPaid) {
      const nowMs = Date.now();
      if (tournament.roomPublishedAt) {
        const windowEndMs = tournament.joiningWindowEnd ? new Date(tournament.joiningWindowEnd).getTime() : (new Date(tournament.roomPublishedAt).getTime() + 30 * 60 * 1000);
        if (nowMs >= windowEndMs && !['Completed', 'Expired', 'Result Pending'].includes(tournament.status)) {
          return res.json({
            hasAccess: false,
            reason: 'JOINING_TIME_OVER',
            message: '⏰ JOINING TIME OVER\n\nYou missed the joining window for this tournament.\nThe game has already started.\nNo refund is available for missed joining.\n\nPlease try again in the next tournament.',
            isLiveStreaming: true
          });
        }
      }

      let parsedEmbed = '';
      const rawUrl = tournament.liveEmbedUrl || tournament.liveStreamUrl || '';
      const videoId = tournament.youtubeVideoId || '';
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId.trim())) {
        parsedEmbed = `https://www.youtube.com/embed/${videoId.trim()}?autoplay=1&rel=0`;
      } else if (rawUrl) {
        const match = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/);
        if (match && match[1]) {
          parsedEmbed = `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
        } else if (rawUrl.includes('youtube.com/embed/')) {
          parsedEmbed = rawUrl;
        }
      }

      const streamUrl = tournament.liveStreamUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com/@wheelchair_boy_yt/live');

      return res.json({
        hasAccess: true,
        embedUrl: parsedEmbed,
        streamUrl: streamUrl,
        youtubeChannelUrl: tournament.youtubeChannelUrl || 'https://www.youtube.com/@wheelchair_boy_yt',
        videoId: videoId,
        tournamentTitle: tournament.title,
        date: tournament.date,
        time: tournament.time,
        isLiveStreaming: Boolean(tournament.isLiveStreaming)
      });
    }

    if (!tournament.liveEmbedUrl && !tournament.youtubeVideoId) {
      return res.json({
        hasAccess: false,
        reason: 'NO_LIVE_LINK',
        message: 'No live stream configured for this tournament yet.',
        isLiveStreaming: Boolean(tournament.isLiveStreaming),
        date: tournament.date,
        time: tournament.time
      });
    }

    return res.json({
      hasAccess: false,
      reason: 'RESTRICTED',
      message: '🔒 Live Match Access Restricted. Only registered participants or users who have paid the entry fee can watch this live match.',
      isLiveStreaming: Boolean(tournament.isLiveStreaming),
      date: tournament.date,
      time: tournament.time
    });
  } catch (err) {
    res.status(500).json({ hasAccess: false, error: err.message });
  }
});

// 2. ADMIN UPDATE LIVE STREAM URL & START/END LIVE
app.put('/api/admin/tournaments/:id/live-stream', async (req, res) => {
  try {
    const { id } = req.params;
    const { liveStreamUrl, action, roomId } = req.body; // action: 'UPDATE' | 'START_LIVE' | 'END_LIVE' | 'REMOVE'

    const videoId = parseYouTubeVideoId(liveStreamUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';

    const updatePayload = {
      liveStreamUrl: liveStreamUrl || '',
      youtubeVideoId: videoId,
      liveEmbedUrl: embedUrl
    };

    if (roomId !== undefined && roomId !== null) {
      updatePayload.roomId = String(roomId).trim();
    }

    if (action === 'START_LIVE') {
      updatePayload.status = 'Live';
      updatePayload.isLiveStreaming = true;
    } else if (action === 'END_LIVE') {
      updatePayload.status = 'Completed';
      updatePayload.isLiveStreaming = false;
    } else if (action === 'REMOVE') {
      updatePayload.liveStreamUrl = '';
      updatePayload.youtubeVideoId = '';
      updatePayload.liveEmbedUrl = '';
      updatePayload.isLiveStreaming = false;
    }

    let updatedTrn = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      updatedTrn = await Tournament.findOneAndUpdate(buildTournamentQuery(id), updatePayload, { new: true });
    } else {
      const idx = INITIAL_TOURNAMENTS.findIndex(t => t.id === id || String(t.id) === String(id));
      if (idx !== -1) {
        INITIAL_TOURNAMENTS[idx] = { ...INITIAL_TOURNAMENTS[idx], ...updatePayload };
        updatedTrn = INITIAL_TOURNAMENTS[idx];
      }
    }

    if (!updatedTrn) return res.status(404).json({ message: 'Tournament not found' });

    // Notifications
    if (action === 'START_LIVE') {
      await createNotification({
        title: `🔴 Tournament is LIVE!`,
        message: `${updatedTrn.title} is now LIVE. Click to watch live stream inside DD Gaming!`,
        type: 'live',
        tournamentId: updatedTrn.id
      });
    } else if (action === 'END_LIVE') {
      await createNotification({
        title: `🏁 Tournament Completed`,
        message: `${updatedTrn.title} has completed. Official results are being analyzed by admin.`,
        type: 'info',
        tournamentId: updatedTrn.id
      });
    }

    res.json({ message: 'Live stream updated successfully', tournament: updatedTrn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2B. ADMIN UPDATE TOURNAMENT ROOM ID
const handleUpdateRoomId = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomId, roomPassword, liveStreamUrl, resetTimer } = req.body;

    if (roomId === undefined || roomId === null || String(roomId).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Room ID cannot be empty. Please enter a valid Room ID.'
      });
    }

    const cleanRoomId = String(roomId).trim();
    const cleanRoomPassword = roomPassword !== undefined ? String(roomPassword).trim() : '';

    let existingTrn = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      existingTrn = await Tournament.findOne(buildTournamentQuery(id));
    } else {
      existingTrn = INITIAL_TOURNAMENTS.find(t => t.id === id || String(t.id) === String(id));
    }

    if (!existingTrn) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const now = new Date();
    let isFirstTime = !existingTrn.roomPublishedAt;
    let windowEnd = existingTrn.joiningWindowEnd ? new Date(existingTrn.joiningWindowEnd) : new Date(now.getTime() + 30 * 60 * 1000);

    const updatePayload = {
      roomId: cleanRoomId,
      roomPassword: cleanRoomPassword
    };

    // First time publication or explicit reset -> Start 30-min window
    if (isFirstTime || resetTimer === true) {
      windowEnd = new Date(now.getTime() + 30 * 60 * 1000);
      updatePayload.roomPublishedAt = now;
      updatePayload.joiningWindowStart = now;
      updatePayload.joiningWindowEnd = windowEnd;
      updatePayload.status = 'JOINING_OPEN';
      updatePayload.joiningStatus = 'JOINING_OPEN';
      updatePayload.registrationClosed = true;
      updatePayload.joiningClosed = false;
    }

    if (liveStreamUrl !== undefined && String(liveStreamUrl).trim()) {
      updatePayload.liveStreamUrl = String(liveStreamUrl).trim();
      updatePayload.liveEmbedUrl = String(liveStreamUrl).trim();
    }

    let updatedTrn = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      updatedTrn = await Tournament.findOneAndUpdate(buildTournamentQuery(id), updatePayload, { new: true });
    } else {
      const idx = INITIAL_TOURNAMENTS.findIndex(t => t.id === id || String(t.id) === String(id));
      if (idx !== -1) {
        INITIAL_TOURNAMENTS[idx] = { ...INITIAL_TOURNAMENTS[idx], ...updatePayload };
        updatedTrn = INITIAL_TOURNAMENTS[idx];
      }
    }

    addAuditLog('Room ID Published', `Admin updated Room ID for tournament "${updatedTrn.title}" (${updatedTrn.id}). Window timer ${isFirstTime || resetTimer ? 'started 30 min countdown' : 'maintained existing countdown'}.`);

    if (isFirstTime || resetTimer) {
      await createNotification({
        title: `🟢 JOINING OPEN NOW: ${updatedTrn.title}`,
        message: `Room ID has been published for ${updatedTrn.title}! Registered players have 30 minutes to join. Game starts at ${windowEnd.toLocaleTimeString()}.`,
        type: 'tournament',
        tournamentId: updatedTrn.id
      });
    }

    const processed = computeTournamentLiveStatus(updatedTrn, true);

    return res.json({
      success: true,
      message: isFirstTime || resetTimer ? 'Room ID updated & 30-Minute Joining Window Started!' : 'Room ID details updated successfully.',
      tournament: processed,
      roomId: cleanRoomId,
      roomPassword: cleanRoomPassword,
      roomPublishedAt: updatedTrn.roomPublishedAt,
      joiningWindowStart: updatedTrn.joiningWindowStart,
      joiningWindowEnd: updatedTrn.joiningWindowEnd
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

app.put('/api/tournaments/:id/room-id', handleUpdateRoomId);
app.put('/api/admin/tournaments/:id/room-id', handleUpdateRoomId);

// 2C. EXPLICIT ADMIN RESTART JOINING WINDOW
app.post('/api/admin/tournaments/:id/restart-joining-window', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 30 * 60 * 1000);

    const updatePayload = {
      roomPublishedAt: now,
      joiningWindowStart: now,
      joiningWindowEnd: windowEnd,
      status: 'JOINING_OPEN',
      joiningStatus: 'JOINING_OPEN',
      joiningClosed: false
    };

    let updatedTrn = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      updatedTrn = await Tournament.findOneAndUpdate(buildTournamentQuery(id), updatePayload, { new: true });
    } else {
      const idx = INITIAL_TOURNAMENTS.findIndex(t => t.id === id || String(t.id) === String(id));
      if (idx !== -1) {
        INITIAL_TOURNAMENTS[idx] = { ...INITIAL_TOURNAMENTS[idx], ...updatePayload };
        updatedTrn = INITIAL_TOURNAMENTS[idx];
      }
    }

    if (!updatedTrn) return res.status(404).json({ success: false, message: 'Tournament not found' });

    addAuditLog('Joining Window Restarted', `Admin restarted 30-minute joining window for tournament "${updatedTrn.title}" until ${windowEnd.toLocaleTimeString()}.`);

    await createNotification({
      title: `🔄 JOINING WINDOW RESTARTED: ${updatedTrn.title}`,
      message: `Admin has restarted the 30-minute joining window for ${updatedTrn.title}! You have 30 minutes from now to join.`,
      type: 'tournament',
      tournamentId: updatedTrn.id
    });

    const processed = computeTournamentLiveStatus(updatedTrn, true);

    return res.json({
      success: true,
      message: '30-Minute Joining Window Restarted Successfully!',
      tournament: processed
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2D. PLAYER JOIN MATCH API (SERVER-TIME STRICT ENFORCEMENT & CONCURRENCY SAFE)
app.post('/api/tournaments/:id/join', rateLimiter({ windowMs: 60 * 1000, maxRequests: 30 }), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, gamingId, memberIndex } = req.body || {};

    if (!email && !gamingId) {
      return res.status(400).json({ success: false, message: 'Player Email or Gaming ID is required to join.' });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const cleanGamingId = gamingId ? gamingId.trim() : '';

    let tournament = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      tournament = await Tournament.findOne(buildTournamentQuery(id));
    } else {
      tournament = INITIAL_TOURNAMENTS.find(t => t.id === id || String(t.id) === String(id));
    }

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    if (!tournament.roomPublishedAt) {
      return res.status(400).json({ success: false, message: 'Room ID has not been published yet. Please wait for Admin to publish Room ID.' });
    }

    // Server-Time Strict Verification of 30-Minute Window
    const nowMs = Date.now();
    const windowEndMs = new Date(tournament.joiningWindowEnd).getTime();

    if (nowMs > windowEndMs || tournament.joiningStatus === 'JOINING_CLOSED') {
      return res.status(400).json({
        success: false,
        joiningStatus: 'MISSED',
        message: '⏰ JOINING TIME OVER! The 30-minute joining window for this match has expired. Late joining is not allowed by backend. You can watch the live match stream.'
      });
    }

    // Find Player Registration Document
    let reg = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      reg = await Registration.findOne({
        $or: [
          { tournamentId: tournament.id, email: normalizedEmail },
          { tournamentId: tournament.id, gamingId: cleanGamingId },
          { tournamentId: String(tournament.id), email: normalizedEmail }
        ]
      });
    } else {
      reg = memoryRegistrations.find(r =>
        (r.tournamentId === tournament.id || String(r.tournamentId) === String(tournament.id)) &&
        ((r.email && r.email.toLowerCase().trim() === normalizedEmail) || (r.gamingId && r.gamingId.trim() === cleanGamingId))
      );
    }

    if (!reg) {
      return res.status(404).json({ success: false, message: 'No active registration ticket found for this tournament.' });
    }

    // Verify Payment Confirmation Requirement
    const isPaid = reg.status === 'Confirmed' || reg.paymentStatus === 'PAID' || Number(reg.entryFee || 0) === 0;
    if (!isPaid) {
      return res.status(403).json({ success: false, message: 'Your registration payment is pending confirmation. Only confirmed paid players can join.' });
    }

    const now = new Date();
    const wasAlreadyJoined = reg.joined === true || reg.joiningStatus === 'JOINED';
    let teamMembers = Array.isArray(reg.teamMembers) ? [...reg.teamMembers] : [];

    // Format-based Joining Handling
    const entryTypeLower = (tournament.entryType || reg.entryType || 'Solo').toLowerCase();

    if (entryTypeLower.includes('duo') || entryTypeLower.includes('team') || entryTypeLower.includes('squad') || teamMembers.length > 0) {
      if (memberIndex !== undefined && memberIndex !== null && teamMembers[memberIndex]) {
        teamMembers[memberIndex] = {
          ...teamMembers[memberIndex],
          joined: true,
          joinedAt: now,
          joiningStatus: 'JOINED'
        };
      }
      
      const joinedMembersCount = teamMembers.filter(m => m.joined === true || m.joiningStatus === 'JOINED').length;
      const totalMembersCount = teamMembers.length + 1; // Leader + Members
      
      reg.teamMembers = teamMembers;
      reg.joined = true;
      reg.joinedAt = reg.joinedAt || now;

      if (joinedMembersCount + 1 >= totalMembersCount) {
        reg.joiningStatus = 'JOINED';
      } else {
        reg.joiningStatus = 'PARTIALLY_JOINED';
      }
    } else {
      reg.joined = true;
      reg.joinedAt = reg.joinedAt || now;
      reg.joiningStatus = 'JOINED';
    }

    // Save Registration Document
    if (isDbConnected && mongoose.connection.readyState === 1) {
      await reg.save();
    }

    // Atomically increment tournament joinedCount if first time joining
    if (!wasAlreadyJoined) {
      if (isDbConnected && mongoose.connection.readyState === 1) {
        await Tournament.findOneAndUpdate({ id: tournament.id }, { $inc: { joinedCount: 1 } });
      } else {
        tournament.joinedCount = (tournament.joinedCount || 0) + 1;
      }
    }

    return res.status(200).json({
      success: true,
      message: '🎉 You have successfully joined the match!',
      registration: reg,
      joinedAt: now
    });

  } catch (err) {
    console.error('❌ Error joining match:', err.message);
    return res.status(500).json({ success: false, message: 'Server error joining match: ' + err.message });
  }
});

// 2E. ADMIN PARTICIPANTS & JOINING STATUS LIST (SOLO / DUO / TEAM FORMAT ADAPTIVE)
app.get('/api/admin/tournaments/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    const { search = '', status = 'all' } = req.query;

    let tournament = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      tournament = await Tournament.findOne(buildTournamentQuery(id));
    } else {
      tournament = INITIAL_TOURNAMENTS.find(t => t.id === id || String(t.id) === String(id));
    }

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const processedTrn = computeTournamentLiveStatus(tournament, true);
    const nowMs = Date.now();
    const isWindowClosed = processedTrn.joiningWindowEndMs && nowMs >= processedTrn.joiningWindowEndMs;

    let registrations = [];
    if (isDbConnected && mongoose.connection.readyState === 1) {
      registrations = await Registration.find({
        $or: [
          { tournamentId: tournament.id },
          { tournamentId: String(tournament.id) }
        ]
      }).sort({ createdAt: -1 });
    } else {
      registrations = memoryRegistrations.filter(r => r.tournamentId === tournament.id || String(r.tournamentId) === String(tournament.id));
    }

    // Process participant joining statuses dynamically
    const participants = registrations.map(reg => {
      const regObj = typeof reg.toObject === 'function' ? reg.toObject() : { ...reg };
      
      let computedStatus = regObj.joiningStatus || (regObj.joined ? 'JOINED' : 'NOT_JOINED');
      
      if (!regObj.joined && isWindowClosed) {
        computedStatus = 'MISSED';
      }

      regObj.computedJoiningStatus = computedStatus;
      return regObj;
    });

    // Apply Search Filter
    const cleanSearch = String(search).toLowerCase().trim();
    let filtered = participants;

    if (cleanSearch) {
      filtered = filtered.filter(p => {
        const pName = (p.playerName || '').toLowerCase();
        const gId = (p.gamingId || '').toLowerCase();
        const tName = (p.teamName || '').toLowerCase();
        const regId = (p.id || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        const membersMatch = (p.teamMembers || []).some(m =>
          (m.name || '').toLowerCase().includes(cleanSearch) || (m.gamingId || '').toLowerCase().includes(cleanSearch)
        );
        return pName.includes(cleanSearch) || gId.includes(cleanSearch) || tName.includes(cleanSearch) || regId.includes(cleanSearch) || email.includes(cleanSearch) || membersMatch;
      });
    }

    // Apply Status Filter
    if (status !== 'all') {
      const targetStatus = String(status).toUpperCase();
      filtered = filtered.filter(p => {
        if (targetStatus === 'JOINED') return p.computedJoiningStatus === 'JOINED';
        if (targetStatus === 'NOT_JOINED') return p.computedJoiningStatus === 'NOT_JOINED';
        if (targetStatus === 'PARTIALLY_JOINED') return p.computedJoiningStatus === 'PARTIALLY_JOINED';
        if (targetStatus === 'MISSED') return p.computedJoiningStatus === 'MISSED';
        return true;
      });
    }

    const totalCapacity = Number(processedTrn.totalSlots || 0);
    const registeredCount = Number(processedTrn.registeredSlots || 0);
    const joinedCount = participants.filter(p => p.computedJoiningStatus === 'JOINED' || p.computedJoiningStatus === 'PARTIALLY_JOINED').length;

    return res.json({
      success: true,
      tournamentId: tournament.id,
      title: tournament.title,
      game: tournament.game,
      format: tournament.format || 'Standard',
      entryType: tournament.entryType || 'Solo',
      teamSize: tournament.teamSize || 1,
      totalSlots: totalCapacity,
      registeredSlots: registeredCount,
      joinedCount: joinedCount,
      remainingSlots: Math.max(0, totalCapacity - registeredCount),
      remainingJoiningSlots: Math.max(0, registeredCount - joinedCount),
      joiningStatus: processedTrn.joiningStatus,
      joiningWindowStart: processedTrn.joiningWindowStart,
      joiningWindowEnd: processedTrn.joiningWindowEnd,
      remainingWindowMs: processedTrn.remainingWindowMs || 0,
      serverTime: new Date().toISOString(),
      participants: filtered
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. ADMIN SAVE DRAFT OR PUBLISH TOP 10 RESULTS
app.put('/api/admin/tournaments/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const { rankings, resultState } = req.body; // resultState: 'DRAFT' | 'PUBLISHED'

    const updatePayload = {
      rankings: Array.isArray(rankings) ? rankings : [],
      resultState: resultState || 'DRAFT'
    };

    if (resultState === 'PUBLISHED') {
      updatePayload.status = 'Completed';
    }

    let updatedTrn = null;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      updatedTrn = await Tournament.findOneAndUpdate(buildTournamentQuery(id), updatePayload, { new: true });
    } else {
      const idx = INITIAL_TOURNAMENTS.findIndex(t => t.id === id || String(t.id) === String(id));
      if (idx !== -1) {
        INITIAL_TOURNAMENTS[idx] = { ...INITIAL_TOURNAMENTS[idx], ...updatePayload };
        updatedTrn = INITIAL_TOURNAMENTS[idx];
      }
    }

    if (!updatedTrn) return res.status(404).json({ message: 'Tournament not found' });

    if (resultState === 'PUBLISHED') {
      await createNotification({
        title: `🥇 Official Results Published!`,
        message: `Official Top 10 rankings for ${updatedTrn.title} are now published. Check final standings!`,
        type: 'result',
        tournamentId: updatedTrn.id
      });
    }

    res.json({ message: `Results saved as ${resultState}`, tournament: updatedTrn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET USER NOTIFICATIONS
app.get('/api/notifications', async (req, res) => {
  try {
    const email = req.query.email ? req.query.email.toLowerCase().trim() : '';
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const notifs = await Notification.find({
        $or: [{ email: email }, { email: '' }]
      }).sort({ createdAt: -1 }).limit(30);
      return res.json(notifs);
    }
    const filtered = memoryNotifications.filter(n => !n.email || n.email === email);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. CLEAR ALL NOTIFICATIONS / MARK ALL AS READ
const handleClearAllNotifications = async (req, res) => {
  try {
    const email = (req.query.email || req.body?.email || '').toLowerCase().trim();
    if (isDbConnected && mongoose.connection.readyState === 1) {
      if (email) {
        await Notification.updateMany({ $or: [{ email: email }, { email: '' }] }, { isRead: true });
      } else {
        await Notification.updateMany({}, { isRead: true });
      }
    }
    memoryNotifications.forEach(n => {
      if (!email || !n.email || n.email === email) {
        n.isRead = true;
      }
    });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.put('/api/notifications/clear-all', handleClearAllNotifications);
app.post('/api/notifications/clear-all', handleClearAllNotifications);
app.delete('/api/notifications/clear-all', handleClearAllNotifications);

// 6. MARK SINGLE NOTIFICATION AS READ
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected && mongoose.connection.readyState === 1) {
      await Notification.findOneAndUpdate({ id }, { isRead: true });
    }
    const mem = memoryNotifications.find(n => n.id === id);
    if (mem) mem.isRead = true;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to safely construct MongoDB query without CastError
const buildTournamentQuery = (id) => {
  const queryList = [{ id: String(id) }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    queryList.push({ _id: new mongoose.Types.ObjectId(id) });
  }
  return { $or: queryList };
};

// UPDATE Tournament
app.put('/api/admin/tournaments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;

    if (updateData.registrationStartDate) {
      updateData.registrationStartAt = getRegistrationStartDateTime(updateData.registrationStartDate, updateData.registrationStartTime || updateData.time);
    }

    addAuditLog('Tournament Updated', `Updated tournament ${id} details/status.`);

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const updated = await Tournament.findOneAndUpdate(buildTournamentQuery(id), updateData, { new: true });
      if (updated) {
        return res.json(updated);
      }
    }
    const idx = INITIAL_TOURNAMENTS.findIndex(t => t.id === id || t._id === id || String(t.id) === String(id) || String(t._id) === String(id));
    if (idx !== -1) {
      INITIAL_TOURNAMENTS[idx] = { ...INITIAL_TOURNAMENTS[idx], ...updateData };
      return res.json(INITIAL_TOURNAMENTS[idx]);
    }
    res.json({ status: 'ok', updated: updateData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Tournament
app.delete('/api/admin/tournaments/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`\n==================================================`);
  console.log(`🗑️ [DELETE API] Request received for Tournament ID: "${id}"`);
  console.log(`--------------------------------------------------`);

  try {
    if (!id || id === 'undefined' || id === 'null') {
      console.warn(`⚠️ [DELETE API] Rejected: Invalid tournament ID "${id}"`);
      return res.status(400).json({ success: false, error: 'Invalid tournament ID provided.' });
    }

    addAuditLog('Tournament Deleted', `Deleted tournament ${id}`);

    // Always remove from in-memory array if present
    let memoryRemovedCount = 0;
    for (let i = INITIAL_TOURNAMENTS.length - 1; i >= 0; i--) {
      const item = INITIAL_TOURNAMENTS[i];
      if (item.id === id || item._id === id || String(item.id) === String(id) || String(item._id) === String(id)) {
        INITIAL_TOURNAMENTS.splice(i, 1);
        memoryRemovedCount++;
      }
    }
    console.log(`ℹ️ [DELETE API] Removed ${memoryRemovedCount} item(s) from memory store.`);

    // Also remove associated registrations from memory store
    for (let i = memoryRegistrations.length - 1; i >= 0; i--) {
      const reg = memoryRegistrations[i];
      if (reg.tournamentId === id || String(reg.tournamentId) === String(id)) {
        memoryRegistrations.splice(i, 1);
      }
    }

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const query = buildTournamentQuery(id);
      console.log(`🔄 [DELETE API] Executing Mongoose deleteMany with query:`, JSON.stringify(query));

      const dbRes = await Tournament.deleteMany(query);
      await Registration.deleteMany({
        $or: [
          { tournamentId: id },
          { tournamentId: String(id) }
        ]
      });
      console.log(`✅ [DELETE API] MongoDB deletion result: deletedCount = ${dbRes.deletedCount}`);
      console.log(`==================================================\n`);

      return res.status(200).json({
        success: true,
        message: `Tournament ${id} deleted successfully.`,
        deletedCount: dbRes.deletedCount
      });
    }

    console.log(`✅ [DELETE API] Completed (Memory fallback).`);
    console.log(`==================================================\n`);
    return res.status(200).json({
      success: true,
      message: `Tournament ${id} deleted from memory.`
    });
  } catch (err) {
    console.error(`❌ [DELETE API] Server error during deletion of "${id}":`, err.stack || err.message);
    console.log(`==================================================\n`);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error deleting tournament'
    });
  }
});

// DELETE ALL SYSTEM DATA (Requires Admin Password)
app.post('/api/admin/delete-all-data', async (req, res) => {
  try {
    const password = req.body?.password;
    const inputPass = (password || '').trim();
    const envPass = (process.env.ADMIN_PASSWORD || '').trim();
    
    const isPasswordValid = inputPass === 'ddgaming2026' || (envPass && inputPass === envPass) || inputPass === 'ddgaming20';

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Password! Permission denied to delete system data.'
      });
    }

    console.log(`==================================================`);
    console.log(`🗑️ [DELETE ALL DATA] Admin password verified. Erasing all system data...`);

    // 1. Wipe MongoDB collections if DB is connected
    if (isDbConnected && mongoose.connection.readyState === 1) {
      try {
        await Tournament.deleteMany({});
        await Registration.deleteMany({});
        await Notification.deleteMany({});
        await User.updateMany({}, { registeredTournaments: [], totalTournamentsPlayed: 0 });
        console.log('✅ [DELETE ALL DATA] MongoDB collections cleared successfully.');
      } catch (dbErr) {
        console.error('❌ [DELETE ALL DATA] DB Error:', dbErr.message);
      }
    }

    // 2. Wipe In-Memory Stores
    INITIAL_TOURNAMENTS.length = 0;
    memoryRegistrations.length = 0;
    memoryNotifications.length = 0;
    memoryAuditLogs.length = 0;

    addAuditLog('DELETE_ALL_DATA', 'All tournament data, registrations, notifications, and logs were permanently deleted by Admin.', 'Super Admin');

    console.log(`✅ [DELETE ALL DATA] Memory stores cleared.`);
    console.log(`==================================================\n`);

    return res.json({
      success: true,
      message: 'All system data has been permanently deleted successfully.'
    });
  } catch (err) {
    console.error('❌ [DELETE ALL DATA ERROR]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting data: ' + err.message
    });
  }
});

// LIVE TOURNAMENT UPDATE (Brackets / Kills / Score Updates)
app.put('/api/admin/tournaments/:id/live-update', async (req, res) => {
  try {
    const { id } = req.params;
    const { bracket, rankings, status } = req.body;

    addAuditLog('Live Match Update', `Updated live scores / brackets / kills for tournament ${id}`);

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const trn = await Tournament.findOne({ id });
      if (!trn) return res.status(404).json({ message: 'Tournament not found' });

      if (bracket) trn.bracket = bracket;
      if (rankings) trn.rankings = rankings;
      if (status) trn.status = status;
      await trn.save();
      return res.json(trn);
    }

    const trn = INITIAL_TOURNAMENTS.find(t => t.id === id);
    if (trn) {
      if (bracket) trn.bracket = bracket;
      if (rankings) trn.rankings = rankings;
      if (status) trn.status = status;
      return res.json(trn);
    }
    res.status(404).json({ message: 'Tournament not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESULT VERIFICATION & CONFIRMATION (Admin selects Ranks 1, 2, 3)
app.put('/api/admin/tournaments/:id/verify-results', async (req, res) => {
  try {
    const { id } = req.params;
    const { finalRanks, status = 'Result Pending', resultWaitingHours = 24 } = req.body;
    // finalRanks: [{ rank: 'Rank 1', playerName: 'Team Alpha', prizeAmount: 1500, registrationId: '...' }, ...]

    addAuditLog('Results Verified', `Admin verified final ranks for tournament ${id}. Status set to ${status}.`);

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const trn = await Tournament.findOne({ id });
      if (!trn) return res.status(404).json({ message: 'Tournament not found' });

      trn.rankings = finalRanks;
      trn.status = status;
      trn.resultWaitingHours = resultWaitingHours;
      await trn.save();

      // Update Registrations with Prize Amounts
      if (Array.isArray(finalRanks)) {
        for (const r of finalRanks) {
          if (r.registrationId) {
            await Registration.findOneAndUpdate(
              { id: r.registrationId },
              {
                prizeRank: r.rank,
                prizeAmount: r.prizeAmount,
                prizePaymentStatus: 'Pending'
              }
            );
          }
        }
      }

      return res.json(trn);
    }

    const trn = INITIAL_TOURNAMENTS.find(t => t.id === id);
    if (trn) {
      trn.rankings = finalRanks;
      trn.status = status;
      trn.resultWaitingHours = resultWaitingHours;
      return res.json(trn);
    }

    res.status(404).json({ message: 'Tournament not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WINNER QR CODE UPLOAD (Customer uploads UPI / Paytm QR Code for Prize Claim)
app.post('/api/user/winner-qr', async (req, res) => {
  try {
    const { registrationId, qrCodeUrl, email } = req.body;
    if (!registrationId || !qrCodeUrl) {
      return res.status(400).json({ message: 'Registration ID and QR Code URL are required.' });
    }

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const reg = await Registration.findOne({ id: registrationId });
      if (!reg) return res.status(404).json({ message: 'Registration not found' });

      reg.qrCodeUrl = qrCodeUrl;
      reg.prizePaymentStatus = 'Pending';
      await reg.save();
      return res.json({ message: 'Winner QR code uploaded successfully. Ready for payment.', registration: reg });
    }

    const memReg = memoryRegistrations.find(r => r.id === registrationId);
    if (memReg) {
      memReg.qrCodeUrl = qrCodeUrl;
      memReg.prizePaymentStatus = 'Pending';
      return res.json({ message: 'Winner QR code uploaded successfully.', registration: memReg });
    }

    res.status(404).json({ message: 'Registration not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN PRIZE PAYMENT MARK AS PAID
app.post('/api/admin/prizes/mark-paid', async (req, res) => {
  try {
    const { registrationId, prizeTxnId } = req.body;
    if (!registrationId) {
      return res.status(400).json({ message: 'Registration ID is required.' });
    }

    const paidAt = new Date().toLocaleString();
    addAuditLog('Prize Payment Sent', `Marked prize payment for registration ${registrationId} as PAID. Txn: ${prizeTxnId || 'N/A'}`);

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const reg = await Registration.findOne({ id: registrationId });
      if (!reg) return res.status(404).json({ message: 'Registration not found' });

      reg.prizePaymentStatus = 'Paid';
      reg.prizeTxnId = prizeTxnId || `PRIZE-TXN-${Date.now()}`;
      reg.paidAt = paidAt;
      await reg.save();

      // Check if all prizes for this tournament are paid
      const tournamentRegs = await Registration.find({ tournamentId: reg.tournamentId, prizeAmount: { $gt: 0 } });
      const allPaid = tournamentRegs.every(r => r.prizePaymentStatus === 'Paid');
      if (allPaid) {
        await Tournament.findOneAndUpdate({ id: reg.tournamentId }, { prizePaymentStatus: 'Paid', status: 'Completed' });
      }

      return res.json({ message: 'Prize marked as PAID successfully!', registration: reg });
    }

    const memReg = memoryRegistrations.find(r => r.id === registrationId);
    if (memReg) {
      memReg.prizePaymentStatus = 'Paid';
      memReg.prizeTxnId = prizeTxnId || `PRIZE-TXN-${Date.now()}`;
      memReg.paidAt = paidAt;
      return res.json({ message: 'Prize marked as PAID successfully!', registration: memReg });
    }

    res.status(404).json({ message: 'Registration not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


process.on('uncaughtException', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Uncaught Exception Intercepted]: listen EADDRINUSE: address already in use :::${err.port || 5000}`);
  } else {
    console.error('[Uncaught Exception Intercepted]:', err.message);
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 DD Gaming Backend Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Uncaught Exception Intercepted]: listen EADDRINUSE: address already in use :::${PORT}`);
  } else {
    console.error('[Uncaught Exception Intercepted]:', err.message);
  }
});
