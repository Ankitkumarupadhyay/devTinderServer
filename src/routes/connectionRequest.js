const express = require("express");
const { userAuth } = require("../middleware/tokenAuth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const connectionRequestRouter = express.Router();

connectionRequestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      // console.log(fromUserId, toUserId);

      // if (fromUserId == toUserId) {
      //   throw new Error("You can't send a connection request to yourself");
      // }

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid status type: " + status);
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });
      if (existingConnectionRequest) {
        throw new Error("Connection request already exists");
      }

      const toUser = await User.findById(toUserId);

      if (!toUser) {
        throw new Error("User not found");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data: data,
      });
    } catch (err) {
      res.status(400).send("Error : " + err.message);
    }
  }
);

connectionRequestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const status = req.params.status;
      const requestId = req.params.requestId;

      if (!loggedInUser) {
        throw new Error("Please login");
      }

      const allowedUpdates = ["accepted", "rejected"];
      const isUpdateAllowed = allowedUpdates.includes(status);
      if (!isUpdateAllowed) {
        throw new Error("Invalid status type: " + status);
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        throw new Error("Connection request not found");
      }

      connectionRequest.status = status;
      const updatedConnectionRequest = await connectionRequest.save();

      res.json({
        message:
          loggedInUser.firstName + " has " + status + " connection request ",
        data: updatedConnectionRequest,
      });
    } catch (err) {
      res.status(400).send("Error : " + err.message);
    }
  }
);

module.exports = connectionRequestRouter;
