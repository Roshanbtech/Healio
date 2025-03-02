import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { assets } from "../../assets/assets";
import Otp from "../../components/doctorComponents/Otp";
import { SignUpFormValues } from "../../interfaces/userInterface";
import { Google } from "../common/doctorCommon/GoogleAuth";
import axiosInstance from "../../utils/axiosInterceptors";

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [otpPage, setOtpPage] = React.useState(false);
  const [formData, setFormData] = React.useState<SignUpFormValues>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmpassword: "",
  });

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .matches(/^[a-zA-Z\s]+$/, "Name must only contain letters and spaces")
      .max(50, "Name cannot exceed 50 characters")
      .required("Name is required"),

    email: Yup.string()
      .trim()
      .email("Invalid email address")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format")
      .max(100, "Email cannot exceed 100 characters")
      .required("Email is required"),

    phone: Yup.string()
      .trim()
      .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
      .required("Phone number is required"),

    password: Yup.string()
      .trim()
      .matches(/^.{8,}$/, "Password must be at least 8 characters long")
      .matches(
        /(?=.*[A-Z])/,
        "Password must include at least one uppercase letter"
      )
      .matches(
        /(?=.*[a-z])/,
        "Password must include at least one lowercase letter"
      )
      .matches(/(?=.*\d)/, "Password must include at least one number")
      .matches(
        /(?=.*[@$!%*?&])/,
        "Password must include at least one special character (@, $, !, %, *, ?, &)"
      )
      .matches(
        /^[A-Za-z\d@$!%*?&]+$/,
        "Password must not contain spaces or unsupported characters"
      )
      .max(50, "Password cannot exceed 50 characters")
      .required("Password is required"),

    confirmpassword: Yup.string()
      .trim()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmpassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        console.log("Submitting:", values);
        setFormData(values);

        const response = await axiosInstance.post("/doctor/sendOtp", values, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(response.data, "data");

        if (response.data?.status === true) {
          toast.success(response.data.response.message || "Signup successful!");
          setOtpPage(true);
        } else {
          toast.error(
            response.data.response?.message || "Email Already in Use"
          );
        }

        formik.resetForm();
      } catch (error: any) {
        console.error("Error Response:", error);
        toast.error(error.message || "An error occurred during signup");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (otpPage) {
    return <Otp formData={formData} />;
  }

  return (
    <>
      {/* Fixed Header */}
      <header className="bg-white py-4 px-6 shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src={assets.logo} alt="Healio Logo" className="h-10 w-auto" />
          </div>
          <Link
            to="/signup"
            className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition duration-300 text-sm font-medium flex items-center"
          >
            Switch to User
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="pt-20 pb-10 min-h-screen flex items-center justify-center px-4 sm:px-6 bg-white">
        <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
          {/* Left Side - Image Section */}
          <div className="hidden md:block w-1/2 bg-gradient-to-br from-red-400 to-red-600 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Welcome, Doctor
                </h2>
                <p className="text-green-100 mb-6 max-w-md">
                  Join our community to manage appointments and provide excellent care.
                </p>
              </div>
              <div className="flex justify-center items-end h-full">
                <img
                  src={assets.bg1}
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

          {/* Right Side - Signup Form */}
          <div className="w-full md:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                  Create Account
                </h1>
                <p className="text-gray-600 mt-2">
                  Sign up to manage your appointments and provide quality care.
                </p>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border focus:ring-2 focus:outline-none transition-colors ${
                      formik.touched.name
                        ? formik.errors.name
                          ? "border-red-400 focus:ring-red-100"
                          : "border-green-500 focus:ring-green-100 focus:border-green-500"
                        : "border-gray-200"
                    }`}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
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
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border focus:ring-2 focus:outline-none transition-colors ${
                      formik.touched.phone
                        ? formik.errors.phone
                          ? "border-red-400 focus:ring-red-100"
                          : "border-green-500 focus:ring-green-100 focus:border-green-500"
                        : "border-gray-200"
                    }`}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.phone}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
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
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.password}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmpassword"
                    placeholder="Confirm Password"
                    value={formik.values.confirmpassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg bg-gray-50 border focus:ring-2 focus:outline-none transition-colors ${
                      formik.touched.confirmpassword &&
                      formik.errors.confirmpassword
                        ? "border-red-400 focus:ring-red-100"
                        : formik.touched.confirmpassword &&
                          !formik.errors.confirmpassword
                        ? "border-green-500 focus:ring-green-100 focus:border-green-500"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {formik.touched.confirmpassword &&
                    formik.errors.confirmpassword && (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.confirmpassword}
                      </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${
                    isSubmitting
                      ? "bg-red-400"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white py-3 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center shadow-md`}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>

                {/* Google Signup */}
                <Google />

                {/* Already have an account? */}
                <p className="text-center text-gray-600 mt-6">
                  Already have an account?{" "}
                  <Link
                    to="/doctor/login"
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Login here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
