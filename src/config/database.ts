import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error("MONGODB_URL is not defined in environment variables");
  }
  await mongoose.connect(mongoUrl);
};

export default connectDB;
