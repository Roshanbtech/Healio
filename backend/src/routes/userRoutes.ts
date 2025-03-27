import { Router } from "express";
import { AuthRepository } from "../repository/user/auth";
import { AuthService } from "../services/user/auth";
import { AuthController } from "../controllers/user/auth";
import { UserRepository } from "../repository/user/user";
import { UserService } from "../services/user/user";
import { UserController } from "../controllers/user/user";
import { upload } from "../config/multerConfig";
import { BookingRepository } from "../repository/user/booking";
import { BookingService } from "../services/user/booking";
import { BookingController } from "../controllers/user/booking";
import verifyToken from "../helper/accessToken";

const route = Router();

const AuthRepositoryInstance = new AuthRepository();
const AuthServiceInstance = new AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new AuthController(AuthServiceInstance);

const UserRepositoryInstance = new UserRepository();
const UserServiceInstance = new UserService(UserRepositoryInstance);
const UserControllerInstance = new UserController(UserServiceInstance);

const BookingRepositoryInstance = new BookingRepository();
const BookingServiceInstance = new BookingService(BookingRepositoryInstance);
const BookingControllerInstance = new BookingController(BookingServiceInstance);

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
route.get(
  "/services",
  UserControllerInstance.getServices.bind(UserControllerInstance)
);

route.post(
  "/login",
  AuthControllerInstance.loginUser.bind(AuthControllerInstance)
);

route.use(verifyToken(["user"]));

route.get(
  "/doctors",
  UserControllerInstance.getDoctors.bind(UserControllerInstance)
);
route.get(
  "/doctorDetails/:id",
  UserControllerInstance.getDoctorDetails.bind(UserControllerInstance)
);
route.get(
  "/profile/:id",
  UserControllerInstance.getUserProfile.bind(UserControllerInstance)
);
route.patch(
  "/editProfile/:id",
  upload.single("image"),
  UserControllerInstance.editUserProfile.bind(UserControllerInstance)
);
route.patch(
  "/changePassword/:id",
  UserControllerInstance.changePassword.bind(UserControllerInstance)
);
route.get(
  "/schedule/:id",
  UserControllerInstance.getAvailableSlots.bind(UserControllerInstance)
);

//chat routes
route.post(
  "/chatImgUploads/:id",
  upload.single("image"),
  UserControllerInstance.chatImageUploads.bind(UserControllerInstance)
);

route.get(
  "/appointment-doctors/:id",
  UserControllerInstance.getAppointmentDoctors.bind(UserControllerInstance)
);
//
route.post(
  "/logout",
  AuthControllerInstance.logoutUser.bind(AuthControllerInstance)
);
route.get(
  "/coupons",
  BookingControllerInstance.getCoupons.bind(BookingControllerInstance)
);

route.post(
  "/bookings",
  BookingControllerInstance.bookAppointment.bind(BookingControllerInstance)
);
route.post(
  "/verifyBooking",
  BookingControllerInstance.verifyBooking.bind(BookingControllerInstance)
);
route.post(
  "/retryPayment/:bookingId",
  BookingControllerInstance.retryPayment.bind(BookingControllerInstance)
);

route.post(
  "/bookings/wallet",
  BookingControllerInstance.bookAppointmentUsingWallet.bind(
    BookingControllerInstance
  )
)
route.get(
  "/appointments/:id",
  BookingControllerInstance.getPatientAppointments.bind(
    BookingControllerInstance
  )
);
route.patch(
  "/appointments/:id/medical-records",
  BookingControllerInstance.addMedicalRecord.bind(BookingControllerInstance)
);
route.patch(
  "/appointments/:id/cancel",
  BookingControllerInstance.cancelAppointment.bind(BookingControllerInstance)
);

route.get(
  "/appointments/doctor/:id",
  BookingControllerInstance.getDoctorAppointments.bind(
    BookingControllerInstance)
);

route.patch(
  "/appointments/:id/review",
  BookingControllerInstance.addReviewForDoctor.bind(BookingControllerInstance)
);

export default route;
