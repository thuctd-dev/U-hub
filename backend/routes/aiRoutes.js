const express = require('express');
const router = express.Router();
const { generateTasks } = require('../controllers/aiController');

router.post('/generate-tasks', generateTasks);

module.exports = router;
