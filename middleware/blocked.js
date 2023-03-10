const Blocked = require('../models/Blocked');

const blocked = async (req, res, next) => {
  try {
    // Check if user is blocked
    const blocked = await Blocked.findOne({ user: req.user_id });
    if (blocked) {
        return res.status(400).json({ errors: [{ msg: 'You are blocked' }] });
    }
    
    next();
  } catch (err) {
    res.status(400).send({ errors: [{ msg: 'Error in checking if user is blocked' }] });
  }
};

module.exports = blocked;
