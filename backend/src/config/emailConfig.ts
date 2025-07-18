import {Express} from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendMail = async (
  email: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL as string,
        pass: process.env.PASSWORD as string,
      },
    });

    const mailOptions: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html?: string;
    } = {
      from: process.env.EMAIL as string,
      to: email,
      subject,
      text,
    };

    if (html && !text.trim().startsWith("<html>")) {
      mailOptions.html = html;
    }

    transporter.sendMail(mailOptions, (error: Error|null, info: any) => {
      if (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Unknown error while sending email");
        }
        resolve(false);
      } else {
        console.log("Email sent: " + info.response);
        resolve(true);
      }
    });
  });
};

export default sendMail;
