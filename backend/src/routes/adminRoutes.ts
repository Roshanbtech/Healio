import { Router } from "express";
import { AuthService } from "../services/admin/auth";
import { AuthController } from "../controllers/admin/auth";
import { AuthRepository } from "../repository/admin/auth";
import verifyToken from "../helper/accessToken";

const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

route.post(
  "/login",
  AuthControllerInstance.loginAdmin.bind(AuthControllerInstance)
);
route.post(
  "/logout",
  AuthControllerInstance.logoutAdmin.bind(AuthControllerInstance)
)
route.use(verifyToken(["admin"]));
route.get(
  "/getUsers",
  AuthControllerInstance.getUserList.bind(AuthControllerInstance)
);
route.get(
  "/getDoctors",
  AuthControllerInstance.getDoctorList.bind(AuthControllerInstance)
);
route.patch(
  "/toggleUser/:id",
  AuthControllerInstance.toggleUser.bind(AuthControllerInstance)
);
route.patch(
  "/toggleDoctor/:id",
  AuthControllerInstance.toggleDoctor.bind(AuthControllerInstance)
);
route.post(
  "/addService",
  AuthControllerInstance.addService.bind(AuthControllerInstance)
);
route.get(
  "/services",
  AuthControllerInstance.getServices.bind(AuthControllerInstance)
);
route.patch(
  "/updateService/:id",
  AuthControllerInstance.editService.bind(AuthControllerInstance)
);
route.patch(
  "/toggleService/:id",
  AuthControllerInstance.toggleService.bind(AuthControllerInstance)
);
route.get(
  "/docCert/:id",
  AuthControllerInstance.getCertificates.bind(AuthControllerInstance)
);
route.patch(
  "/docCertAccept/:id",
  AuthControllerInstance.approveDoctor.bind(AuthControllerInstance)
);
route.patch(
  "/docCertReject/:id",
  AuthControllerInstance.rejectDoctor.bind(AuthControllerInstance)
);

export default route;
