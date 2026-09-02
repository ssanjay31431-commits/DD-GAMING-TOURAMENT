import mongoose from 'mongoose';

const prizeSchema = new mongoose.Schema({
  rank: String,
  amount: Number
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  game: { type: String, required: true },
  gameCode: { type: String, required: true },
  gameIcon: { type: String, default: '🎱' },
  banner: { type: String, default: '' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  entryFee: { type: Number, required: true },
  totalSlots: { type: Number, required: true },
  registeredSlots: { type: Number, default: 0 },
  prizePool: { type: Number, required: true },
  status: { type: String, default: 'Registration Open' }, // 'Upcoming' | 'Registration Open' | 'Almost Full' | 'Registration Closed' | 'Live' | 'Result Pending' | 'Completed'
  registrationStartDate: { type: String, default: '' },
  registrationStartTime: { type: String, default: '' },
  registrationStartAt: { type: Date, default: null },
  format: { type: String, default: '1v1 Knockout' },
  mode: { type: String, default: 'Standard' },
  entryType: { type: String, default: 'Solo' }, // 'Solo' | 'Duo' | 'Team'
  teamSize: { type: Number, default: 1 },
  totalCollection: { type: Number, default: 0 },
  totalPrize: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  targetProfit: { type: Number, default: 0 },
  killReward: { type: Number, default: 0 },
  matchCount: { type: Number, default: 1 },
  resultWaitingHours: { type: Number, default: 24 },
  prizePaymentStatus: { type: String, default: 'Pending' }, // 'Pending' | 'Ready' | 'Paid'
  liveStreamUrl: { type: String, default: '' },
  youtubeVideoId: { type: String, default: '' },
  liveEmbedUrl: { type: String, default: '' },
  isLiveStreaming: { type: Boolean, default: false },
  resultState: { type: String, default: 'NOT_READY' }, // 'NOT_READY' | 'DRAFT' | 'PUBLISHED'
  bracket: { type: Array, default: [] },
  rankings: { type: Array, default: [] },
  auditLogs: { type: Array, default: [] },
  isFeatured: { type: Boolean, default: false },
  is8BallSpecial: { type: Boolean, default: false },
  prizes: [prizeSchema],
  rules: [String],
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Tournament', tournamentSchema);
