import { Router } from "express";
import { AuthRepository } from "../repository/doctor/auth";
import { AuthService } from "../services/doctor/auth";
import { AuthController } from "../controllers/doctor/auth";
import { DoctorService } from "../services/doctor/doctor";
import { DoctorController } from "../controllers/doctor/doctor";
import { DoctorRepository } from "../repository/doctor/doctor";
import { checkDoctorBlocked } from "../helper/doctorAuthMiddleware";
import { upload } from "../config/multerConfig";
import verifyToken from '../helper/accessToken';

const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

const DoctorRepositoryInstance = new DoctorRepository();
const DoctorServiceInstance = new DoctorService(DoctorRepositoryInstance);
const DoctorControllerInstance = new DoctorController(DoctorServiceInstance);

const asyncMiddleware = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

route.post(
  "/signUp",
  AuthControllerInstance.createDoctor.bind(AuthControllerInstance)
);
route.post(
  "/sendOtp",
  AuthControllerInstance.sendOtp.bind(AuthControllerInstance)
);
route.post(
  "/resendOtp",
  AuthControllerInstance.resendOtp.bind(AuthControllerInstance)
);
route.post(
  "/auth/google",
  AuthControllerInstance.handleGoogleLogin.bind(AuthControllerInstance)
);
route.post(
  "/login",
  asyncMiddleware(checkDoctorBlocked),
  AuthControllerInstance.loginDoctor.bind(AuthControllerInstance)
);
route.get(
  "/services",
  DoctorControllerInstance.getServices.bind(DoctorControllerInstance)
);
route.post(
  "/qualifications",
  upload.array("certificate", 5),
  DoctorControllerInstance.addQualification.bind(DoctorControllerInstance)
);
route.get(
  "/getQual/:id",
  DoctorControllerInstance.getQualifications.bind(DoctorControllerInstance)
);
// route.use(verifyToken(["doctor"]));

export default route;
