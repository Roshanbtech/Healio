import {Router} from "express";
import { AuthRepository } from "../repository/doctor/auth";
import { AuthService } from "../services/doctor/auth";
import { AuthController } from "../controllers/doctor/auth";



const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance)



route.post('/signUp', AuthControllerInstance.createDoctor.bind(AuthControllerInstance));



export default route;