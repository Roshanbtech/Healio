import { Router } from "express";
import { AuthRepository } from "../repository/user/auth";
import { AuthService } from "../services/user/auth";
import { AuthController } from "../controllers/user/auth";
import { UserRepository } from "../repository/user/user";
import { UserService } from "../services/user/user";
import { UserController } from "../controllers/user/user";
import { checkUserBlocked } from "../helper/authMiddleware";
import { upload } from "../config/multerConfig";
import verifyToken from "../helper/accessToken";

const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

const UserRepositoryInstance = new UserRepository();
const UserServiceInstance = new UserService(UserRepositoryInstance);
const UserControllerInstance = new UserController(UserServiceInstance);

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
route.get(
  "/doctors",
  UserControllerInstance.getDoctors.bind(UserControllerInstance)
)
route.get(
  "/doctorDetails/:id",
  UserControllerInstance.getDoctorDetails.bind(UserControllerInstance)
)
route.get(
  "/profile/:id",
  UserControllerInstance.getUserProfile.bind(UserControllerInstance)
)
route.patch(
  "/editProfile/:id",
  upload.single("image"),
  UserControllerInstance.editUserProfile.bind(UserControllerInstance)
)
route.patch(
  "/changePassword/:id",
  UserControllerInstance.changePassword.bind(UserControllerInstance)
)
route.get(
  "/schedule/:id",
  UserControllerInstance.getAvailableSlots.bind(UserControllerInstance)
)
// route.use(verifyToken(["user"]));
route.post(
  "/logout",
  AuthControllerInstance.logoutUser.bind(AuthControllerInstance)
)
route.post(
  "/forgot-password/sendOtp",
  AuthControllerInstance.sendForgotPasswordOtp.bind(AuthControllerInstance)
)
route.post(
  "/forgot-password/verifyOtp",
  AuthControllerInstance.verifyForgotPasswordOtp.bind(AuthControllerInstance)
)
route.post(
  "/forgot-password/reset",
  AuthControllerInstance.resetPassword.bind(AuthControllerInstance)
)
route.get(
  "/services",
  UserControllerInstance.getServices.bind(UserControllerInstance)
)

export default route;
