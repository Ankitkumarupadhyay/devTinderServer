const express = require("express");
const { userAuth } = require("../middleware/tokenAuth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const User = require("../models/user");
const { connection } = require("mongoose");

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: userId, status: "accepted" },
        { fromUserId: userId, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName", "photoUrl"])
      .populate("toUserId", ["firstName", "lastName", "photoUrl"]);
    if (!connectionRequest) {
      throw new Error("No connections found !!!, Make new connections ");
    }

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === userId.toString()) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });
    res.json({
      message: "connections of " + user.firstName,
      data: data,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    const connectionRequest = await ConnectionRequest.find({
      toUserId: userId,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName", "photoUrl"]);
    if (!connectionRequest) {
      throw new Error("No  connection request found");
    }
    res.json({
      message: "connection request of " + user.firstName,
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;
    const USER_SAFE_DATA =
      "firstName lastName age gender photoUrl skills about";

    const allConnections = await ConnectionRequest.find({
      $or: [{ toUserId: userId }, { fromUserId: userId }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();

    allConnections.forEach((connection) => {
      hideUsersFromFeed.add(connection.fromUserId.toString());
      hideUsersFromFeed.add(connection.toUserId.toString());
    });

    const allUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: userId } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.send(allUsers);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = userRouter;
