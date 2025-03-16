import { Router } from "express";
import { AuthRepository } from "../repository/doctor/auth";
import { AuthService } from "../services/doctor/auth";
import { AuthController } from "../controllers/doctor/auth";
import { DoctorService } from "../services/doctor/doctor";
import { DoctorController } from "../controllers/doctor/doctor";
import { DoctorRepository } from "../repository/doctor/doctor";
import { upload } from "../config/multerConfig";
import verifyToken from "../helper/accessToken";

const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

const DoctorRepositoryInstance = new DoctorRepository();
const DoctorServiceInstance = new DoctorService(DoctorRepositoryInstance);
const DoctorControllerInstance = new DoctorController(DoctorServiceInstance);

// ____________  Doctor Public Auth Routes ____________ // No token required
route.post(
  "/signUp",
  AuthControllerInstance.createDoctor.bind(AuthControllerInstance)
);
route.post(
  "/login",
  AuthControllerInstance.loginDoctor.bind(AuthControllerInstance)
);
route.post(
  "/auth/google",
  AuthControllerInstance.handleGoogleLogin.bind(AuthControllerInstance)
);


//_____________  Otp and password recovery _____________//
route.post(
  "/sendOtp",
  AuthControllerInstance.sendOtp.bind(AuthControllerInstance)
);
route.post(
  "/resendOtp",
  AuthControllerInstance.resendOtp.bind(AuthControllerInstance)
);
route.post(
  "/forgot-password/sendOtp",
  AuthControllerInstance.sendForgotPasswordOtp.bind(AuthControllerInstance)
);
route.post(
  "/forgot-password/verifyOtp",
  AuthControllerInstance.verifyForgotPasswordOtp.bind(AuthControllerInstance)
);
route.post(
  "/forgot-password/reset",
  AuthControllerInstance.resetPassword.bind(AuthControllerInstance)
);

//_____________ public data endpoints _______________//
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
  "/qualifications/:id",
  DoctorControllerInstance.getQualifications.bind(DoctorControllerInstance)
);

// ___________ Doctor Protected Routes ____________ // Token required - doctor only
route.use(verifyToken(["doctor"]));

//____________ Profile Management _____________ //
route.get(
  "/profile/:id",
  DoctorControllerInstance.getDoctorProfile.bind(DoctorControllerInstance)
);
route.patch(
  "/profile/:id",
  upload.single("image"),
  DoctorControllerInstance.editDoctorProfile.bind(DoctorControllerInstance)
);
route.patch(
  "/profile/:id/password",
  DoctorControllerInstance.changePassword.bind(DoctorControllerInstance)
);

//____________ Schedule Management _____________ //
route.post(
  "/schedule",
  DoctorControllerInstance.addSchedule.bind(DoctorControllerInstance)
);
route.get(
  "/schedule/:id",
  DoctorControllerInstance.getSchedule.bind(DoctorControllerInstance)
);

// _____________ Patient and their appointments _____________ //
route.get(
  "/users",
  DoctorControllerInstance.getUsers.bind(DoctorControllerInstance)
);

route.get(
  "/appointment-users/:id",
  DoctorControllerInstance.getAppointmentUsers.bind(DoctorControllerInstance)
);

route.post(
  "/chatImgUploads/:id",
  upload.single("image"),
  DoctorControllerInstance.chatImageUploads.bind(DoctorControllerInstance)
);

route.get(
  "/appointments/:id",
  DoctorControllerInstance.getAppointments.bind(DoctorControllerInstance)
)

//appointment status update routes......................................
route.patch(
  "/appointments/:id/accept",
  DoctorControllerInstance.acceptAppointment.bind(DoctorControllerInstance)
)

route.patch(
  "/appointments/:id/complete",
  DoctorControllerInstance.completeAppointment.bind(DoctorControllerInstance)
)

route.patch(
  "/appointments/:id/reschedule",
  DoctorControllerInstance.rescheduleAppointment.bind(DoctorControllerInstance)
)

route.get(
  "/slots/:id",
  DoctorControllerInstance.getDoctorAvailableSlots.bind(DoctorControllerInstance)
);

//_____________ Doctor Dashboard ______________//
route.get(
  "/dashboard/:id",
  DoctorControllerInstance.getDashboardHome.bind(DoctorControllerInstance)
)
route.get(
  "/dashboard-stats/:id",
  DoctorControllerInstance.getDashboardStats.bind(DoctorControllerInstance)
)

route.get(
  "/dashboard-chart/:id",
  DoctorControllerInstance.getGrowthData.bind(DoctorControllerInstance)
)

route.post(
  "/logout",
  AuthControllerInstance.logoutDoctor.bind(AuthControllerInstance)
)

export default route;
