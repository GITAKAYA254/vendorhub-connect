import {
  createProduct,
  listProducts,
  listMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../services/productService.js';
import { getRelatedProducts } from '../services/recommendationService.js';
import { successResponse } from '../utils/response.js';
import { buildPagination } from '../utils/pagination.js';
import path from 'path';

export const createProductHandler = async (req, res, next) => {
  try {
    // Process uploaded files if any
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    // Parse tags (multipart form data sends arrays as strings sometimes)
    let tags = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
      } else {
        try {
          tags = JSON.parse(req.body.tags);
        } catch {
          tags = req.body.tags.split(',').map(t => t.trim());
        }
      }
    }

    const payload = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      stock: req.body.stock ? Number(req.body.stock) : undefined,
      images, // passing URL strings
      tags,
    };

    const product = await createProduct(req.user.id, payload);
    res.status(201).json(successResponse({ product }));
  } catch (err) {
    next(err);
  }
};

export const listProductsHandler = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const filters = {
      vendorId: req.query.vendorId,
      category: req.query.category,
    };
    const { items, total } = await listProducts(pagination, filters);
    res.json(
      successResponse({
        products: items,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
        },
      }),
    );
  } catch (err) {
    next(err);
  }
};

export const listMyProductsHandler = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const { items, total } = await listMyProducts(req.user.id, pagination);
    res.json(
      successResponse({
        products: items,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
        },
      }),
    );
  } catch (err) {
    next(err);
  }
};

export const getProductHandler = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    res.json(successResponse({ product }));
  } catch (err) {
    next(err);
  }
};

export const updateProductHandler = async (req, res, next) => {
  try {
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : undefined;

    let tags = undefined;
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
      } else {
        try {
          tags = JSON.parse(req.body.tags);
        } catch {
          tags = req.body.tags.split(',').map(t => t.trim());
        }
      }
    }

    const payload = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      stock: req.body.stock ? Number(req.body.stock) : undefined,
      images,
      tags
    };

    const product = await updateProduct(req.params.id, req.user.id, payload);
    res.json(successResponse({ product }));
  } catch (err) {
    next(err);
  }
};

export const deleteProductHandler = async (req, res, next) => {
  try {
    await deleteProduct(req.params.id, req.user.id);
    res.json(successResponse({ message: 'Product deleted' }));
  } catch (err) {
    next(err);
  }
};

export const getRelatedProductsHandler = async (req, res, next) => {
  try {
    const products = await getRelatedProducts(req.params.id);
    res.json(successResponse({ products }));
  } catch (err) {
    next(err);
  }
};
