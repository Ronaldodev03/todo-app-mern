import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'medium',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value >= new Date();
        },
        message: 'Due date cannot be in the past',
      },
    },
    completedAt: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

taskSchema.index({ user: 1, order: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1, priority: 1 });

taskSchema.pre('save', function () {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'completed' && this.completedAt) {
    this.completedAt = null;
  }
});

taskSchema.methods.toJSON = function () {
  const taskObject = this.toObject();
  return taskObject;
};

const Task = mongoose.model('Task', taskSchema);

export default Task;
