import {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../services/productService.js';
import { successResponse } from '../utils/response.js';
import { buildPagination } from '../utils/pagination.js';

export const createProductHandler = async (req, res, next) => {
  try {
    const product = await createProduct(req.user.id, req.body);
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
    const product = await updateProduct(req.params.id, req.user.id, req.body);
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

