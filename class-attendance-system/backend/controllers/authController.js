const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token with 7-day expiration
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '7d'
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, semester, section } = req.body;

    // Basic input validation
    if (!name || !email || !password || !rollNumber || !semester || !section) {
      return res.status(400).json({
        message: 'Please provide all required fields: name, email, password, roll number, semester, and section'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRoll = rollNumber.toUpperCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { rollNumber: cleanRoll }]
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(409).json({ message: 'A user with this email already exists' });
      }
      return res.status(409).json({ message: 'A student with this roll number already exists' });
    }

    // Role is strictly 'student' for public registration
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'student',
      rollNumber: cleanRoll,
      semester: Number(semester),
      section: section.toUpperCase().trim()
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        semester: user.semester,
        section: user.section
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        semester: user.semester,
        section: user.section
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private (Authenticated)
const getMe = async (req, res) => {
  res.json({
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getMe
};
