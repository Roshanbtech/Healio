import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import HTTP_statusCode from "../enums/httpStatusCode";

const refresh = (req: Request, res: Response): any => {
  const refreshToken = req.cookies.refreshToken; 

  if (!refreshToken) {
    return res.status(HTTP_statusCode.Unauthorized).json({
      status: false,
      message: "Unauthorized. No refresh token found.",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { email: string; role: string };

    if (!decoded || !decoded.email || !decoded.role) {
      return res.status(HTTP_statusCode.Forbidden).json({
        status: false,
        message: "Invalid refresh token.",
      });
    }

    const accessToken = jwt.sign(
      { email: decoded.email, role: decoded.role }, 
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" } 
    );

    return res.status(HTTP_statusCode.OK).json({
      status: true,
      accessToken,
    });
  } catch (error) {
    console.error("Error in refresh token:", error);

    return res.status(HTTP_statusCode.Forbidden).json({
      status: false,
      message: "Invalid or expired refresh token. Please login again.",
    });
  }
};

export default refresh;
