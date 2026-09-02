import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  googleId: { type: String, default: '', index: true },
  password: { type: String, default: '' },
  gamingUsername: { type: String, default: '' },
  playerId: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  profilePicture: { type: String, default: '' },
  provider: { type: String, default: 'local' }, // 'google' | 'local'
  hasSeenWelcome: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: Date.now },
  rank: { type: String, default: 'UNRANKED' },
  ddPoints: { type: Number, default: 0 },
  totalTournamentsPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  totalWinnings: { type: Number, default: 0 },
  registeredTournaments: [
    {
      tournamentId: { type: String },
      registrationId: { type: String },
      registeredAt: { type: String },
      status: { type: String },
      paymentTxnId: { type: String }
    }
  ]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
