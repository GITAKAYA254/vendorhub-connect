import { prisma } from '../lib/prisma.js';

export const addProductReview = async (userId, productId, { rating, comment }) => {
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    const existing = await prisma.productReview.findUnique({
        where: {
            productId_userId: { productId, userId },
        },
    });

    if (existing) {
        throw new Error('You have already reviewed this product');
    }

    const review = await prisma.productReview.create({
        data: {
            userId,
            productId,
            rating,
            comment,
        },
        include: { user: { select: { name: true } } }
    });

    return review;
};

export const addVendorReview = async (userId, vendorId, { rating, comment }) => {
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    if (userId === vendorId) {
        throw new Error('You cannot review yourself');
    }

    const existing = await prisma.vendorReview.findUnique({
        where: {
            vendorId_userId: { vendorId, userId },
        },
    });

    if (existing) {
        throw new Error('You have already reviewed this vendor');
    }

    const review = await prisma.vendorReview.create({
        data: {
            userId,
            vendorId,
            rating,
            comment,
        },
        include: { reviewer: { select: { name: true } } }
    });

    return review;
};

export const getProductReviews = async (productId, { skip = 0, limit = 10 } = {}) => {
    const where = { productId, isHidden: false };

    const [items, total, aggregation] = await Promise.all([
        prisma.productReview.findMany({
            where,
            skip,
            take: limit,
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.productReview.count({ where }),
        prisma.productReview.aggregate({
            where,
            _avg: { rating: true },
        }),
    ]);

    return {
        reviews: items,
        total,
        averageRating: aggregation._avg.rating || 0,
    };
};

export const getVendorReviews = async (vendorId, { skip = 0, limit = 10 } = {}) => {
    const where = { vendorId, isHidden: false };

    const [items, total, aggregation] = await Promise.all([
        prisma.vendorReview.findMany({
            where,
            skip,
            take: limit,
            include: { reviewer: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.vendorReview.count({ where }),
        prisma.vendorReview.aggregate({
            where,
            _avg: { rating: true },
        }),
    ]);

    return {
        reviews: items,
        total,
        averageRating: aggregation._avg.rating || 0,
    };
};
