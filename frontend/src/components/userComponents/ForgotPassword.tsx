"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { assets } from "../../assets/assets";
import axiosInstance from "../../utils/axiosInterceptors";
import ForgotPasswordOtp from "../../components/userComponents/ForgotPasswordOtp";
import { toast } from "react-toastify";

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpPage, setOtpPage] = useState(false);
  const [emailData, setEmailData] = useState("");

  // Function to send OTP to the provided email
  const handleForgotPassword = async (email: string) => {
    try {
      const response = await axiosInstance.post("/forgot-password/sendOtp", {
        email,
      });
      if (response.data.status) {
        console.log("OTP sent successfully");
        localStorage.setItem("forgotPasswordEmail", email);
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

  // Formik setup for email submission
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await handleForgotPassword(values.email);
      if (result?.status) {
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <img src={assets.logo} alt="Healio Logo" className="h-12 w-auto" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-between gap-10">
          {/* Form Section */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Forgot Password
              </h1>
              <p className="text-gray-600 text-sm mb-6">
                Enter your registered email. We'll send you a code to reset your
                password.
              </p>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Email"
                    className="w-full px-4 py-3.5 rounded-lg bg-[#e8f8e8] border-transparent focus:border-green-500 focus:bg-white focus:ring-0 transition-colors"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white rounded-lg py-3.5 font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>

                {/* Back to Login */}
                <div className="text-center mt-6">
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Doctor Image */}
          <div className="w-full lg:w-[40%] flex justify-center">
            <img
              src={assets.docthink}
              alt="Doctor"
              className="max-w-[300px] md:max-w-[350px] lg:max-w-[400px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
