"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendMail = async (email, subject, text, html) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: text,
        };
        if (html && !text.trim().startsWith("<html>")) {
            mailOptions.html = html;
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                resolve(false);
            }
            else {
                console.log("Email sent: " + info.response);
                resolve(true);
            }
        });
    });
};
exports.default = sendMail;
