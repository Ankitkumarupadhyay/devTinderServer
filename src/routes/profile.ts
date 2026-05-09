import express, { Response } from "express";
import { userAuth } from "../middleware/tokenAuth";
import validateEditProfileData from "../utils/validation";
import validator from "validator";
import bcrypt from "bcrypt";
import upload from "../utils/multer";
import { CustomRequest } from "../types";
import { IUser } from "../models/user";

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    res.json({
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).send("Error : " + error.message);
    console.log(error);
  }
});

interface EditProfileBody {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  photoUrl?: string;
  about?: string;
  skills?: string[];
}

profileRouter.patch(
  "/profile/edit",
  userAuth,
  upload.single("photoUrl"),
  async (req: CustomRequest, res: Response): Promise<void> => {
    try {
      const body = req.body as EditProfileBody;
      if (!validateEditProfileData(body as Record<string, string | number | string[] | undefined>)) {
        throw new Error("Invalid updates");
      }
      const user = req.user;
      if (!user) {
        throw new Error("Please login");
      }

      (Object.keys(body) as Array<keyof EditProfileBody>).forEach((key) => {
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
    } catch (err) {
      const error = err as Error;
      res.status(400).send("Error : " + error.message);
    }
  }
);

interface PasswordBody {
  password?: string;
}

profileRouter.patch("/profile/password", userAuth, async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { password: newPassword } = req.body as PasswordBody;
    if (!newPassword || !validator.isStrongPassword(newPassword)) {
      throw new Error("Enter strong password");
    }
    const user = req.user;
    if (!user) {
      throw new Error("Please login");
    }

    const isPasswordSame = await bcrypt.compare(newPassword, user.password || "");
    if (isPasswordSame) {
      throw new Error("New password should not be same as old password");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.password = passwordHash;
    await user.save();
    res.send("Password updated successfully");
  } catch (err) {
    const error = err as Error;
    res.status(400).send("Error : " + error.message);
  }
});

export default profileRouter;
