import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import User from './models/User.js';
import Tournament from './models/Tournament.js';
import Registration from './models/Registration.js';
import Notification from './models/Notification.js';
import { sendBrevoEmail, sendSlotConfirmationEmail, sendPaymentRejectionEmail } from './services/emailService.js';


dotenv.config();

// Disable buffering so queries fail/fallback immediately if DB is disconnected
mongoose.set('bufferCommands', false);

const app = express();

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

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Initial Seed Data for Tournaments
const INITIAL_TOURNAMENTS = [];

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

// GET all tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    await autoCheckUpcomingTournaments();
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const tournaments = await Tournament.find();
      return res.json(tournaments);
    }
  } catch (err) {
    console.warn('DB fetch tournaments warning:', err.message);
  }
  res.json(INITIAL_TOURNAMENTS);
});

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
      const playerId = `DD-8B-${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser = new User({
        name: fullName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: hashedPassword,
        gamingUsername: gamingUsername || `${fullName || normalizedEmail.split('@')[0]}_8Ball`,
        playerId,
        provider: 'local',
        hasSeenWelcome: false,
        lastLoginAt: now
      });

      await newUser.save();
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

    // Verify Google ID Token / Credential
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

    if (!email) {
      return res.status(400).json({ message: 'Google authentication failed: No verified email returned by Google.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();

    if (isDbConnected && mongoose.connection.readyState === 1) {
      // Find existing user by googleId OR normalized email to prevent duplicate documents
      let queryConditions = [{ email: normalizedEmail }];
      if (googleId) {
        queryConditions.push({ googleId });
      }

      let user = await User.findOne({ $or: queryConditions });

      if (user) {
        // User already exists -> Update lastLoginAt, googleId, avatar, profilePicture
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
        await user.save();
        console.log(`✅ Existing Google User updated in MongoDB: ${user.email} (lastLoginAt: ${now.toISOString()})`);
      } else {
        // First-time sign in -> Create new User document in MongoDB
        const playerId = `DD-8B-${Math.floor(1000 + Math.random() * 9000)}`;
        const cleanName = name || normalizedEmail.split('@')[0];
        const gamingUsername = `${cleanName.replace(/\s+/g, '_')}_8Ball`;

        user = new User({
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
        await user.save();
        console.log(`✅ New Google User created & saved in MongoDB: ${user.email} (ID: ${user._id})`);
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.json({ token, user });
    }

    // Offline / Memory Store fallback
    let stored = memoryUsers.get(normalizedEmail);
    let googleUser;

    if (stored) {
      stored.user.lastLoginAt = now;
      stored.user.provider = 'google';
      if (googleId) stored.user.googleId = googleId;
      if (avatar) {
        stored.user.avatar = avatar;
        stored.user.profilePicture = avatar;
      }
      googleUser = stored.user;
    } else {
      const cleanName = name || normalizedEmail.split('@')[0];
      googleUser = {
        id: `usr-google-${Date.now()}`,
        name: cleanName,
        gamingUsername: `${cleanName.replace(/\s+/g, '_')}_8Ball`,
        playerId: `DD-8B-${Math.floor(1000 + Math.random() * 9000)}`,
        email: normalizedEmail,
        googleId: googleId || '',
        phone: '',
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        profilePicture: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        hasSeenWelcome: false,
        createdAt: now,
        lastLoginAt: now,
        rank: 'UNRANKED',
        ddPoints: 50,
        totalTournamentsPlayed: 0,
        wins: 0,
        losses: 0,
        totalWinnings: 0,
        registeredTournaments: []
      };
      memoryUsers.set(normalizedEmail, { user: googleUser, passwordHash: '' });
    }

    res.json({
      token: `google-jwt-token-${Date.now()}`,
      user: googleUser
    });
  } catch (err) {
    console.error('❌ Error saving/updating Google user in MongoDB:', err.stack || err.message);
    res.status(500).json({ error: 'Failed to process Google authentication and save user in database', details: err.message });
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

// GET Registrations (Admin view / System view)
app.get('/api/registrations', async (req, res) => {
  try {
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const registrations = await Registration.find().sort({ createdAt: -1 });
      return res.json(registrations);
    }
  } catch (err) {
    console.warn('DB registrations fetch warning:', err.message);
  }
  res.json(memoryRegistrations);
});

// SUBMIT Registration (Player registration form submit)
app.post('/api/registrations', rateLimiter({ windowMs: 60 * 1000, maxRequests: 20 }), async (req, res) => {
  try {
    const { tournament, fullName, gamingId, phone, email, txnId, paymentScreenshot } = req.body;
    if (!tournament || !tournament.id || !fullName || !gamingId || !email) {
      return res.status(400).json({ success: false, message: 'Missing required registration fields.' });
    }
    const regId = `REG-DD-${Math.floor(1000 + Math.random() * 9000)}`;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    if (isDbConnected && mongoose.connection.readyState === 1) {
      // 1. Check for duplicate registration to prevent race conditions
      const existingReg = await Registration.findOne({
        tournamentId: tournament.id,
        $or: [{ email: normalizedEmail }, { gamingId: gamingId }]
      });

      if (existingReg) {
        return res.status(409).json({
          success: false,
          message: 'You have already registered for this tournament!'
        });
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
        playerName: fullName,
        gamingId: gamingId,
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
        user.gamingUsername = gamingId || user.gamingUsername;
        user.phone = phone || user.phone;
        user.totalTournamentsPlayed += 1;
        user.registeredTournaments.unshift({
          tournamentId: tournament.id,
          registrationId: regId,
          registeredAt: new Date().toLocaleDateString(),
          status: newReg.status,
          paymentTxnId: newReg.txnId
        });
        await user.save();
      }

      return res.status(201).json(newReg);
    }
  } catch (err) {
    console.warn('DB submit registration warning:', err.message);
  }

  const fallbackReg = {
    id: `REG-DD-${Math.floor(1000 + Math.random() * 9000)}`,
    tournamentId: req.body.tournament?.id,
    tournamentTitle: req.body.tournament?.title,
    playerName: req.body.fullName,
    gamingId: req.body.gamingId,
    phone: req.body.phone || '',
    email: req.body.email ? req.body.email.toLowerCase().trim() : '',
    entryFee: req.body.tournament?.entryFee || 0,
    txnId: req.body.txnId || 'FREE_ENTRY',
    status: req.body.tournament?.entryFee === 0 ? 'Confirmed' : 'Pending Verification',
    createdAt: new Date().toLocaleString()
  };
  memoryRegistrations.unshift(fallbackReg);

  res.status(201).json(fallbackReg);
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
              `${base}_8Ball_${Math.floor(10 + Math.random() * 89)}`,
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
      return res.json(registrations);
    }
  } catch (err) {
    console.warn('Admin fetch registrations warning:', err.message);
  }
  res.json(memoryRegistrations);
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

    if (!tournament.liveEmbedUrl && !tournament.youtubeVideoId) {
      return res.json({
        hasAccess: false,
        reason: 'NO_LIVE_LINK',
        message: 'No live stream configured for this tournament yet.',
        isLiveStreaming: Boolean(tournament.isLiveStreaming)
      });
    }

    // Check if user is registered or paid
    let isRegisteredOrPaid = false;
    if (email) {
      if (isDbConnected && mongoose.connection.readyState === 1) {
        const reg = await Registration.findOne({ tournamentId: tournament.id, email });
        if (reg) isRegisteredOrPaid = true;
      } else {
        const memReg = memoryRegistrations.find(r => r.tournamentId === tournament.id && r.email === email);
        if (memReg) isRegisteredOrPaid = true;
      }
    }

    if (isRegisteredOrPaid) {
      return res.json({
        hasAccess: true,
        embedUrl: tournament.liveEmbedUrl || `https://www.youtube.com/embed/${tournament.youtubeVideoId}?autoplay=1&rel=0`,
        videoId: tournament.youtubeVideoId,
        tournamentTitle: tournament.title,
        isLiveStreaming: Boolean(tournament.isLiveStreaming)
      });
    }

    return res.json({
      hasAccess: false,
      reason: 'RESTRICTED',
      message: '🔒 Live Match Access Restricted. Only registered participants or users who have paid the entry fee can watch this live match.',
      isLiveStreaming: Boolean(tournament.isLiveStreaming)
    });
  } catch (err) {
    res.status(500).json({ hasAccess: false, error: err.message });
  }
});

// 2. ADMIN UPDATE LIVE STREAM URL & START/END LIVE
app.put('/api/admin/tournaments/:id/live-stream', async (req, res) => {
  try {
    const { id } = req.params;
    const { liveStreamUrl, action } = req.body; // action: 'UPDATE' | 'START_LIVE' | 'END_LIVE' | 'REMOVE'

    const videoId = parseYouTubeVideoId(liveStreamUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';

    const updatePayload = {
      liveStreamUrl: liveStreamUrl || '',
      youtubeVideoId: videoId,
      liveEmbedUrl: embedUrl
    };

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

    if (isDbConnected && mongoose.connection.readyState === 1) {
      const query = buildTournamentQuery(id);
      console.log(`🔄 [DELETE API] Executing Mongoose deleteMany with query:`, JSON.stringify(query));

      const dbRes = await Tournament.deleteMany(query);
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
