"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./src/config/database"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
let frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
if (frontendUrl.endsWith("/")) {
    frontendUrl = frontendUrl.slice(0, -1);
}
// 1. High-fidelity dynamic CORS configuration
app.use((0, cors_1.default)({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));
// 2. Serverless database connection middleware (ensures DB is active before any route execution)
app.use(async (req, res, next) => {
    try {
        await (0, database_1.default)();
        next();
    }
    catch (err) {
        const error = err;
        console.error("Database connection failure:", error.message);
        res.status(500).json({ error: "Database connection failed: " + error.message });
    }
});
const auth_1 = __importDefault(require("./src/routes/auth"));
const connectionRequest_1 = __importDefault(require("./src/routes/connectionRequest"));
const profile_1 = __importDefault(require("./src/routes/profile"));
const user_1 = __importDefault(require("./src/routes/user"));
app.use("/", auth_1.default);
app.use("/", profile_1.default);
app.use("/", connectionRequest_1.default);
app.use("/", user_1.default);
app.get("/", (req, res) => {
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
exports.default = app;
