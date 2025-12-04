import {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../services/taskService.js';
import { successResponse } from '../utils/response.js';
import { buildPagination } from '../utils/pagination.js';

export const createTaskHandler = async (req, res, next) => {
  try {
    const task = await createTask(req.user.id, req.body);
    res.status(201).json(successResponse({ task }));
  } catch (err) {
    next(err);
  }
};

export const listTasksHandler = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const filters = {
      vendorId: req.query.vendorId,
      status: req.query.status,
      priority: req.query.priority,
    };
    const { items, total } = await listTasks(pagination, filters);
    res.json(
      successResponse({
        tasks: items,
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

export const getTaskHandler = async (req, res, next) => {
  try {
    const task = await getTaskById(req.params.id);
    res.json(successResponse({ task }));
  } catch (err) {
    next(err);
  }
};

export const updateTaskHandler = async (req, res, next) => {
  try {
    const task = await updateTask(req.params.id, req.user.id, req.body);
    res.json(successResponse({ task }));
  } catch (err) {
    next(err);
  }
};

export const deleteTaskHandler = async (req, res, next) => {
  try {
    await deleteTask(req.params.id, req.user.id);
    res.json(successResponse({ message: 'Task deleted' }));
  } catch (err) {
    next(err);
  }
};

