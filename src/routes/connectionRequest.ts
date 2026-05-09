import express, { Response } from "express";
import { userAuth } from "../middleware/tokenAuth";
import ConnectionRequest from "../models/connectionRequest";
import User from "../models/user";
import { CustomRequest } from "../types";

const connectionRequestRouter = express.Router();

interface SendParams {
  status?: string;
  toUserId?: string;
}

connectionRequestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const fromUserId = req.user?._id;
      const { status, toUserId } = req.params as Record<keyof SendParams, string>;

      if (!fromUserId) {
        throw new Error("Please login");
      }

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
          req.user?.firstName + " is " + status + " in " + toUser.firstName,
        data: data,
      });
    } catch (err) {
      const error = err as Error;
      res.status(400).send("Error : " + error.message);
    }
  }
);

interface ReviewParams {
  status?: string;
  requestId?: string;
}

connectionRequestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params as Record<keyof ReviewParams, string>;

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

      connectionRequest.status = status as "accepted" | "rejected";
      const updatedConnectionRequest = await connectionRequest.save();

      res.json({
        message:
          loggedInUser.firstName + " has " + status + " connection request ",
        data: updatedConnectionRequest,
      });
    } catch (err) {
      const error = err as Error;
      res.status(400).send("Error : " + error.message);
    }
  }
);

export default connectionRequestRouter;
