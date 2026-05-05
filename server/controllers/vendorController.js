import * as vendorService from '../services/vendorService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listVendors = asyncHandler(async (req, res) => {
  const data = await vendorService.listVendors();
  return sendSuccess(res, data);
});

export const createVendor = asyncHandler(async (req, res) => {
  const data = await vendorService.createVendor(req.body);
  return sendSuccess(res, data, 201);
});
