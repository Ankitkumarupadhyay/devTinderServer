import express, { Response } from "express";
import { userAuth } from "../middleware/tokenAuth";
import ConnectionRequest from "../models/connectionRequest";
import User from "../models/user";
import { CustomRequest } from "../types";
import { Document, Types } from "mongoose";

const userRouter = express.Router();

export interface IPopulatedUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName?: string;
  photoUrl: string;
}

export interface IPopulatedConnectionRequest extends Document {
  fromUserId: IPopulatedUser;
  toUserId: IPopulatedUser;
  status: "accepted" | "interested" | "ignored" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

userRouter.get("/user/connections", userAuth, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("Please login");
    }
    const userId = user._id as Types.ObjectId;

    const connectionRequests = (await ConnectionRequest.find({
      $or: [
        { toUserId: userId, status: "accepted" },
        { fromUserId: userId, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName", "photoUrl"])
      .populate("toUserId", ["firstName", "lastName", "photoUrl"])) as object as IPopulatedConnectionRequest[];

    if (!connectionRequests || connectionRequests.length === 0) {
      res.json({
        message: "No connections found !!!, Make new connections ",
        data: [],
      });
      return;
    }

    const data = connectionRequests.map((row) => {
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
    const error = err as Error;
    res.status(400).send("ERROR : " + error.message);
  }
});

userRouter.get("/user/requests", userAuth, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("Please login");
    }
    const userId = user._id;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: userId,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName", "photoUrl"]);

    res.json({
      message: "connection request of " + user.firstName,
      data: connectionRequests,
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).send("ERROR : " + error.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("Please login");
    }
    const userId = user._id;
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 10;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;
    const USER_SAFE_DATA = "firstName lastName age gender photoUrl skills about";

    const allConnections = await ConnectionRequest.find({
      $or: [{ toUserId: userId }, { fromUserId: userId }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set<string>();

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
    const error = err as Error;
    res.status(400).send("ERROR : " + error.message);
  }
});

export default userRouter;
