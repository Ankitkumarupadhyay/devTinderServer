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
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL, // e.g., "http://localhost:3000"
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
}));
const auth_1 = __importDefault(require("./src/routes/auth"));
const connectionRequest_1 = __importDefault(require("./src/routes/connectionRequest"));
const profile_1 = __importDefault(require("./src/routes/profile"));
const user_1 = __importDefault(require("./src/routes/user"));
app.use("/", auth_1.default);
app.use("/", profile_1.default);
app.use("/", connectionRequest_1.default);
app.use("/", user_1.default);
app.get("/", (req, res) => {
    res.send("Welcome");
});
const PORT = process.env.PORT || 7777;
(0, database_1.default)()
    .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
        console.log("Server is listening on port " + PORT);
    });
})
    .catch((err) => {
    console.error("Some error occurred", err);
});
