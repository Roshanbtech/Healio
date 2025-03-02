import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { assets } from "../../assets/assets";
import axiosInstance from "../../utils/axiosInterceptors";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Google } from "../common/doctorCommon/GoogleAuth";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const { data } = await axiosInstance.post("/doctor/login", values);
        localStorage.setItem("authToken", data.accessToken);
        sessionStorage.setItem("doctorId", data.doctorId);
        const decodedToken = jwtDecode(data.accessToken) as { role: string };
        localStorage.setItem("userRole", decodedToken.role);

        if (data.status) {
          toast.success(data.message);
          setTimeout(() => navigate("/doctor/home"), 1000); 
        }
      } catch (error: any) {
        console.error("Login error:", error);
        toast.error(error.response.data.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-white">
          <ToastContainer />
      <header className="bg-white py-4 px-6 shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src={assets.logo} alt="Healio Logo" className="h-10 w-auto" />
          </div>

          <Link
            to="/login"
            className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition duration-300 text-sm font-medium flex items-center"
          >
            Switch to Patient Portal
          </Link>
        </div>
      </header>

      <div className="pt-20 pb-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-xl flex flex-col md:flex-row-reverse overflow-hidden border border-gray-100">
          {/* Right Side - Image */}
          <div className="hidden md:block w-1/2 bg-gradient-to-br from-red-400 to-red-600 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Welcome Back, Doctor
                </h2>
                <p className="text-green-100 mb-6 max-w-md">
                  Access your dashboard to manage appointments, patient records,
                  and more.
                </p>
              </div>
              <div className="flex justify-center items-end h-full">
                <img
                  src={assets.bg2}
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

          {/* Left Side - Login Form */}
          <div className="w-full md:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                  Doctor Login
                </h1>
                <p className="text-gray-600 mt-2">
                  Please enter your credentials to access your account
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
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="yourname@example.com"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border focus:ring-2 focus:outline-none transition-colors ${
                        formik.touched.email
                          ? formik.errors.email
                            ? "border-red-400 focus:ring-red-100"
                            : "border-green-500 focus:ring-green-100 focus:border-green-500"
                          : "border-gray-200"
                      }`}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <Link
                      to="/doctor/forgot-password"
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg bg-gray-50 border focus:ring-2 focus:outline-none transition-colors ${
                        formik.touched.password
                          ? formik.errors.password
                            ? "border-red-400 focus:ring-red-100"
                            : "border-green-500 focus:ring-green-100 focus:border-green-500"
                          : "border-gray-200"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.password}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${
                    isSubmitting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
                  } text-white py-3 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center shadow-md`}
                >
                  {isSubmitting ? "Logging in..." : "Login to Dashboard"}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">
                  OR CONTINUE WITH
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="mb-6">
                <Google />
              </div>

              <p className="text-center text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/doctor/signup"
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Create account
                </Link>
              </p>

              <div className="mt-12 text-center text-gray-500 text-xs">
                <p>
                  © {new Date().getFullYear()} Healio. All rights reserved.
                </p>
                <p className="mt-1">
                  By logging in, you agree to our terms of service and privacy
                  policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
