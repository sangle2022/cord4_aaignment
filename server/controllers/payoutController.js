import * as payoutService from '../services/payoutService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listPayouts = asyncHandler(async (req, res) => {
  const data = await payoutService.listPayouts(req.query);
  return sendSuccess(res, data);
});

export const createPayout = asyncHandler(async (req, res) => {
  const data = await payoutService.createPayout(req.body, req.user.id);
  return sendSuccess(res, data, 201);
});

export const getPayoutById = asyncHandler(async (req, res) => {
  const data = await payoutService.getPayoutDetail(req.params.id);
  return sendSuccess(res, data);
});

export const submitPayout = asyncHandler(async (req, res) => {
  const data = await payoutService.submitPayout(req.params.id, req.user.id);
  return sendSuccess(res, data);
});

export const approvePayout = asyncHandler(async (req, res) => {
  const data = await payoutService.approvePayout(req.params.id, req.user.id);
  return sendSuccess(res, data);
});

export const rejectPayout = asyncHandler(async (req, res) => {
  const data = await payoutService.rejectPayout(req.params.id, req.body.reason, req.user.id);
  return sendSuccess(res, data);
});
