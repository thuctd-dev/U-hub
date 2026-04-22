const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Seed sample users (with passwords for auth)
// @route   POST /api/users/seed
exports.seedUsers = async (req, res) => {
  try {
    const sampleUsers = [
      { name: 'Nguyễn Văn An', email: 'an.nguyen@uhub.com', password: '123456', role: 'ADMIN', avatar: '' },
      { name: 'Trần Thị Bình', email: 'binh.tran@uhub.com', password: '123456', role: 'MANAGER', avatar: '' },
      { name: 'Lê Minh Cường', email: 'cuong.le@uhub.com', password: '123456', role: 'MEMBER', avatar: '' },
      { name: 'Phạm Thu Dung', email: 'dung.pham@uhub.com', password: '123456', role: 'MEMBER', avatar: '' },
      { name: 'Hoàng Đức Em', email: 'em.hoang@uhub.com', password: '123456', role: 'MEMBER', avatar: '' },
    ];

    await User.deleteMany({});

    // Use User.create to trigger pre-save hook for password hashing
    const users = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      users.push(user);
    }

    res.status(201).json({ message: `Đã tạo ${users.length} users mẫu`, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
