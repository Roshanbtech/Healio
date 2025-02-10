import { Request, Response, NextFunction } from "express";
import doctorModel from "../model/doctorModel";
import HttpStatusCode from "../enums/httpStatusCode";

// Middleware to check if doctor is blocked
export const checkDoctorBlocked = async (
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

    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Doctor not found" });
    }

    if (doctor.isBlocked) {
      return res
        .status(HttpStatusCode.Forbidden)
        .json({ message: "Doctor is blocked by admin" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
