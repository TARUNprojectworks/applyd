const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Creates a JWT that stores the user's id. Valid for 7 days.
function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Shape of the user object we send back (never send the password hash)
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' }); // 409 = conflict
    }

    // Hash the password. 10 = salt rounds (how much work bcrypt does).
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ token: createToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // bcrypt.compare hashes the typed password and compares it with the stored hash.
    // Same message for both cases so we don't reveal which emails exist.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ token: createToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
