import { Router } from "express";
import { AuthRepository } from "../repository/user/auth";
import { AuthService } from "../services/user/auth";
import { AuthController } from "../controllers/user/auth";
import { checkUserBlocked } from "../helper/authMiddleware";


const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

const asyncMiddleware = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

route.post(
  "/signUp",
  AuthControllerInstance.createUser.bind(AuthControllerInstance)
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
  asyncMiddleware(checkUserBlocked),
  AuthControllerInstance.loginUser.bind(AuthControllerInstance)
);

export default route;
