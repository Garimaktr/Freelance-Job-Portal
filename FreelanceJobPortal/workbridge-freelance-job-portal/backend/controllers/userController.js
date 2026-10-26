const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');

exports.getProfile = asyncHandler(async (req, res) => res.json({ user: req.user }));
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.updateProfile(req.user.id, req.body);
  res.json({ message: 'Profile updated.', user });
});

