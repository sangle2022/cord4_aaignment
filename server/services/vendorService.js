import { Vendor } from '../models/Vendor.js';

export async function listVendors() {
  const vendors = await Vendor.find().sort({ createdAt: -1 }).lean();
  return { vendors };
}

export async function createVendor(payload) {
  const { name, upi_id, bank_account, ifsc, is_active } = payload;
  const vendor = await Vendor.create({
    name,
    upi_id: upi_id ?? '',
    bank_account: bank_account ?? '',
    ifsc: ifsc ?? '',
    is_active: is_active !== undefined ? Boolean(is_active) : true,
  });
  return { vendor };
}
