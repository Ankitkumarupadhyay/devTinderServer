"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("../utils/multer"));
const authRouter = express_1.default.Router();
authRouter.post("/signup", multer_1.default.single("photoUrl"), async (req, res) => {
    try {
        const { firstName, lastName, emailId, password, age, gender, about, skills, } = req.body;
        if (!req.file) {
            res.status(400).json({ message: "Image upload failed" });
            return;
        }
        if (!firstName || !emailId || !password) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        // Check for existing email
        const userExist = await user_1.default.findOne({ emailId });
        if (userExist) {
            throw new Error("Email already exists!!!");
        }
        // Encrypt the passwords
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = new user_1.default({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
            photoUrl: req.file.path,
            about,
            skills,
        });
        if (user.skills && user.skills.length > 10) {
            throw new Error("Skills can't be more than 10");
        }
        await user.save();
        res.json({
            message: "User created successfully",
            data: user,
        });
    }
    catch (err) {
        const error = err;
        res.status(400).send(error.message);
    }
});
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId || !password || !validator_1.default.isEmail(emailId)) {
            throw new Error("Invalid credentials");
        }
        const user = await user_1.default.findOne({ emailId });
        if (!user) {
            throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password || "");
        if (isPasswordValid) {
            const token = jsonwebtoken_1.default.sign({ _id: user._id }, "Ankit@428@token");
            res.cookie("token", token, {
                httpOnly: true, // Prevent client-side access
                secure: true, // Send cookies only over HTTPS
                sameSite: "none", // Allow cross-origin requests
            });
            res.json({
                message: "Login successfull",
                data: user,
            });
        }
        else {
            throw new Error("Invalid credentials");
        }
    }
    catch (err) {
        const error = err;
        res.status(400).send("Error : " + error.message);
        console.log(error);
    }
});
authRouter.post("/logout", (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true, // Important for HTTPS
        sameSite: "none", // Allow cross-site cookies
    });
    res.send("Logged out successfully");
});
exports.default = authRouter;
