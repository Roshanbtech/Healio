import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import HTTP_statusCode from "../enums/httpStatusCode";

const refresh = (req: Request, res: Response): any => {
  const refreshToken = req.cookies.refreshToken; // Extract refresh token from cookies

  // Ensure refresh token exists
  if (!refreshToken) {
    return res.status(HTTP_statusCode.Unauthorized).json({
      status: false,
      message: "Unauthorized. No refresh token found.",
    });
  }

  try {
    // Verify the refresh token and extract the user data (email, role)
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { email: string, role: string };

    // Check if the decoded token has the necessary properties
    if (!decoded || !decoded.email || !decoded.role) {
      return res.status(HTTP_statusCode.Forbidden).json({
        status: false,
        message: "Invalid refresh token.",
      });
    }

    // Generate a new access token based on the decoded user info
    const accessToken = jwt.sign(
      { email: decoded.email, role: decoded.role }, // Use the dynamic role from refresh token
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" } // Short-lived access token for security
    );

    // Send the new access token in the response
    return res.status(HTTP_statusCode.OK).json({
      status: true,
      accessToken,
    });
  } catch (error) {
    console.error("Error in refresh token:", error);

    // Handle expired or invalid refresh tokens
    return res.status(HTTP_statusCode.Forbidden).json({
      status: false,
      message: "Invalid or expired refresh token. Please login again.",
    });
  }
};

export default refresh;



// import express from "express";
// import jwt from "jsonwebtoken";
// import { Request, Response } from "express";
// import HTTP_statusCode from "../enums/httpStatusCode";

// const refresh = (req: Request, res: Response): any => {
//   const refreshToken = req.cookies.refreshToken;

//   // Ensure refresh token exists
//   if (!refreshToken) {
//     return res.status(HTTP_statusCode.Unauthorized).json({
//       status: false,
//       message: "Unauthorized. No refresh token found.",
//     });
//   }

//   try {
//     // Verify the refresh token
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

//     // Generate a new access token for the admin
//     const accessToken = jwt.sign(
//       { email: (decoded as any).email, role: "admin" }, // Keep the role as "admin"
//       process.env.ACCESS_TOKEN_SECRET!,
//       { expiresIn: "15m" } // Short-lived access token
//     );

//     // Send the new access token in the response
//     return res.status(HTTP_statusCode.OK).json({
//       status: true,
//       accessToken,
//     });
//   } catch (error) {
//     console.error("Error in refresh token:", error);
//     return res.status(HTTP_statusCode.Forbidden).json({
//       status: false,
//       message: "Invalid or expired refresh token. Please login again.",
//     });
//   }
// };

// export default refresh;
