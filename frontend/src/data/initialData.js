export const INITIAL_TOURNAMENTS = [];

export const GAMES_LIST = [
  {
    id: '8ball',
    name: '8 Ball Pool',
    icon: '🎱',
    category: 'Cue Sports (Main Game)',
    description: 'Main focus title! 1v1 matches, ₹100 entry, 32 slots, fixed prize pools, and transparent payouts.',
    activeTournamentsCount: 3,
    status: 'Active (Main Focus)',
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
    description: 'Battlegrounds Mobile India multiplayer custom rooms & squad tournaments launching in expansion phase.',
    activeTournamentsCount: 0,
    status: 'Expansion Phase',
    bgGradient: 'from-slate-900 to-slate-950',
    borderColor: 'border-slate-800',
    glowColor: '',
    accentColor: 'text-amber-400',
    popular: true
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    icon: '🔥',
    category: 'Battle Royale',
    description: 'Free Fire survivor squad duels & creator events launching in expansion phase.',
    activeTournamentsCount: 0,
    status: 'Expansion Phase',
    bgGradient: 'from-slate-900 to-slate-950',
    borderColor: 'border-slate-800',
    glowColor: '',
    accentColor: 'text-rose-400',
    popular: true
  },
  {
    id: 'chess',
    name: 'Chess',
    icon: '♟',
    category: 'Strategy',
    description: '1v1 blitz chess competitions & strategic tournaments launching in expansion phase.',
    activeTournamentsCount: 0,
    status: 'Expansion Phase',
    bgGradient: 'from-slate-900 to-slate-950',
    borderColor: 'border-slate-800',
    glowColor: '',
    accentColor: 'text-cyan-400',
    popular: false
  },
  {
    id: 'ludo',
    name: 'Ludo King',
    icon: '🎲',
    category: 'Casual Board',
    description: 'Multiplayer board game competitions launching in expansion phase.',
    activeTournamentsCount: 0,
    status: 'Expansion Phase',
    bgGradient: 'from-slate-900 to-slate-950',
    borderColor: 'border-slate-800',
    glowColor: '',
    accentColor: 'text-emerald-400',
    popular: false
  },
  {
    id: 'carrom',
    name: 'Carrom Pool',
    icon: '🥏',
    category: 'Board Sports',
    description: 'Precision carrom board 1v1 duels launching in expansion phase.',
    activeTournamentsCount: 0,
    status: 'Expansion Phase',
    bgGradient: 'from-slate-900 to-slate-950',
    borderColor: 'border-slate-800',
    glowColor: '',
    accentColor: 'text-blue-400',
    popular: false
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
