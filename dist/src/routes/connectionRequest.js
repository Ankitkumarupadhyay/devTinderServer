"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenAuth_1 = require("../middleware/tokenAuth");
const connectionRequest_1 = __importDefault(require("../models/connectionRequest"));
const user_1 = __importDefault(require("../models/user"));
const connectionRequestRouter = express_1.default.Router();
connectionRequestRouter.post("/request/send/:status/:toUserId", tokenAuth_1.userAuth, async (req, res) => {
    try {
        const fromUserId = req.user?._id;
        const { status, toUserId } = req.params;
        if (!fromUserId) {
            throw new Error("Please login");
        }
        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            throw new Error("Invalid status type: " + status);
        }
        const existingConnectionRequest = await connectionRequest_1.default.findOne({
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
        const toUser = await user_1.default.findById(toUserId);
        if (!toUser) {
            throw new Error("User not found");
        }
        const connectionRequest = new connectionRequest_1.default({
            fromUserId,
            toUserId,
            status,
        });
        const data = await connectionRequest.save();
        res.json({
            message: req.user?.firstName + " is " + status + " in " + toUser.firstName,
            data: data,
        });
    }
    catch (err) {
        const error = err;
        res.status(400).send("Error : " + error.message);
    }
});
connectionRequestRouter.post("/request/review/:status/:requestId", tokenAuth_1.userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        if (!loggedInUser) {
            throw new Error("Please login");
        }
        const allowedUpdates = ["accepted", "rejected"];
        const isUpdateAllowed = allowedUpdates.includes(status);
        if (!isUpdateAllowed) {
            throw new Error("Invalid status type: " + status);
        }
        const connectionRequest = await connectionRequest_1.default.findOne({
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
            message: loggedInUser.firstName + " has " + status + " connection request ",
            data: updatedConnectionRequest,
        });
    }
    catch (err) {
        const error = err;
        res.status(400).send("Error : " + error.message);
    }
});
exports.default = connectionRequestRouter;
