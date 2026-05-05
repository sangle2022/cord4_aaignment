import mongoose from 'mongoose';

export const PAYOUT_MODES = ['UPI', 'IMPS', 'NEFT'];
export const PAYOUT_STATUSES = ['Draft', 'Submitted', 'Approved', 'Rejected'];

const payoutSchema = new mongoose.Schema(
  {
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    amount: { type: Number, required: true, min: 0 },
    mode: { type: String, required: true, enum: PAYOUT_MODES },
    note: { type: String, trim: true, default: '' },
    status: { type: String, required: true, enum: PAYOUT_STATUSES, default: 'Draft' },
    decision_reason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

payoutSchema.index({ vendor_id: 1, status: 1 });

export const Payout = mongoose.models.Payout || mongoose.model('Payout', payoutSchema);
