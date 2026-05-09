"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const userAuth = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        const token = cookies?.token;
        if (!token) {
            throw new Error("Please login");
        }
        const decodedObj = jsonwebtoken_1.default.verify(token, "Ankit@428@token");
        const { _id } = decodedObj;
        const user = await user_1.default.findById(_id);
        if (!user) {
            throw new Error("User not found");
        }
        req.user = user;
        next();
    }
    catch (err) {
        const error = err;
        res.status(400).send("ERROR : " + error.message);
    }
};
exports.userAuth = userAuth;
