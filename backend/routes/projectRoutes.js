const express = require('express');
const router = express.Router();
const {
  getProjects, createProject, updateProject, deleteProject,
  completeProject, reopenProject,
} = require('../controllers/projectController');

router.route('/').get(getProjects).post(createProject);
router.route('/:id').put(updateProject).delete(deleteProject);
router.patch('/:id/complete', completeProject);
router.patch('/:id/reopen', reopenProject);

module.exports = router;
