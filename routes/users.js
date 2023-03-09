const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

/** Endpoints **\
 * Register a user
 * Register a moderator
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

module.exports = router;
