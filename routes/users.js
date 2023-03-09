const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Blocked = require('../models/Blocked');
const auth = require('../middleware/auth');

const router = express.Router();

/** Endpoints **\
 * Register a user
 * Register a moderator
 * Block a user
 * Unblock a user
 */

/**
 * @route POST api/users/user
 * @desc Register a user
 * @access Public
 */
router.post(
  '/user',
  [
    check('name', 'Please enter name').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .send({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        id: user.id,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 21600,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 6 * 60 * 60 * 1000,
      });

      return res.send('Registered');
    } catch (err) {
      return res.status(500).send({ errors: [{ msg: err.message }] });
    }
  }
);

/**
 * @route POST api/users/moderator
 * @desc Register a moderator
 * @access Public
 */
router.post(
  '/moderator',
  [
    check('name', 'Please enter name').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    check('role', 'Please include a valid role').equals('moderator'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .send({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password,
        role,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        id: user.id,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 21600,
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 6 * 60 * 60 * 1000,
      });

      return res.send('Registered');
    } catch (err) {
      return res.status(500).send({ errors: [{ msg: err.message }] });
    }
  }
);

/**
 * @route POST api/users/block
 * @desc Block a user
 * @access Private
*/
router.post('/block', auth, async (req, res) => {
  try{
    // Check if user is a moderator
    if (req.user_role !== 'moderator') {
      return res.status(401).send({ errors: [{ msg: 'Not authorized' }] });
    }

    const { email } = req.body;

    // Check if user exists
    const found = await User.findOne({ email });
    if (!found) {
      return res.status(404).send({ errors: [{ msg: 'User not found' }] });
    }

    if(found.role === 'moderator') {
      return res.status(400).send({ errors: [{ msg: 'Cannot block a moderator' }] });
    }

    // Check if user is already blocked
    const isBlocked = await Blocked.findOne({user: found.id});
    if (isBlocked) {
      return res.status(400).send({ errors: [{ msg: 'User is already blocked' }] });
    }

    // Block user
    const blocked = new Blocked({
      user: found.id,
    });

    await blocked.save();

    return res.send('User blocked');
  } catch (err) {
    return res.status(500).send({ errors: [{ msg: err.message }] });
  }
});

/**
 * @route POST api/users/unblock
 * @desc Unblock a user
 * @access Private
*/
router.post('/unblock', auth, async (req, res) => {
  try{
    // Check if user is a moderator
    if (req.user_role !== 'moderator') {
      return res.status(401).send({ errors: [{ msg: 'Not authorized' }] });
    }

    const { email } = req.body;

    // Check if user exists
    const found = await User.findOne({ email });
    if (!found) {
      return res.status(404).send({ errors: [{ msg: 'User not found' }] });
    }

    // Check if user is already unblocked
    const isBlocked = await Blocked.findOne({user: found.id});
    if (!isBlocked) {
      return res.status(400).send({ errors: [{ msg: 'User is already unblocked' }] });
    }

    // Unblock user
    const blocked = await Blocked.findOneAndDelete({user: found.id});
    
    return res.send('User unblocked');
  } catch (err) {
    return res.status(500).send({ errors: [{ msg: err.message }] });
  }
});

module.exports = router;
