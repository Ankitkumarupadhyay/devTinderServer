"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenAuth_1 = require("../middleware/tokenAuth");
const connectionRequest_1 = __importDefault(require("../models/connectionRequest"));
const user_1 = __importDefault(require("../models/user"));
const userRouter = express_1.default.Router();
userRouter.get("/user/connections", tokenAuth_1.userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("Please login");
        }
        const userId = user._id;
        const connectionRequests = (await connectionRequest_1.default.find({
            $or: [
                { toUserId: userId, status: "accepted" },
                { fromUserId: userId, status: "accepted" },
            ],
        })
            .populate("fromUserId", ["firstName", "lastName", "photoUrl"])
            .populate("toUserId", ["firstName", "lastName", "photoUrl"]));
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
            }
            else {
                return row.fromUserId;
            }
        });
        res.json({
            message: "connections of " + user.firstName,
            data: data,
        });
    }
    catch (err) {
        const error = err;
        res.status(400).send("ERROR : " + error.message);
    }
});
userRouter.get("/user/requests", tokenAuth_1.userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("Please login");
        }
        const userId = user._id;
        const connectionRequests = await connectionRequest_1.default.find({
            toUserId: userId,
            status: "interested",
        }).populate("fromUserId", ["firstName", "lastName", "photoUrl"]);
        res.json({
            message: "connection request of " + user.firstName,
            data: connectionRequests,
        });
    }
    catch (err) {
        const error = err;
        res.status(400).send("ERROR : " + error.message);
    }
});
userRouter.get("/user/feed", tokenAuth_1.userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("Please login");
        }
        const userId = user._id;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;
        const USER_SAFE_DATA = "firstName lastName age gender photoUrl skills about";
        const allConnections = await connectionRequest_1.default.find({
            $or: [{ toUserId: userId }, { fromUserId: userId }],
        }).select("fromUserId toUserId");
        const hideUsersFromFeed = new Set();
        allConnections.forEach((connection) => {
            hideUsersFromFeed.add(connection.fromUserId.toString());
            hideUsersFromFeed.add(connection.toUserId.toString());
        });
        const allUsers = await user_1.default.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } },
                { _id: { $ne: userId } },
            ],
        })
            .select(USER_SAFE_DATA)
            .skip(skip)
            .limit(limit);
        res.send(allUsers);
    }
    catch (err) {
        const error = err;
        res.status(400).send("ERROR : " + error.message);
    }
});
exports.default = userRouter;
