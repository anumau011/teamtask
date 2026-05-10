const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function serializeUser(user) {
  const payload = user.toJSON ? user.toJSON() : user;

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt
  };
}

async function register(req, res) {
  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const safeRole = role === 'project_manager' ? 'project_manager' : 'developer';

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: safeRole
  });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  return res.status(201).json({ user: serializeUser(user), token });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  return res.json({ user: serializeUser(user), token });
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me,
  serializeUser
};
