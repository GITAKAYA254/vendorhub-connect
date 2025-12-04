import {
  createJob,
  listJobs,
  getJobById,
  updateJob,
  deleteJob,
} from '../services/jobService.js';
import { successResponse } from '../utils/response.js';
import { buildPagination } from '../utils/pagination.js';

export const createJobHandler = async (req, res, next) => {
  try {
    const job = await createJob(req.user.id, req.body);
    res.status(201).json(successResponse({ job }));
  } catch (err) {
    next(err);
  }
};

export const listJobsHandler = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const filters = {
      vendorId: req.query.vendorId,
      status: req.query.status,
    };
    const { items, total } = await listJobs(pagination, filters);
    res.json(
      successResponse({
        jobs: items,
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

export const getJobHandler = async (req, res, next) => {
  try {
    const job = await getJobById(req.params.id);
    res.json(successResponse({ job }));
  } catch (err) {
    next(err);
  }
};

export const updateJobHandler = async (req, res, next) => {
  try {
    const job = await updateJob(req.params.id, req.user.id, req.body);
    res.json(successResponse({ job }));
  } catch (err) {
    next(err);
  }
};

export const deleteJobHandler = async (req, res, next) => {
  try {
    await deleteJob(req.params.id, req.user.id);
    res.json(successResponse({ message: 'Job deleted' }));
  } catch (err) {
    next(err);
  }
};

