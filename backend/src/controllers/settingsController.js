import Settings from "../models/Settings.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  const { companyName, logo, phone, email, address, ninea, rccm, invoiceFooter } = req.body;
  if (companyName !== undefined) settings.companyName = companyName;
  if (logo !== undefined) settings.logo = logo;
  if (phone !== undefined) settings.phone = phone;
  if (email !== undefined) settings.email = email;
  if (address !== undefined) settings.address = address;
  if (ninea !== undefined) settings.ninea = ninea;
  if (rccm !== undefined) settings.rccm = rccm;
  if (invoiceFooter !== undefined) settings.invoiceFooter = invoiceFooter;
  await settings.save();
  res.json({ success: true, data: settings });
});
