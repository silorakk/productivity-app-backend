const res = require('express/lib/response');
const JWT = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = async (req, res, next) => {
  const token = req.cookies['x-auth-token'];

  if (!token) return res.status(401).send("Access Denied!");

  try {
    const validatedUser = await JWT.verify(token, process.env.JWT_SECRET);
    req.user = validatedUser;
    next()
  } catch (error) {
    return res.status(400).send("Invalid Token");

  }

}
