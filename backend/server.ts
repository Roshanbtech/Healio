// -----------------------IMPORTS-----------------------
//core modules and libs
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import * as rfs from 'rotating-file-stream';
import {createServer} from 'http';

//custom modules
import connectDB from './src/config/db'; //database connection
import userRoutes from './src/routes/userRoutes'; //user routes
// import doctorRoutes from './src/routes/doctorRoutes'; //doctor routes
// import adminRoutes from './src/routes/adminRoutes'; //admin routes

// -----------------------CONFIG-----------------------
//load environment variables
dotenv.config(); 
//connect to mongodb database
connectDB(); 
//initialize express app and http server
const app = express();
const server = createServer(app); //in the case of chat implementation

// -----------------------MIDDLEWARE-----------------------
//middleware to parse json and urlencoded payloads
app.use(express.json({limit: "20mb"})); //limit for json payload
app.use(express.urlencoded({limit: "20mb", extended: true})); //limit for urlencoded payload

//middleware to parse cookies
app.use(cookieParser());

//middleware to log setup with rotating log files
const logDirectory = path.join(__dirname, 'logs');

if(!fs.existsSync(logDirectory)){
    fs.mkdirSync(logDirectory);
}

const errorLogStream = rfs.createStream('error.log', {
    interval: '1d', // rotate daily
    path: logDirectory,
    maxFiles: 7, // retain log files for 7 days
});

app.use(
    morgan('combined', {
      stream: errorLogStream,
      skip: (req: Request, res: Response) => res.statusCode < 400, // Skip logs for successful responses
    })
  );

//middleware to allow cross-origin requests

const corsOptions = {
    origin: 'http://localhost:5173', // Frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'], // Allowed headers
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 204, // For OPTIONS preflight requests
};

app.use(cors(corsOptions));

// -----------------------ROUTES-----------------------
app.use('/', userRoutes); //user routes
// app.use('/doctor', doctorRoutes); //doctor routes
// app.use('/admin', adminRoutes); //admin routes

//-----------------------SERVER-----------------------
//set port 
const PORT = process.env.PORT || 5000;

//start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});