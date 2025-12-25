import { prisma } from '../lib/prisma.js';

export const getVendorPaymentMethods = async (vendorId) => {
    return prisma.vendorPaymentMethod.findMany({
        where: {
            vendorId,
            isActive: true
        }
    });
};

export const upsertPaymentMethod = async (vendorId, { type, config, isActive }) => {
    return prisma.vendorPaymentMethod.upsert({
        where: {
            vendorId_type: {
                vendorId,
                type
            }
        },
        update: {
            config,
            isActive: isActive !== undefined ? isActive : true
        },
        create: {
            vendorId,
            type,
            config,
            isActive: isActive !== undefined ? isActive : true
        }
    });
};

export const deletePaymentMethod = async (vendorId, type) => {
    return prisma.vendorPaymentMethod.delete({
        where: {
            vendorId_type: {
                vendorId,
                type
            }
        }
    });
};
