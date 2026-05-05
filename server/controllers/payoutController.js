import mongoose from 'mongoose';
import { Payout } from '../models/Payout.js';
import { PayoutAudit } from '../models/PayoutAudit.js';
import { Vendor } from '../models/Vendor.js';
import { recordAudit } from '../utils/audit.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

async function loadPayoutOr404(id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    sendError(res, 'Invalid payout id', 400);
    return null;
  }
  const payout = await Payout.findById(id);
  if (!payout) {
    sendError(res, 'Payout not found', 404);
    return null;
  }
  return payout;
}

export async function listPayouts(req, res) {
  const { status, vendor_id } = req.query;
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
  return sendSuccess(res, { payouts: formatted });
}

export async function createPayout(req, res) {
  const { vendor_id, amount, mode, note } = req.body;
  if (!mongoose.Types.ObjectId.isValid(vendor_id)) {
    return sendError(res, 'Invalid vendor_id', 400);
  }
  const vendor = await Vendor.findById(vendor_id);
  if (!vendor) {
    return sendError(res, 'Vendor not found', 404);
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
    performedBy: req.user.id,
    metadata: { amount, mode },
  });
  const populated = await Payout.findById(payout._id).populate('vendor_id').lean();
  return sendSuccess(res, { payout: formatPayoutLean(populated) }, 201);
}

export async function getPayoutById(req, res) {
  const payout = await Payout.findById(req.params.id).populate('vendor_id').lean();
  if (!payout) {
    return sendError(res, 'Payout not found', 404);
  }
  const audits = await PayoutAudit.find({ payout_id: payout._id }).sort({ performed_at: -1 }).populate('performed_by', 'email role').lean();
  const auditTrail = audits.map((a) => ({
    id: a._id.toString(),
    action: a.action,
    performed_at: a.performed_at,
    performed_by: a.performed_by
      ? { id: a.performed_by._id.toString(), email: a.performed_by.email, role: a.performed_by.role }
      : null,
    metadata: a.metadata || {},
  }));
  return sendSuccess(res, { payout: formatPayoutLean(payout), auditTrail });
}

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

export async function submitPayout(req, res) {
  const payout = await loadPayoutOr404(req.params.id, res);
  if (!payout) {
    return undefined;
  }
  if (payout.status !== 'Draft') {
    return sendError(res, 'Only Draft payouts can be submitted', 400);
  }
  payout.status = 'Submitted';
  await payout.save();
  await recordAudit({
    payoutId: payout._id,
    action: 'SUBMITTED',
    performedBy: req.user.id,
  });
  const populated = await Payout.findById(payout._id).populate('vendor_id').lean();
  return sendSuccess(res, { payout: formatPayoutLean(populated) });
}

export async function approvePayout(req, res) {
  const payout = await loadPayoutOr404(req.params.id, res);
  if (!payout) {
    return undefined;
  }
  if (payout.status !== 'Submitted') {
    return sendError(res, 'Only Submitted payouts can be approved', 400);
  }
  payout.status = 'Approved';
  payout.decision_reason = '';
  await payout.save();
  await recordAudit({
    payoutId: payout._id,
    action: 'APPROVED',
    performedBy: req.user.id,
  });
  const populated = await Payout.findById(payout._id).populate('vendor_id').lean();
  return sendSuccess(res, { payout: formatPayoutLean(populated) });
}

export async function rejectPayout(req, res) {
  const { reason } = req.body;
  const payout = await loadPayoutOr404(req.params.id, res);
  if (!payout) {
    return undefined;
  }
  if (payout.status !== 'Submitted') {
    return sendError(res, 'Only Submitted payouts can be rejected', 400);
  }
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return sendError(res, 'Rejection reason is required', 400);
  }
  payout.status = 'Rejected';
  payout.decision_reason = reason.trim();
  await payout.save();
  await recordAudit({
    payoutId: payout._id,
    action: 'REJECTED',
    performedBy: req.user.id,
    metadata: { reason: reason.trim() },
  });
  const populated = await Payout.findById(payout._id).populate('vendor_id').lean();
  return sendSuccess(res, { payout: formatPayoutLean(populated) });
}
