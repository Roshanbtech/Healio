import { Router } from "express";
import { AuthService } from "../services/admin/auth";
import { AuthController } from "../controllers/admin/auth";
import { AuthRepository } from "../repository/admin/auth";
import verifyToken from "../helper/accessToken";

const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

// ____________  Admin Public Auth Routes ____________ // No token required
route.post(
  "/login",
  AuthControllerInstance.loginAdmin.bind(AuthControllerInstance)
);
route.post(
  "/logout",
  AuthControllerInstance.logoutAdmin.bind(AuthControllerInstance)
);

// ___________ Admin Protected Routes are listed below ____________ // Token required - admin only
route.use(verifyToken(["admin"]));

//____________ Dashboard ______________//
route.get("/stats", AuthControllerInstance.getDashboardStats.bind(AuthControllerInstance));
route.get("/top-doctors", AuthControllerInstance.getTopDoctors.bind(AuthControllerInstance));
route.get("/top-users", AuthControllerInstance.getTopUsers.bind(AuthControllerInstance));
route.get("/analytics", AuthControllerInstance.getAppointmentAnalytics.bind(AuthControllerInstance));

// ___________ User management ____________ //
route.get(
  "/users",
  AuthControllerInstance.getUserList.bind(AuthControllerInstance)
);
route.patch(
  "/users/:id/toggle",
  AuthControllerInstance.toggleUser.bind(AuthControllerInstance)
);

// ___________ Doctor management ____________ //
route.get(
  "/doctors",
  AuthControllerInstance.getDoctorList.bind(AuthControllerInstance)
);
route.patch(
  "/doctors/:id/toggle",
  AuthControllerInstance.toggleDoctor.bind(AuthControllerInstance)
);
route.get(
  "/doctors/:id/certificates",
  AuthControllerInstance.getCertificates.bind(AuthControllerInstance)
);
route.patch(
  "/doctors/:id/certificates/accept",
  AuthControllerInstance.approveDoctor.bind(AuthControllerInstance)
);
route.patch(
  "/doctors/:id/certificates/reject",
  AuthControllerInstance.rejectDoctor.bind(AuthControllerInstance)
);

// ___________ Service management ____________ //
route.post(
  "/services",
  AuthControllerInstance.addService.bind(AuthControllerInstance)
);
route.get(
  "/services",
  AuthControllerInstance.getServices.bind(AuthControllerInstance)
);
route.patch(
  "/services/:id",
  AuthControllerInstance.editService.bind(AuthControllerInstance)
);
route.patch(
  "/services/:id/toggle",
  AuthControllerInstance.toggleService.bind(AuthControllerInstance)
);

// ___________ Coupon management ____________ //
route.get(
  "/coupons",
  AuthControllerInstance.getCoupons.bind(AuthControllerInstance)
);
route.post(
  "/coupons",
  AuthControllerInstance.createCoupon.bind(AuthControllerInstance)
);
route.patch(
  "/coupons/:id/toggle",
  AuthControllerInstance.toggleCoupon.bind(AuthControllerInstance)
);
route.patch(
  "/coupons/:id",
  AuthControllerInstance.editCoupon.bind(AuthControllerInstance)
);

//___________________Report management____________________//
route.get(
  "/reports",
  AuthControllerInstance.getReports.bind(AuthControllerInstance)
);

export default route;
