const express = require('express');
const router = express.Router();
const {
  getTasks, createTask, updateTask, deleteTask,
  updateTaskStatus, updateTaskPriority, updateTaskDates,
  addSubtask, updateSubtask, deleteSubtask,
} = require('../controllers/taskController');

router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/priority', updateTaskPriority);
router.patch('/:id/dates', updateTaskDates);
router.post('/:id/subtasks', addSubtask);
router.patch('/:id/subtasks/:subId', updateSubtask);
router.delete('/:id/subtasks/:subId', deleteSubtask);

module.exports = router;
