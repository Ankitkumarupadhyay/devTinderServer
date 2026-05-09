import express, { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import upload from "../utils/multer";

const authRouter = express.Router();

interface SignupBody {
  firstName?: string;
  lastName?: string;
  emailId?: string;
  password?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  about?: string;
  skills?: string[];
}

authRouter.post(
  "/signup",
  upload.single("photoUrl"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        firstName,
        lastName,
        emailId,
        password,
        age,
        gender,
        about,
        skills,
      } = req.body as SignupBody;

      if (!req.file) {
        res.status(400).json({ message: "Image upload failed" });
        return;
      }

      if (!firstName || !emailId || !password) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      // Check for existing email
      const userExist = await User.findOne({ emailId });
      if (userExist) {
        throw new Error("Email already exists!!!");
      }

      // Encrypt the passwords
      const passwordHash = await bcrypt.hash(password, 10);

      const user = new User({
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
    } catch (err) {
      const error = err as Error;
      res.status(400).send(error.message);
    }
  }
);

interface LoginBody {
  emailId?: string;
  password?: string;
}

authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailId, password } = req.body as LoginBody;
    if (!emailId || !password || !validator.isEmail(emailId)) {
      throw new Error("Invalid credentials");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (isPasswordValid) {
      const token = jwt.sign({ _id: user._id }, "Ankit@428@token");

      res.cookie("token", token, {
        httpOnly: true, // Prevent client-side access
        secure: true, // Send cookies only over HTTPS
        sameSite: "none", // Allow cross-origin requests
      });
      res.json({
        message: "Login successfull",
        data: user,
      });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    const error = err as Error;
    res.status(400).send("Error : " + error.message);
    console.log(error);
  }
});

authRouter.post("/logout", (req: Request, res: Response): void => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true, // Important for HTTPS
    sameSite: "none", // Allow cross-site cookies
  });
  res.send("Logged out successfully");
});

export default authRouter;
