const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

/** Endpoints **\
 * Get logged in user
 * Login
 * Delete cookie / logout
 * Validate user
 */

/**
 * @route   GET api/auth
 * @desc    Get logged in user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  const user_id = req.user_id;

  try {
    let user = await User.findOne({ _id: user_id });

    if (!user) {
      return res.status(400).send({ errors: [{ msg: 'User not found' }] });
    }

    user = {
      name: user.name,
      role: user.role,
    };

    return res.send(user);
  } catch (err) {
    return res.status(500).send({ errors: [{ msg: err.message }] });
  }
});

/**
 * @route   POST api/auth
 * @desc    Authorize user and get token
 * @access  Public
 */
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).send({ errors: [{ msg: 'User not found' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .send({ errors: [{ msg: 'Incorrect password' }] });
      }

      const payload = {
        id: user.id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 21600,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 6 * 60 * 60 * 1000,
      });

      return res.send('Logged in');
    } catch (err) {
      return res.status(500).send({ errors: [{ msg: err.message }] });
    }
  }
);

/**
 * @route   DELETE api/auth
 * @desc    Delete cookie / logout
 * @access  Private
 */
router.delete('/', auth, async (req, res) => {
  res.clearCookie('token');

  return res.send('Logged out');
});

/**
 * @route   POST api/auth/check
 * @desc    Validate user
 * @access  Public
 */
router.get('/check', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.clearCookie('token');
    return res.status(400).send('No token');
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    return res.send('Valid');
  } catch (err) {
    res.clearCookie('token');
    return res.status(400).send('Invalid');
  }
});

module.exports = router;
