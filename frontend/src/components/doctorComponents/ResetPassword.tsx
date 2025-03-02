"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import axiosInstance from "../../utils/axiosInterceptors";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords do not match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const response = await axiosInstance.post(
          "/doctor/forgot-password/reset",
          {
            values,
            email: localStorage.getItem("doctorForgotPasswordEmail"),
          }
        );
        console.log("Reset password response:", response.data);
        toast.success("Password reset successfully!");
        navigate("/doctor/login");
      } catch (error: any) {
        console.error("Error during password reset:", error);
        toast.error(
          error.response?.data?.message ||
            "An error occurred during password reset"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <img src={assets.logo} alt="Healio Logo" className="h-12 w-auto" />
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
          {/* Left Side - Form Section */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 flex items-center justify-center">
            <div className="max-w-md w-full">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Reset Password
              </h1>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="New Password"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3.5 rounded-lg bg-[#e8f8e8] border-transparent focus:border-green-500 focus:bg-white focus:ring-0 transition-colors"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  {formik.touched.newPassword && formik.errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.newPassword}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3.5 rounded-lg bg-[#e8f8e8] border-transparent focus:border-green-500 focus:bg-white focus:ring-0 transition-colors"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.confirmPassword}
                      </p>
                    )}
                </div>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full bg-red-600 text-white rounded-lg py-3.5 font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {formik.isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Premium Gradient & Image Section */}
          <div className="hidden md:block w-full md:w-1/2 bg-gradient-to-br from-red-400 to-red-600 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
            <div className="relative z-10 h-full flex flex-col justify-center items-center">
              <h2 className="text-3xl font-bold text-white mb-3">
                Secure Password Reset
              </h2>
              <p className="text-green-100 mb-6 text-center max-w-md">
                Reset your password to regain access to your account with ease.
              </p>
              <div className="flex justify-center items-center">
                <img
                  src={assets.docthink}
                  alt="Doctor Illustration"
                  className="max-w-[400px] object-contain filter drop-shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
