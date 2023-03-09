const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.clearCookie('token');
    return res
      .status(401)
      .send({ errors: [{ msg: 'No token, authorization denied' }] });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user_id = decoded.id;

    next();
  } catch (err) {
    res.clearCookie('token');
    res.status(400).send({ errors: [{ msg: 'Token is not valid' }] });
  }
};

module.exports = auth;
