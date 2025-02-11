// ../helper/accessToken.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import HTTP_statusCode from "../enums/httpStatusCode";

interface JwtPayload {
  email: string;
  role: string;
}

const verifyToken = (allowedRoles?: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(HTTP_statusCode.Unauthorized).json({
        status: false,
        message: "Access token missing or malformed.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        res.status(HTTP_statusCode.Forbidden).json({
          status: false,
          message: "Access denied. Insufficient permissions.",
        });
        return;
      }

      (req as any).user = decoded;
      next();
    } catch (error) {
      console.error("Access token verification error:", error);
      res.status(HTTP_statusCode.Forbidden).json({
        status: false,
        message: "Invalid or expired access token.",
      });
    }
  };
};

export default verifyToken;
