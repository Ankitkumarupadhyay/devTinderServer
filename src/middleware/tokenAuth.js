const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    console.log(req);
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Please login");
    }
    const decodedObj = await jwt.verify(token, "Ankit@428@token");

    const { _id } = decodedObj;

    const user = await User.findById({ _id: _id });
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

module.exports = { userAuth };
