import {Router} from 'express';
import { AuthRepository } from "../repository/user/auth";
import { AuthService } from "../services/user/auth";
import { AuthController } from "../controllers/user/auth";


const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

route.post('/signUp', AuthControllerInstance.createUser.bind(AuthControllerInstance));
route.post('/sendOtp', AuthControllerInstance.sendOtp.bind(AuthControllerInstance));
route.post("/resendOtp", AuthControllerInstance.resendOtp.bind(AuthControllerInstance));
route.post('/auth/google', AuthControllerInstance.handleGoogleLogin.bind(AuthControllerInstance));
// route.post('/login', AuthControllerInstance.loginUser.bind(AuthControllerInstance));

export default route;
