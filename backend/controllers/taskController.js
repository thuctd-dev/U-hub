const Task = require('../models/Task');

// @desc    Get all tasks (populate assignee)
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const filter = req.query.projectId ? { projectId: req.query.projectId } : {};
    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .sort({ order: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    const populated = await task.populate('assignee', 'name email avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignee', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy task' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Không tìm thấy task' });
    }
    res.json({ message: 'Đã xoá task thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task priority
// @route   PATCH /api/tasks/:id/priority
exports.updateTaskPriority = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, { priority: req.body.priority }, { new: true, runValidators: true }
    ).populate('assignee', 'name email avatar');
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update task dates
// @route   PATCH /api/tasks/:id/dates
exports.updateTaskDates = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, { startDate: req.body.startDate, dueDate: req.body.dueDate }, { new: true, runValidators: true }
    ).populate('assignee', 'name email avatar');
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, order },
      { new: true, runValidators: true }
    ).populate('assignee', 'name email avatar');
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add subtask
// @route   POST /api/tasks/:id/subtasks
exports.addSubtask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    task.subtasks.push(req.body);
    await task.save();
    res.status(201).json(task.subtasks[task.subtasks.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update subtask
// @route   PATCH /api/tasks/:id/subtasks/:subId
exports.updateSubtask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    const sub = task.subtasks.id(req.params.subId);
    if (!sub) return res.status(404).json({ message: 'Không tìm thấy subtask' });
    Object.assign(sub, req.body);
    await task.save();
    res.json(sub);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete subtask
// @route   DELETE /api/tasks/:id/subtasks/:subId
exports.deleteSubtask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    task.subtasks.pull(req.params.subId);
    await task.save();
    res.json({ message: 'Đã xoá subtask' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
