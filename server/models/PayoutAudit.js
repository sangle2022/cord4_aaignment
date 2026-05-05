import mongoose from 'mongoose';

export const AUDIT_ACTIONS = ['CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED'];

const payoutAuditSchema = new mongoose.Schema(
  {
    payout_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout', required: true },
    action: { type: String, required: true, enum: AUDIT_ACTIONS },
    performed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    performed_at: { type: Date, required: true, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: false }
);

payoutAuditSchema.index({ payout_id: 1, performed_at: -1 });

export const PayoutAudit =
  mongoose.models.PayoutAudit || mongoose.model('PayoutAudit', payoutAuditSchema);
