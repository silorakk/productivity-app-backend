const JWT = require('jsonwebtoken');

module.exports = async (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.json({
      "errors": [
        {
          "msg": "No token found",
        }
      ]
    })
  }


  try {
    const user = await JWT.verify(token, "asf90asg8sd97hs89h6s98das8cas09c8as0fas90f8asqwr");
    req.user = user.email;
    next();
  } catch (error) {
    return res.status(400).json({
      "errors": [
        {
          "msg": "Invalid token",
        }
      ]
    })
  }

};