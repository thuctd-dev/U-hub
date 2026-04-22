const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createProject = async (req, res) => {
  try {
    const count = await Project.countDocuments();
    const project = await Project.create({ ...req.body, order: count });
    res.status(201).json(project);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    res.json(project);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    await Task.deleteMany({ projectId: req.params.id });
    res.json({ message: 'Đã xoá dự án' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.completeProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'COMPLETED', completedAt: new Date() },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    res.json(project);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

exports.reopenProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'ACTIVE', completedAt: null },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    res.json(project);
  } catch (e) { res.status(400).json({ message: e.message }); }
};
