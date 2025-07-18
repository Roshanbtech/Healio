"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../services/admin/auth");
const auth_2 = require("../controllers/admin/auth");
const auth_3 = require("../repository/admin/auth");
const accessToken_1 = __importDefault(require("../helper/accessToken"));
const route = (0, express_1.Router)();
const AuthRepositoryInstance = new auth_3.AuthRepository();
const AuthServiceInstance = new auth_1.AuthService(AuthRepositoryInstance);
const AuthControllerInstance = new auth_2.AuthController(AuthServiceInstance);
// ____________  Admin Public Auth Routes ____________ // No token required
route.post("/login", AuthControllerInstance.loginAdmin.bind(AuthControllerInstance));
route.post("/logout", AuthControllerInstance.logoutAdmin.bind(AuthControllerInstance));
// ___________ Admin Protected Routes are listed below ____________ // Token required - admin only
route.use((0, accessToken_1.default)(["admin"]));
//____________ Dashboard ______________//
route.get("/stats", AuthControllerInstance.getDashboardStats.bind(AuthControllerInstance));
route.get("/top-doctors", AuthControllerInstance.getTopDoctors.bind(AuthControllerInstance));
route.get("/top-users", AuthControllerInstance.getTopUsers.bind(AuthControllerInstance));
route.get("/analytics", AuthControllerInstance.getAppointmentAnalytics.bind(AuthControllerInstance));
// ___________ User management ____________ //
route.get("/users", AuthControllerInstance.getUserList.bind(AuthControllerInstance));
route.patch("/users/:id/toggle", AuthControllerInstance.toggleUser.bind(AuthControllerInstance));
// ___________ Doctor management ____________ //
route.get("/doctors", AuthControllerInstance.getDoctorList.bind(AuthControllerInstance));
route.patch("/doctors/:id/toggle", AuthControllerInstance.toggleDoctor.bind(AuthControllerInstance));
route.get("/doctors/:id/certificates", AuthControllerInstance.getCertificates.bind(AuthControllerInstance));
route.patch("/doctors/:id/certificates/accept", AuthControllerInstance.approveDoctor.bind(AuthControllerInstance));
route.patch("/doctors/:id/certificates/reject", AuthControllerInstance.rejectDoctor.bind(AuthControllerInstance));
// ___________ Service management ____________ //
route.post("/services", AuthControllerInstance.addService.bind(AuthControllerInstance));
route.get("/services", AuthControllerInstance.getServices.bind(AuthControllerInstance));
route.patch("/services/:id", AuthControllerInstance.editService.bind(AuthControllerInstance));
route.patch("/services/:id/toggle", AuthControllerInstance.toggleService.bind(AuthControllerInstance));
// route.patch(
//   "/verify/:id/doctor",
//   AuthControllerInstance.doctorProfileUpdate.bind(AuthControllerInstance)
// )
// ___________ Coupon management ____________ //
route.get("/coupons", AuthControllerInstance.getCoupons.bind(AuthControllerInstance));
route.post("/coupons", AuthControllerInstance.createCoupon.bind(AuthControllerInstance));
route.patch("/coupons/:id/toggle", AuthControllerInstance.toggleCoupon.bind(AuthControllerInstance));
route.patch("/coupons/:id", AuthControllerInstance.editCoupon.bind(AuthControllerInstance));
//___________________Report management____________________//
route.get("/reports", AuthControllerInstance.getReports.bind(AuthControllerInstance));
exports.default = route;
