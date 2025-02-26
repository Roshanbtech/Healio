import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import HTTP_statusCode from "../enums/httpStatusCode";
import userModel from "../model/userModel";
import doctorModel from "../model/doctorModel";

interface JwtPayload {
  email: string;
  role: string;
}

const verifyToken = (allowedRoles?: string[]): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const authHeader =
      (req.headers.authorization as string) ||
      (req.headers.Authorization as string);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_statusCode.Unauthorized).json({
        status: false,
        message: "Access token missing or malformed.",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;
      console.log("Access token decoded:", decoded);

      let user: any = null;

      if (decoded.role === "admin") {
        if (
          !process.env.ADMIN_EMAIL ||
          decoded.email !== process.env.ADMIN_EMAIL
        ) {
          return res.status(HTTP_statusCode.Forbidden).json({
            status: false,
            message: "Access denied. Unauthorized admin account.",
          });
        }
      } else if (decoded.role === "user") {
        user = await userModel.findOne({ email: decoded.email });
      } else if (decoded.role === "doctor") {
        user = await doctorModel.findOne({ email: decoded.email });
      }

      if (!user && decoded.role !== "admin") {
        return res.status(HTTP_statusCode.Forbidden).json({
          status: false,
          message: "Access denied. User not found.",
        });
      }

      if (user && user.isBlocked) {
        return res.status(HTTP_statusCode.Forbidden).json({
          status: false,
          message: `Access denied. ${
            decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1)
          } is blocked.`,
        });
      }

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res.status(HTTP_statusCode.Forbidden).json({
          status: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      (req as any).user = decoded;
      next();
    } catch (error) {
      console.error("Access token verification error:", error);
      return res.status(HTTP_statusCode.Unauthorized).json({
        status: false,
        message: "Invalid or expired access token.",
      });
    }
  };
};

export default verifyToken;
