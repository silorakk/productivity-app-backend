const res = require('express/lib/response');
const JWT = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../model/User');

dotenv.config();

// Not used
module.exports = async (req, res, next) => {
  const token = req.cookies['x-auth-token'];

  if (!token) return res.status(401).send("Access Denied!");

  try {
    const validatedUser = await JWT.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: validatedUser.email })
    req.user = user
    next()
  } catch (error) {
    next()

  }

}
