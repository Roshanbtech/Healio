import { Router } from 'express';
import { AuthRepository } from '../repository/admin/auth';
import { AuthService } from '../services/admin/auth';
import { AuthController } from '../controllers/admin/auth';


const route = Router();


const AuthRepositoryInstance = new AuthRepository;
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
