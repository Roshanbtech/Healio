"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { assets } from "../../assets/assets";
import axiosInstance from "../../utils/axiosInterceptors";
import ForgotPasswordOtp from "../../components/doctorComponents/ForgotPasswordOtp";
import { toast } from "react-toastify";

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpPage, setOtpPage] = useState(false);
  const [emailData, setEmailData] = useState("");

  // Function to send OTP to the provided doctor email
  const handleForgotPassword = async (email: string) => {
    try {
      const response = await axiosInstance.post("doctor/forgot-password/sendOtp", { email });
      if (response.data.status) {
        console.log("OTP sent successfully");
        localStorage.setItem("doctorForgotPasswordEmail", email);
        return { status: true, message: "OTP sent successfully" };
      } else {
        console.log("Error while sending OTP");
        return { status: false, message: "Error while sending OTP" };
      }
    } catch (error: any) {
      if (error.response.status === 404) {
        toast.error("Email not found");
      } else {
        toast.error("Error sending OTP");
      }
    }
  };

  // Formik setup for doctor email submission
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email format").required("Email is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await handleForgotPassword(values.email);
      if (result?.status) {
        // If OTP is sent successfully, store the email and show the OTP component
        setEmailData(values.email);
        setOtpPage(true);
      }
      setIsLoading(false);
    },
  });

  // If otpPage is true, show the OTP verification component instead of the form.
  if (otpPage) {
    return <ForgotPasswordOtp email={emailData} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <img src={assets.logo} alt="Healio Logo" className="h-10 w-auto" />
          <Link
            to="/doctor/login"
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Back to Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
          {/* Left Side - Form Section */}
          <div className="w-full md:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                  Doctor Forgot Password
                </h1>
                <p className="text-gray-600 mt-2">
                  Enter your registered email. We'll send you an OTP to reset your password.
                </p>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="yourname@example.com"
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border focus:ring-2 focus:outline-none transition-colors ${
                      formik.touched.email
                        ? formik.errors.email
                          ? "border-red-400 focus:ring-red-100"
                          : "border-green-500 focus:ring-green-100 focus:border-green-500"
                        : "border-gray-200"
                    }`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${
                    isLoading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
                  } text-white py-3 rounded-lg transition-colors duration-300 font-medium shadow-md`}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>

                <div className="text-center mt-6">
                  <Link
                    to="/doctor/login"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back to Doctor Login
                  </Link>
                </div>
              </form>

              <div className="mt-12 text-center text-gray-500 text-xs">
                <p>© {new Date().getFullYear()} Healio. All rights reserved.</p>
                <p className="mt-1">
                  By resetting your password, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Premium Gradient and Image */}
          <div className="hidden md:block w-1/2 bg-gradient-to-br from-red-400 to-red-600 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Reset Your Password
                </h2>
                <p className="text-green-100 mb-6 max-w-md">
                  Enter your registered email address to receive an OTP and reset your password.
                </p>
              </div>
              <div className="flex justify-center items-end">
                <img
                  src={assets.docthink}
                  alt="Doctor"
                  className="max-h-80 object-contain filter drop-shadow-lg"
                />
              </div>
              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white opacity-70"></div>
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                  <div className="w-2 h-2 rounded-full bg-white opacity-70"></div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
