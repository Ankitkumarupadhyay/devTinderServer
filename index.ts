import express, { Request, Response } from "express";
import connectDB from "./src/config/database";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g., "http://localhost:3000"
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);

import authRouter from "./src/routes/auth";
import connectionRequestRouter from "./src/routes/connectionRequest";
import profileRouter from "./src/routes/profile";
import userRouter from "./src/routes/user";

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", userRouter);

app.get("/", (req: Request, res: Response): void => {
  res.send("Welcome");
});

const PORT = process.env.PORT || 7777;

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log("Server is listening on port " + PORT);
    });
  })
  .catch((err) => {
    console.error("Some error occurred", err);
  });
