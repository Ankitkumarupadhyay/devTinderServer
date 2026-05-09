import express, { Request, Response, NextFunction } from "express";
import connectDB from "./src/config/database";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

let frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
if (frontendUrl.endsWith("/")) {
  frontendUrl = frontendUrl.slice(0, -1);
}

// 1. High-fidelity dynamic CORS configuration
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// 2. Serverless database connection middleware (ensures DB is active before any route execution)
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    const error = err as Error;
    console.error("Database connection failure:", error.message);
    res.status(500).json({ error: "Database connection failed: " + error.message });
  }
});

import authRouter from "./src/routes/auth";
import connectionRequestRouter from "./src/routes/connectionRequest";
import profileRouter from "./src/routes/profile";
import userRouter from "./src/routes/user";

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", userRouter);

app.get("/", (req: Request, res: Response): void => {
  res.send("Welcome to DevTinder Backend API");
});

// 3. Persistent Port Listener for Local Development
const PORT = process.env.PORT || 7777;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log("Local server is listening on port " + PORT);
  });
}

// 4. Export Express App default handler for Vercel Serverless Hosting compatibility
export default app;
