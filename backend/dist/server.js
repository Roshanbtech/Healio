"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// -----------------------IMPORTS-----------------------
//core modules and libs
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const rfs = __importStar(require("rotating-file-stream"));
const http_1 = require("http");
//custom modules
const db_1 = __importDefault(require("./config/db")); //database connection
const socketioConfig_1 = require("./config/socketioConfig"); // socket.io configuration
const userRoutes_1 = __importDefault(require("./routes/userRoutes")); //user routes
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes")); //doctor routes
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes")); //admin routes
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
// -----------------------CONFIG-----------------------
//load environment variables
dotenv_1.default.config();
//connect to mongodb database
(0, db_1.default)();
//initialize express app and http server
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app); //in the case of chat implementation
// -----------------------MIDDLEWARE-----------------------
//middleware to parse json and urlencoded payloads
app.use(express_1.default.json({ limit: "20mb" })); //limit for json payload
app.use(express_1.default.urlencoded({ limit: "20mb", extended: true })); //limit for urlencoded payload
//middleware to parse cookies
app.use((0, cookie_parser_1.default)());
//middleware to log setup with rotating log files
const logDirectory = path_1.default.join(__dirname, "logs");
if (!fs_1.default.existsSync(logDirectory)) {
    fs_1.default.mkdirSync(logDirectory);
}
const errorLogStream = rfs.createStream("error.log", {
    interval: "1d", // rotate daily
    path: logDirectory,
    maxFiles: 7, // retain log files for 7 days
});
app.use((0, morgan_1.default)("combined", {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400, // Skip logs for successful responses
}));
//middleware to allow cross-origin requests
const corsOptions = {
    origin: "*", // Frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization"], // Allowed headers
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 204, // For OPTIONS preflight requests
};
app.use((0, cors_1.default)(corsOptions));
// -----------------------ROUTES-----------------------
app.use("/auth", protectedRoutes_1.default);
app.use("/admin", adminRoutes_1.default); //admin routes
app.use("/doctor", doctorRoutes_1.default); //doctor routes
app.use("/", userRoutes_1.default); //user routes
// -----------------------SOCKET.IO-----------------------
const io = (0, socketioConfig_1.initSocket)(server);
//-----------------------SERVER-----------------------
//set port
const PORT = process.env.PORT || 3000;
//start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
