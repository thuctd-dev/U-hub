const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  seedUsers,
} = require('../controllers/userController');

router.route('/').get(getUsers).post(createUser);
router.post('/seed', seedUsers);

module.exports = router;
