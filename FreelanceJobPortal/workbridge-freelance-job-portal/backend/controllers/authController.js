const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const createToken = require('../utils/token');
const asyncHandler = require('../utils/asyncHandler');

const authResponse = (user) => ({ token: createToken(user.id), user });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await User.findByEmail(email)) {
    const error = new Error('An account with that email already exists.');
    error.statusCode = 409;
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role });
  res.status(201).json(authResponse(user));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) {
    const error = new Error('Incorrect email or password.');
    error.statusCode = 401;
    throw error;
  }
  delete user.password_hash;
  res.json(authResponse(user));
});

exports.me = asyncHandler(async (req, res) => res.json({ user: req.user }));

