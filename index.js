const express = require('express');
const auth = require('./routes/auth');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const verifyToken = require("./middleware/verifyToken");

dotenv.config();

const corsOptions = {
  //To allow requests from client
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1",
  ],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};

try {
  mongoose.connect(process.env.DB_URL);
  console.log('Connected to database');
} catch (error) {
  console.log(error);
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json())
app.use("/auth", auth);

app.use('/', verifyToken, (req, res) => {

  return res.json(req.user);
})



app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT} `)
})