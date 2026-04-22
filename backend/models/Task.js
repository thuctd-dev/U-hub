const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const subtaskSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    status:   { type: String, default: 'TO_DO' },
    priority: { type: String, enum: ['LOW','MEDIUM','HIGH','URGENT'], default: 'MEDIUM' },
    startDate: { type: Date, default: null },
    dueDate:  { type: Date, default: null },
  },
  { _id: true, timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề bài học là bắt buộc'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'TO_DO',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    checklist: [checklistItemSchema],
    subtasks: [subtaskSchema],
    order: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
