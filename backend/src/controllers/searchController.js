import { searchAll } from '../services/searchService.js';
import { successResponse } from '../utils/response.js';

export const searchHandler = async (req, res, next) => {
  try {
    const results = await searchAll(req.query.q);
    res.json(successResponse(results));
  } catch (err) {
    next(err);
  }
};




