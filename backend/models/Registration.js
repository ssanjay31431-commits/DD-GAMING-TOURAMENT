import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tournamentId: { type: String, required: true },
  tournamentTitle: { type: String, required: true },
  playerName: { type: String, required: true },
  gamingId: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, required: true },
  userId: { type: String, default: '', index: true },
  entryFee: { type: Number, default: 0 },
  entryType: { type: String, default: 'Solo' },
  teamName: { type: String, default: '' },
  captainName: { type: String, default: '' },
  teamMembers: { type: Array, default: [] },
  slotNumber: { type: Number, default: 0 },
  txnId: { type: String, default: 'FREE_ENTRY' },
  paymentScreenshot: { type: String, default: '' },
  status: { type: String, default: 'Pending Verification' },
  qrCodeUrl: { type: String, default: '' },
  prizeAmount: { type: Number, default: 0 },
  prizeRank: { type: String, default: '' },
  prizePaymentStatus: { type: String, default: 'Unclaimed' }, // 'Unclaimed' | 'Pending' | 'Paid'
  prizeTxnId: { type: String, default: '' },
  paidAt: { type: String, default: '' },
  kills: { type: Number, default: 0 },
  placement: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toLocaleString() }
}, { timestamps: true });

export default mongoose.model('Registration', registrationSchema);
