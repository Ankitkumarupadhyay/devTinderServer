const express = require("express");
const { userAuth } = require("../middleware/tokenAuth");
const validateEditProfileData = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
    console.log(err);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // console.log(req.body);
    if (!validateEditProfileData(req.body)) {
      throw new Error("Invalid updates");
    }
    const user = req.user;

    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
      // console.log(key, req.body[key]);
    });

    const updatedUser = await user.save();

    res.json({
      message: updatedUser.firstName + " your profile updated succesfully",
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const newPassword = req.body.password;
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Enter strong password");
    }
    const user = req.user;

    const isPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isPasswordSame) {
      throw new Error("New password should not be same as old password");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    console.log(user.password);
    user.password = passwordHash;
    await user.save();
    console.log(user.password);
    res.send("Password updated successfully");
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

module.exports = profileRouter;
