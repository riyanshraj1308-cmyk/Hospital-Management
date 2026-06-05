const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { asyncHandler } = require('../middleware/error.middleware');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'medicore_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user)
    return res.status(401).json({ message: 'Invalid email or password' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.status(401).json({ message: 'Invalid email or password' });

  if (!user.isActive)
    return res.status(403).json({ message: 'Account is deactivated' });

  // Update lastLogin without triggering pre('save') password rehash
  await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

  res.json({ token: generateToken(user._id), user });
});

// POST /api/auth/register  (open route)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing)
    return res.status(409).json({ message: 'An account with this email already exists' });

  // Plain-text password — model pre('save') hook hashes it once
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: role || 'receptionist',
  });

  res.status(201).json({ token: generateToken(user._id), user });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await user.comparePassword(currentPassword)))
    return res.status(400).json({ message: 'Current password is incorrect' });

  user.password = newPassword; // pre('save') will hash it
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

module.exports = { login, register, getMe, changePassword };
