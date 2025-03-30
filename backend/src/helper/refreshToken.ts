import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import HTTP_statusCode from "../enums/httpStatusCode";

const refresh = (req: Request, res: Response): any => {
  console.log("Incoming Cookies Object:", req.cookies); 
  const refreshToken = req.cookies.refreshToken;
  console.log("Extracted Refresh Token:", refreshToken);

  if (!refreshToken) {
    console.log("No refresh token received!"); 
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

    console.log("Decoded Refresh Token:", decoded);

    const accessToken = jwt.sign(
      { email: decoded.email, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );

    console.log("New Access Token Generated:", accessToken);
    res.setHeader("Authorization", `Bearer ${accessToken}`);

    return res.status(HTTP_statusCode.OK).json({
      status: true,
      accessToken,
    });
  } catch (error) {
    console.error("Error in refresh token verification:", error);

    return res.status(HTTP_statusCode.Forbidden).json({
      status: false,
      message: "Invalid or expired refresh token. Please login again.",
    });
  }
};

export default refresh;
