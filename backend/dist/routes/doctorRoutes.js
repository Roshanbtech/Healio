"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../repository/doctor/auth");
const auth_2 = require("../services/doctor/auth");
const auth_3 = require("../controllers/doctor/auth");
const doctor_1 = require("../services/doctor/doctor");
const doctor_2 = require("../controllers/doctor/doctor");
const doctor_3 = require("../repository/doctor/doctor");
const prescription_1 = require("../repository/doctor/prescription");
const prescription_2 = require("../services/doctor/prescription");
const prescription_3 = require("../controllers/doctor/prescription");
const multerConfig_1 = require("../config/multerConfig");
const accessToken_1 = __importDefault(require("../helper/accessToken"));
const route = (0, express_1.Router)();
const AuthRepositoryInstance = new auth_1.AuthRepository();
const AuthServiceInstance = new auth_2.AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new auth_3.AuthController(AuthServiceInstance);
const DoctorRepositoryInstance = new doctor_3.DoctorRepository();
const DoctorServiceInstance = new doctor_1.DoctorService(DoctorRepositoryInstance);
const DoctorControllerInstance = new doctor_2.DoctorController(DoctorServiceInstance);
const PrescriptionRepositoryInstance = new prescription_1.PrescriptionRepository();
const PrescriptionServiceInstance = new prescription_2.PrescriptionService(PrescriptionRepositoryInstance);
const PrescriptionControllerInstance = new prescription_3.PrescriptionController(PrescriptionServiceInstance);
// ____________  Doctor Public Auth Routes ____________ // No token required
route.post("/signUp", AuthControllerInstance.createDoctor.bind(AuthControllerInstance));
route.post("/login", AuthControllerInstance.loginDoctor.bind(AuthControllerInstance));
route.post("/auth/google", AuthControllerInstance.handleGoogleLogin.bind(AuthControllerInstance));
//_____________  Otp and password recovery _____________//
route.post("/sendOtp", AuthControllerInstance.sendOtp.bind(AuthControllerInstance));
route.post("/resendOtp", AuthControllerInstance.resendOtp.bind(AuthControllerInstance));
route.post("/forgot-password/sendOtp", AuthControllerInstance.sendForgotPasswordOtp.bind(AuthControllerInstance));
route.post("/forgot-password/verifyOtp", AuthControllerInstance.verifyForgotPasswordOtp.bind(AuthControllerInstance));
route.post("/forgot-password/reset", AuthControllerInstance.resetPassword.bind(AuthControllerInstance));
//_____________ public data endpoints _______________//
route.get("/services", DoctorControllerInstance.getServices.bind(DoctorControllerInstance));
route.post("/qualifications", multerConfig_1.upload.array("certificate", 5), DoctorControllerInstance.addQualification.bind(DoctorControllerInstance));
route.get("/qualifications/:id", DoctorControllerInstance.getQualifications.bind(DoctorControllerInstance));
// ___________ Doctor Protected Routes ____________ // Token required - doctor only
route.use((0, accessToken_1.default)(["doctor"]));
//____________ Profile Management _____________ //
route.get("/profile/:id", DoctorControllerInstance.getDoctorProfile.bind(DoctorControllerInstance));
route.patch("/profile/:id", multerConfig_1.upload.single("image"), DoctorControllerInstance.editDoctorProfile.bind(DoctorControllerInstance));
route.patch("/profile/:id/password", DoctorControllerInstance.changePassword.bind(DoctorControllerInstance));
//____________ Schedule Management _____________ //
route.post("/schedule", DoctorControllerInstance.addSchedule.bind(DoctorControllerInstance));
route.get("/schedule/:id", DoctorControllerInstance.getSchedule.bind(DoctorControllerInstance));
// _____________ Patient and their appointments _____________ //
route.get("/users", DoctorControllerInstance.getUsers.bind(DoctorControllerInstance));
route.get("/appointment-users/:id", DoctorControllerInstance.getAppointmentUsers.bind(DoctorControllerInstance));
route.post("/chatImgUploads/:id", multerConfig_1.upload.single("image"), DoctorControllerInstance.chatImageUploads.bind(DoctorControllerInstance));
route.get("/appointments/:id", DoctorControllerInstance.getAppointments.bind(DoctorControllerInstance));
//appointment status update routes......................................
route.patch("/appointments/:id/accept", DoctorControllerInstance.acceptAppointment.bind(DoctorControllerInstance));
route.patch("/appointments/:id/complete", DoctorControllerInstance.completeAppointment.bind(DoctorControllerInstance));
route.patch("/appointments/:id/reschedule", DoctorControllerInstance.rescheduleAppointment.bind(DoctorControllerInstance));
route.get("/slots/:id", DoctorControllerInstance.getDoctorAvailableSlots.bind(DoctorControllerInstance));
//_____________ Prescription Route ____________ //
route.post("/appointments/:appointmentId/prescription", multerConfig_1.upload.single("signatureFile"), PrescriptionControllerInstance.addPrescription.bind(PrescriptionControllerInstance));
//_____________ Doctor Dashboard ______________//
route.get("/dashboard/:id", DoctorControllerInstance.getDashboardHome.bind(DoctorControllerInstance));
route.get("/dashboard-stats/:id", DoctorControllerInstance.getDashboardStats.bind(DoctorControllerInstance));
route.get("/dashboard-chart/:id", DoctorControllerInstance.getGrowthData.bind(DoctorControllerInstance));
route.post("/logout", AuthControllerInstance.logoutDoctor.bind(AuthControllerInstance));
exports.default = route;
