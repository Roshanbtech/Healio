import { Request, Response, NextFunction } from "express";
import userModel from "../model/userModel";
import HttpStatusCode from "../enums/httpStatusCode";

export const checkUserBlocked = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res
        .status(HttpStatusCode.Forbidden)
        .json({ message: "Blocked by admin" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
