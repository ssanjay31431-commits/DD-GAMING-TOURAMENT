const getTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const INITIAL_TOURNAMENTS = [
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

export const GAMES_LIST = [
  {
    id: '8ball',
    name: '8 Ball Pool',
    icon: '🎱',
    category: 'Cue Sports',
    description: '1v1 Miniclip cue matches, ₹100 entry, 32 slots, fixed prize pools, and transparent payouts.',
    activeTournamentsCount: 3,
    status: 'Active Esports Title',
    bgGradient: 'from-purple-900/60 to-indigo-950/80',
    borderColor: 'border-purple-500/50',
    glowColor: 'neon-glow-purple',
    accentColor: 'text-purple-400',
    popular: true
  },
  {
    id: 'bgmi',
    name: 'BGMI',
    icon: '🎯',
    category: 'Battle Royale',
    description: 'Battlegrounds Mobile India multiplayer custom rooms, squad tournaments & daily cash contests.',
    activeTournamentsCount: 1,
    status: 'Active Esports Title',
    bgGradient: 'from-amber-900/60 to-slate-950/80',
    borderColor: 'border-amber-500/50',
    glowColor: 'neon-glow-amber',
    accentColor: 'text-amber-400',
    popular: true
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    icon: '🔥',
    category: 'Battle Royale',
    description: 'Free Fire survivor squad duels, duo clashes & daily cash prize tournaments.',
    activeTournamentsCount: 1,
    status: 'Active Esports Title',
    bgGradient: 'from-rose-900/60 to-slate-950/80',
    borderColor: 'border-rose-500/50',
    glowColor: 'neon-glow-rose',
    accentColor: 'text-rose-400',
    popular: true
  },
  {
    id: 'chess',
    name: 'Chess',
    icon: '♟',
    category: 'Strategy',
    description: '1v1 blitz chess competitions & strategic daily prize pool matches.',
    activeTournamentsCount: 1,
    status: 'Active Esports Title',
    bgGradient: 'from-cyan-900/60 to-slate-950/80',
    borderColor: 'border-cyan-500/50',
    glowColor: 'neon-glow-cyan',
    accentColor: 'text-cyan-400',
    popular: true
  },
  {
    id: 'ludo',
    name: 'Ludo King',
    icon: '🎲',
    category: 'Casual Board',
    description: 'Multiplayer 4-player board game elimination matches & daily cash pool tournaments.',
    activeTournamentsCount: 1,
    status: 'Active Esports Title',
    bgGradient: 'from-emerald-900/60 to-slate-950/80',
    borderColor: 'border-emerald-500/50',
    glowColor: 'neon-glow-emerald',
    accentColor: 'text-emerald-400',
    popular: true
  },
  {
    id: 'carrom',
    name: 'Carrom Pool',
    icon: '🥏',
    category: 'Board Sports',
    description: 'Carrom Pool 1v1 board striker series & fast-paced cash matches.',
    activeTournamentsCount: 1,
    status: 'Active Esports Title',
    bgGradient: 'from-teal-900/60 to-slate-950/80',
    borderColor: 'border-teal-500/50',
    glowColor: 'neon-glow-teal',
    accentColor: 'text-teal-400',
    popular: true
  }
];

export const INITIAL_LEADERBOARD = {
  weekly: [],
  monthly: [],
  allTime: []
};

export const INITIAL_WINNERS = [];

export const INITIAL_FAQS = [
  {
    question: 'How do 8 Ball Pool 1v1 tournaments work?',
    answer: 'Browse active tournaments, select an 8 Ball Pool contest (e.g. ₹100 entry, 32 fixed slots), and click "Join Tournament". Enter your 8 Ball Pool Unique ID, submit payment verification, and receive your confirmed registration slot.'
  },
  {
    question: 'When is my slot confirmed?',
    answer: 'According to our operational rules, a player\'s slot is officially confirmed only after payment verification (or free-entry confirmation). Enter your 12-digit UPI / UTR Transaction ID to verify.'
  },
  {
    question: 'What are the refund and cancellation policies?',
    answer: 'If a tournament is cancelled by DD Gaming due to unforeseen game updates or technical delays, 100% of the entry fee is refunded to the player\'s UPI account within 24 hours.'
  },
  {
    question: 'How is dispute handling managed?',
    answer: 'Players must upload unedited end-of-match victory screenshots within 10 minutes. In case of disconnection or score disputes, Admin inspects match logs and screenshots to issue a fair decision.'
  },
  {
    question: 'Where are winners and highlights published?',
    answer: 'Official tournament winners, match highlights, and seasonal leaderboard rankings are published on our official Instagram and YouTube channels!'
  }
];

// Clean default player profile (No sample names or fake placeholders)
export const DEFAULT_USER_PROFILE = {
  name: 'Player Account',
  gamingUsername: '',
  playerId: 'DD-PLAYER',
  email: '',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  rank: 'UNRANKED',
  ddPoints: 0,
  totalTournamentsPlayed: 0,
  wins: 0,
  losses: 0,
  totalWinnings: 0,
  upiId: '',
  registeredTournaments: []
};
