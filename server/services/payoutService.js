import mongoose from 'mongoose';
import { Payout } from '../models/Payout.js';
import { PayoutAudit } from '../models/PayoutAudit.js';
import { Vendor } from '../models/Vendor.js';
import { recordAudit } from '../utils/audit.js';
import { HttpError } from '../utils/HttpError.js';

function formatPayoutLean(p) {
  if (!p) {
    return p;
  }
  const vendor = p.vendor_id;
  return {
    ...p,
    vendor: vendor && typeof vendor === 'object' && vendor.name !== undefined ? vendor : undefined,
    vendor_id: vendor && vendor._id ? vendor._id : p.vendor_id,
  };
}

async function getPayoutDocumentById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'Invalid payout id');
  }
  const payout = await Payout.findById(id);
  if (!payout) {
    throw new HttpError(404, 'Payout not found');
  }
  return payout;
}

export async function listPayouts(query) {
  const { status, vendor_id } = query;
  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id)) {
    filter.vendor_id = vendor_id;
  }
  const payouts = await Payout.find(filter).sort({ createdAt: -1 }).populate('vendor_id').lean();
  const formatted = payouts.map((p) => ({
    ...p,
    vendor: p.vendor_id,
    vendor_id: p.vendor_id?._id ?? p.vendor_id,
  }));
  return { payouts: formatted };
}

export async function createPayout(payload, userId) {
  const { vendor_id, amount, mode, note } = payload;
  if (!mongoose.Types.ObjectId.isValid(vendor_id)) {
    throw new HttpError(400, 'Invalid vendor_id');
  }
  const vendor = await Vendor.findById(vendor_id);
  if (!vendor) {
    throw new HttpError(404, 'Vendor not found');
  }
  const payout = await Payout.create({
    vendor_id,
    amount,
    mode,
    note: note ?? '',
    status: 'Draft',
    decision_reason: '',
  });
  await recordAudit({
    payoutId: payout._id,
    action: 'CREATED',
    performedBy: userId,
    metadata: { amount, mode },
  });
  const populated = await Payout.findById(payout._id).populate('vendor_id').lean();
  return { payout: formatPayoutLean(populated) };
}

export async function getPayoutDetail(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'Invalid payout id');
  }
  const payout = await Payout.findById(id).populate('vendor_id').lean();
  if (!payout) {
    throw new HttpError(404, 'Payout not found');
  }
  const audits = await PayoutAudit.find({ payout_id: payout._id })
    .sort({ performed_at: -1 })
    .populate('performed_by', 'email role')
    .lean();
  const auditTrail = audits.map((a) => ({
    id: a._id.toString(),
    action: a.action,
    performed_at: a.performed_at,
    performed_by: a.performed_by
      ? { id: a.performed_by._id.toString(), email: a.performed_by.email, role: a.performed_by.role }
      : null,
    metadata: a.metadata || {},
  }));
  return { payout: formatPayoutLean(payout), auditTrail };
}

export async function submitPayout(id, userId) {
  const payout = await getPayoutDocumentById(id);
  if (payout.status !== 'Draft') {
    throw new HttpError(400, 'Only Draft payouts can be submitted');
  }
  payout.status = 'Submitted';
  await payout.save();
  await recordAudit({
    payoutId: payout._id,
    action: 'SUBMITTED',
    performedBy: userId,
  });
  const populated = await Payout.findById(payout._id).populate('vendor_id').lean();
  return { payout: formatPayoutLean(populated) };
}

export async function approvePayout(id, userId) {
  const payout = await getPayoutDocumentById(id);
  if (payout.status !== 'Submitted') {
    throw new HttpError(400, 'Only Submitted payouts can be approved');
  }
  payout.status = 'Approved';
  payout.decision_reason = '';
  await payout.save();
  await recordAudit({
    payoutId: payout._id,
    action: 'APPROVED',
    performedBy: userId,
  });
  const populated = await Payout.findById(payout._id).populate('vendor_id').lean();
  return { payout: formatPayoutLean(populated) };
}

export async function rejectPayout(id, reason, userId) {
  const payout = await getPayoutDocumentById(id);
  if (payout.status !== 'Submitted') {
    throw new HttpError(400, 'Only Submitted payouts can be rejected');
  }
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    throw new HttpError(400, 'Rejection reason is required');
  }
  payout.status = 'Rejected';
  payout.decision_reason = reason.trim();
  await payout.save();
  await recordAudit({
    payoutId: payout._id,
    action: 'REJECTED',
    performedBy: userId,
    metadata: { reason: reason.trim() },
  });
  const populated = await Payout.findById(payout._id).populate('vendor_id').lean();
  return { payout: formatPayoutLean(populated) };
}
