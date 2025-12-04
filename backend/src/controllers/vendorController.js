import { createVendorProfile, getVendorProfile } from '../services/vendorService.js';
import { successResponse } from '../utils/response.js';

const formatVendor = (profile) => ({
  id: profile.id,
  userId: profile.userId,
  name: profile.companyName,
  description: profile.description,
  logo: profile.logo,
  website: profile.website,
  createdAt: profile.createdAt,
});

export const createVendor = async (req, res, next) => {
  try {
    const profile = await createVendorProfile(req.user.id, req.body);
    res.status(201).json(successResponse({ vendor: formatVendor(profile) }));
  } catch (err) {
    next(err);
  }
};

export const getVendor = async (req, res, next) => {
  try {
    const vendor = await getVendorProfile(req.params.id);
    res.json(successResponse({ vendor: formatVendor(vendor) }));
  } catch (err) {
    next(err);
  }
};

