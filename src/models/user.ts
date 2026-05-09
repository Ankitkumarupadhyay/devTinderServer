import mongoose, { Document, Schema, Model } from "mongoose";
import validator from "validator";

export interface IUser {
  firstName: string;
  lastName?: string;
  emailId: string;
  password?: string;
  age?: number;
  skills: string[];
  photoUrl: string;
  gender?: "Male" | "Female" | "Other";
  about: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Enter valid email id" + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value: string) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password" + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    skills: {
      type: [String],
      default: [],
    },
    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShg8keaWuTWemET3-1mWqZae05N8W6SLGgGg&s",
    },
    gender: {
      type: String,
      validate(value: string) {
        if (!["Male", "Female", "Other"].includes(value)) {
          throw new Error("Please enter valid gender");
        }
      },
    },
    about: {
      type: String,
      default: "Hii there , I'm using devTinder",
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>("User", userSchema);

export default User;
