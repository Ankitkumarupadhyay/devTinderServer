"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenAuth_1 = require("../middleware/tokenAuth");
const validation_1 = __importDefault(require("../utils/validation"));
const validator_1 = __importDefault(require("validator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const multer_1 = __importDefault(require("../utils/multer"));
const profileRouter = express_1.default.Router();
profileRouter.get("/profile/view", tokenAuth_1.userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            message: "Profile fetched successfully",
            data: user,
        });
    }
    catch (err) {
        const error = err;
        res.status(400).send("Error : " + error.message);
        console.log(error);
    }
});
profileRouter.patch("/profile/edit", tokenAuth_1.userAuth, multer_1.default.single("photoUrl"), async (req, res) => {
    try {
        const body = req.body;
        if (!(0, validation_1.default)(body)) {
            throw new Error("Invalid updates");
        }
        const user = req.user;
        if (!user) {
            throw new Error("Please login");
        }
        Object.keys(body).forEach((key) => {
            const value = body[key];
            if (value !== undefined) {
                user.set(key, value);
            }
        });
        if (req.file) {
            user.set("photoUrl", req.file.path);
        }
        const updatedUser = await user.save();
        res.json({
            message: updatedUser.firstName + " your profile updated succesfully",
            data: updatedUser,
        });
    }
    catch (err) {
        const error = err;
        res.status(400).send("Error : " + error.message);
    }
});
profileRouter.patch("/profile/password", tokenAuth_1.userAuth, async (req, res) => {
    try {
        const { password: newPassword } = req.body;
        if (!newPassword || !validator_1.default.isStrongPassword(newPassword)) {
            throw new Error("Enter strong password");
        }
        const user = req.user;
        if (!user) {
            throw new Error("Please login");
        }
        const isPasswordSame = await bcrypt_1.default.compare(newPassword, user.password || "");
        if (isPasswordSame) {
            throw new Error("New password should not be same as old password");
        }
        const passwordHash = await bcrypt_1.default.hash(newPassword, 10);
        user.password = passwordHash;
        await user.save();
        res.send("Password updated successfully");
    }
    catch (err) {
        const error = err;
        res.status(400).send("Error : " + error.message);
    }
});
exports.default = profileRouter;
