import { body, validationResult } from 'express-validator';
import { AppError } from '../middlewares/errorHandler.js';

export const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg).join('. ');
      return next(new AppError(errorMessages, 400));
    }
    next();
  },
];

export const validateUpdateTask = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be pending, in-progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg).join('. ');
      return next(new AppError(errorMessages, 400));
    }
    next();
  },
];
