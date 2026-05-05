import mongoose from 'mongoose';
import { Vendor } from '../models/Vendor.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export async function listVendors(req, res) {
  const vendors = await Vendor.find().sort({ createdAt: -1 }).lean();
  return sendSuccess(res, { vendors });
}

export async function createVendor(req, res) {
  const { name, upi_id, bank_account, ifsc, is_active } = req.body;
  const vendor = await Vendor.create({
    name,
    upi_id: upi_id ?? '',
    bank_account: bank_account ?? '',
    ifsc: ifsc ?? '',
    is_active: is_active !== undefined ? Boolean(is_active) : true,
  });
  return sendSuccess(res, { vendor }, 201);
}
