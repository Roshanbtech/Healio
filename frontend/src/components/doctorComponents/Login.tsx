import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
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

        // Store the access token
        localStorage.setItem("authToken", data.accessToken);
        sessionStorage.setItem("doctorId", data.doctorId);

        // Decode the JWT token to get the role dynamically from the backend response
        const decodedToken = jwtDecode(data.accessToken) as { role: string };
        localStorage.setItem("userRole", decodedToken.role); // Store user role from decoded token
        console.log("Decoded role:", decodedToken.role);

        if (data.status) {
          toast.success(data.message);
          navigate("/doctor/home");
        }

        // Navigate to the home page or the desired route
      } catch (error: any) {
        console.error("Login error:", error);
        toast.error(error.response.data.message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <>
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <img src={assets.logo} alt="Healio Logo" className="h-12 w-auto" />
          <Link
            to="/login"
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Switch to User
          </Link>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-full max-w-[1000px] bg-white rounded-[20px] shadow-lg flex flex-col md:flex-row overflow-hidden">
          {/* Left Side - Login Form */}
          <div className="w-full md:w-1/2 p-8">
            <h1 className="text-2xl font-bold text-green-900">Login</h1>
            <p className="text-gray-600 text-sm mb-6">
              Please login to book appointment
            </p>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-2 focus:ring-2 focus:ring-green-100 
                                        ${
                                          formik.touched.email &&
                                          formik.errors.email
                                            ? "border-red-500"
                                            : formik.touched.email &&
                                              !formik.errors.email
                                            ? "border-green-400"
                                            : "border-transparent"
                                        }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-2 focus:ring-2 focus:ring-green-100 
                                        ${
                                          formik.touched.password &&
                                          formik.errors.password
                                            ? "border-red-500"
                                            : formik.touched.password &&
                                              !formik.errors.password
                                            ? "border-green-400"
                                            : "border-transparent"
                                        }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.password}
                  </div>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/doctor/forgot-password"
                  className="text-green-600 text-sm hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${
                  isSubmitting ? "bg-red-400" : "bg-red-500 hover:bg-red-600"
                } text-white py-3 rounded-md transition-colors`}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

              {/* Google Login */}
              {/* <div className="flex items-center justify-center mt-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-3 rounded-md w-full hover:bg-gray-50 transition-colors"
                >
                  <img src={assets.google} alt="Google" className="h-5 w-5" />
                  Sign In with Google
                </button>
              </div> */}
              <Google />

              {/* Signup Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Create a new account?{" "}
                <Link
                  to="/doctor/signup"
                  className="text-green-600 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>

          {/* Right Side - Doctor Image */}
          <div className="hidden md:block w-1/2 p-6 flex items-center justify-center">
            <img
              src={assets.bg2} // Replace with correct doctor image path
              alt="Doctor"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
