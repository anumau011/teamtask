const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('name email role createdAt updatedAt')
    .sort({ createdAt: -1 });

  return res.json({ users: users.map((user) => user.toJSON()) });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.role = role;
  await user.save();

  return res.json({
    user: user.toJSON()
  });
});

module.exports = {
  listUsers,
  updateUserRole
};
