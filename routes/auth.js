const router = require('express').Router();
const JWT = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../model/User');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const validationRules = [
  check("email", "Email is not a valid email address.").isEmail(),
  check("name", "Please enter a name.").notEmpty(),
  check("nickname", "Pleter enter a nickname.").notEmpty(),
  check("password", "Password is too short.").isLength({
    min: 6
  }),
]

router.post('/register', validationRules, async (req, res) => {
  const { email, password, name, nickname } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    })
  }

  const user = await User.findOne({ email: email });
  if (user) {
    return res.status(400).json({
      "errors": [
        {
          "msg": "A user with this email already exists.",
        },
      ]
    });
  }


  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name: name, email: email, password: hashedPassword, nickname: nickname });

  try {
    const savedUser = await newUser.save();
    const token = await JWT.sign({
      email
    }, process.env.JWT_SECRET, {
      expiresIn: 360000
    });

    const cookieOptions = process.env.ENVIRONMENT === "PRODUCTION" ? { maxAge: 900000, httpOnly: true, sameSite: "None", secure: true } : { maxAge: 900000, httpOnly: true }
    return res
      .cookie("x-auth-token", token, cookieOptions)
      .status(200)
      .json({ message: "Registered successfully." });
  } catch (error) {
    return res.status(400).json({
      "errors": [
        {
          "msg": error,
        },
      ]
    });
  }
})

router.get('/all', (req, res) => {
  User.find({}).then((users) => {
    return res.json(users);
  })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).json({
      "errors": [
        {
          "msg": "The user with this email doesn't exist.",
        },
      ]
    });
  }

  const validUser = await bcrypt.compare(password, user.password);

  if (!validUser) {
    return res.status(400).json({
      "errors": [
        {
          "msg": "Incorrect credentials",
        },
      ]
    });
  }

  const token = await JWT.sign({
    email
  }, process.env.JWT_SECRET, {
    expiresIn: 360000
  });
  const cookieOptions = process.env.ENVIRONMENT === "PRODUCTION" ? { maxAge: 900000, httpOnly: true, sameSite: "None", secure: true } : { maxAge: 900000, httpOnly: true }
  return res.cookie('x-auth-token', token, cookieOptions).status(200).json({ message: "Logged in successfully." })
})

router.get('/verify', async (req, res) => {
  const token = req.cookies['x-auth-token'];

  if (!token) return res.status(401).send("Access Denied!");

  try {
    const validatedUser = await JWT.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: validatedUser.email })
    return res.json(user);
  } catch (error) {
    return res.status(400).json(error);
  }

})

router.get('/logout', async (req, res) => {
  res.cookie('x-auth-token', "", { maxAge: 0, domain: process.env.ENVIRONMENT === "PRODUCTION" ? "https://productivity-app-nu.vercel.app" : "http://localhost:3000", path: "/" })

  return res.status(200).end();

})


module.exports = router;