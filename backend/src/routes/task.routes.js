import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  reorderTasks,
} from '../controllers/task.controller.js';
import { validateCreateTask, validateUpdateTask } from '../validators/task.validator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks).post(validateCreateTask, createTask);

router.get('/stats', getTaskStats);

router.patch('/reorder', reorderTasks);

router.route('/:id').get(getTask).patch(validateUpdateTask, updateTask).delete(deleteTask);

export default router;
