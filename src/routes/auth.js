const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    // Validate the data(We have done validation at schema level of database)
    const {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      photoUrl,
      about,
      skills,
    } = req.body;

    //Check for existing email
    const userExist = await User.findOne({ emailId: emailId });
    if (userExist) {
      throw new Error("Email already exists!!!");
    }
    //Encrypt the passwords
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      photoUrl,
      about,
      skills,
    });

    if (user?.skills.length > 10) {
      throw new Error("Skills can't be more than 10");
    }
    await user.save();
    res.json({
      message :"User created successfully",
      data : user
    });
  } catch (err) {
    res.status(400).send(err.message);
    
    // console.log(err.message);
  }
});

//Login Api
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid credentials");
    }

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = await jwt.sign({ _id: user._id }, "Ankit@428@token");
      // console.log(token);

      res.cookie("token", token);
      res.json({
        message :"Login successfull",
        data : user
      });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("Error : " + err.message);
    console.log(err);
  }
});

authRouter.post("/logout", (req, res) => {
  //   res.clearCookie("token");
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logged out successfully");
});

module.exports = authRouter;
