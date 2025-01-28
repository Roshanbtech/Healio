import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendMail = async (email: string, subject: string, text: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL as string,
        pass: process.env.PASSWORD as string,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL as string,
      to: email,
      subject: subject,
      text: text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        resolve(false);  
      } else {
        console.log("Email sent: " + info.response);
        resolve(true); 
      }
    });
  });
};

export default sendMail;
