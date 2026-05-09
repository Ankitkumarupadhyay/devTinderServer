import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { CustomRequest } from "../types";

interface DecodedToken {
  _id: string;
  iat?: number;
  exp?: number;
}

export const userAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookies = req.cookies as { token?: string } | undefined;
    const token = cookies?.token;
    if (!token) {
      throw new Error("Please login");
    }
    const decodedObj = jwt.verify(token, "Ankit@428@token") as DecodedToken;

    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    const error = err as Error;
    res.status(400).send("ERROR : " + error.message);
  }
};
