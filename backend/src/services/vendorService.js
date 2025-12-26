import { prisma } from '../lib/prisma.js';

export const createVendorProfile = async (userId, payload) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (user.role !== 'vendor') {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'vendor' },
    });
  }

  const existingProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    return prisma.vendorProfile.update({
      where: { userId },
      data: payload,
      include: { user: true },
    });
  }

  return prisma.vendorProfile.create({
    data: {
      ...payload,
      user: { connect: { id: userId } },
    },
    include: { user: true },
  });
};

export const getVendorProfile = async (id) => {
  let profile = await prisma.vendorProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!profile) {
    profile = await prisma.vendorProfile.findUnique({
      where: { userId: id },
      include: { user: true },
    });
  }

  // If still no profile, check if the ID corresponds to a User who is a vendor
  if (!profile) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { vendorProfile: true }
    });

    if (user && user.role === 'vendor') {
      // Create a "virtual" profile so the page doesn't crash
      return {
        id: 'virtual-' + user.id,
        userId: user.id,
        companyName: user.name, // Use user name as default company name
        description: 'Quality vendor on VendorHub Connect',
        logo: null,
        website: null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        user: user
      };
    }
  }

  if (!profile) {
    const error = new Error('Vendor not found');
    error.status = 404;
    throw error;
  }

  return profile;
};

