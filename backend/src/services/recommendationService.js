import { prisma } from '../lib/prisma.js';

export const getRelatedProducts = async (productId, limit = 5) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new Error('Product not found');
    }

    // Priority: 1. Same Category, 2. Shared Tags (if any), 3. Same Vendor
    // We fetch a bit more and sort/filter in memory if complex scoring needed, 
    // or use simple database OR query.

    // Check tags support
    const tags = product.tags || [];

    const related = await prisma.product.findMany({
        where: {
            id: { not: productId },
            OR: [
                { category: product.category },
                { vendorId: product.vendorId },
                // { tags: { hasSome: tags } } // specific tag logic matching
            ],
        },
        take: limit * 2, // Fetch more to score
        include: { productImages: true },
    });

    // Simple scoring
    const scored = related.map(p => {
        let score = 0;
        if (p.category === product.category) score += 3;
        if (p.vendorId === product.vendorId) score += 1;

        const sharedTags = p.tags.filter(t => tags.includes(t)).length;
        score += sharedTags * 2;

        return { ...p, score };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(p => ({
        ...p,
        price: Number(p.price),
        images: p.productImages?.map(i => i.url) || p.images,
        primaryImage: p.productImages?.find(i => i.isPrimary)?.url || p.images?.[0] || null,
    }));
};
