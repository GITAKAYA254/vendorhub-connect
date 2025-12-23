import {
    addProductReview,
    addVendorReview,
    getProductReviews,
    getVendorReviews,
} from '../services/reviewService.js';
import { successResponse } from '../utils/response.js';
import { buildPagination } from '../utils/pagination.js';

export const createProductReviewHandler = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const review = await addProductReview(req.user.id, productId, req.body);
        res.status(201).json(successResponse({ review }));
    } catch (err) {
        next(err);
    }
};

export const createVendorReviewHandler = async (req, res, next) => {
    try {
        const { vendorId } = req.params;
        const review = await addVendorReview(req.user.id, vendorId, req.body);
        res.status(201).json(successResponse({ review }));
    } catch (err) {
        next(err);
    }
};

export const getProductReviewsHandler = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const pagination = buildPagination(req.query);
        const result = await getProductReviews(productId, pagination);
        res.json(successResponse({ ...result, pagination }));
    } catch (err) {
        next(err);
    }
};

export const getVendorReviewsHandler = async (req, res, next) => {
    try {
        const { vendorId } = req.params;
        const pagination = buildPagination(req.query);
        const result = await getVendorReviews(vendorId, pagination);
        res.json(successResponse({ ...result, pagination }));
    } catch (err) {
        next(err);
    }
};
