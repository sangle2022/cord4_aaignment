import { PayoutAudit } from '../models/PayoutAudit.js';

export async function recordAudit({ payoutId, action, performedBy, metadata = {} }) {
  await PayoutAudit.create({
    payout_id: payoutId,
    action,
    performed_by: performedBy,
    performed_at: new Date(),
    metadata,
  });
}
