import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getTasks = asyncHandler(async (req, res, next) => {
  const {
    status,
    priority,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 10,
    startDate,
    endDate,
  } = req.query;

  const query = { user: req.user._id };

  if (status) {
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return next(new AppError('Invalid status filter', 400));
    }
    query.status = status;
  }

  if (priority) {
    if (!['low', 'medium', 'high'].includes(priority)) {
      return next(new AppError('Invalid priority filter', 400));
    }
    query.priority = priority;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const validSortFields = ['createdAt', 'updatedAt', 'priority', 'status', 'dueDate', 'order'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    return next(new AppError('Invalid pagination parameters', 400));
  }

  const skip = (pageNum - 1) * limitNum;

  // Si no se especifica un sortBy, ordenar primero por 'order' y luego por 'createdAt'
  const sortCriteria = sortBy === 'createdAt'
    ? { order: 1, createdAt: sortOrder }
    : { [sortField]: sortOrder };

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Task.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
    data: {
      tasks,
    },
  });
});

export const getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

export const createTask = asyncHandler(async (req, res, next) => {
  const taskData = {
    ...req.body,
    user: req.user._id,
  };

  const task = await Task.create(taskData);

  res.status(201).json({
    status: 'success',
    data: {
      task,
    },
  });
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const allowedUpdates = ['title', 'description', 'status', 'priority', 'dueDate'];
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    return next(new AppError('No valid updates provided', 400));
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

export const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully',
    data: null,
  });
});

export const reorderTasks = asyncHandler(async (req, res, next) => {
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return next(new AppError('taskIds must be a non-empty array', 400));
  }

  // Verificar que todas las tareas pertenecen al usuario
  const tasks = await Task.find({
    _id: { $in: taskIds },
    user: req.user._id,
  });

  if (tasks.length !== taskIds.length) {
    return next(new AppError('Some tasks were not found or do not belong to you', 404));
  }

  // Actualizar el orden de cada tarea
  const updatePromises = taskIds.map((taskId, index) =>
    Task.findOneAndUpdate(
      { _id: taskId, user: req.user._id },
      { order: index },
      { new: true }
    )
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    status: 'success',
    message: 'Tasks reordered successfully',
  });
});

export const getTaskStats = asyncHandler(async (req, res, next) => {
  const stats = await Task.aggregate([
    {
      $match: { user: req.user._id },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        lowPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] },
        },
        mediumPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] },
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        lowPriority: 0,
        mediumPriority: 0,
        highPriority: 0,
      },
    },
  });
});
