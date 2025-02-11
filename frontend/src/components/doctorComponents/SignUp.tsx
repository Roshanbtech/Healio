import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { assets } from "../../assets/assets";
// import { backendUrl } from "../../utils/backendUrl";
import Otp from "../../components/doctorComponents/Otp";
import { SignUpFormValues } from "../../interfaces/userInterface";
import { Google } from "../common/doctorCommon/GoogleAuth";
import axiosUrl from "../../utils/axios";

const Signup: React.FC = () => {
  // const navigate = useNavigate();
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
      if (isSubmitting) return; // Prevent double submission
      setIsSubmitting(true);
      try {
        console.log("Submitting:", values);
        setFormData(values);

        const response = await axiosUrl.post("/doctor/sendOtp", values, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(response.data, "data");

        // Check for correct response structure
        if (response.data?.status === true) {
          toast.success(response.data.response.message || "Signup successful!");
          setOtpPage(true);
        } else {
          toast.error(
            response.data.response?.message || "Email Already in Use"
          );
        }

        // Clear form
        formik.resetForm();
      } catch (error: any) {
        console.error("Error Response:", error);
        toast.error(error.message || "An error occurred during signup");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return otpPage ? (
    <Otp formData={formData} />
  ) : (
    <>
      {" "}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <img src={assets.logo} alt="Healio Logo" className="h-12 w-auto" />
          <Link
            to="/signup"
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Switch to User
          </Link>
        </div>
      </header>
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-full max-w-[1000px] bg-white rounded-[20px] shadow-lg flex overflow-hidden">
          {/* Left Side - Doctor Image */}
          <div className="hidden md:block w-1/2 p-6">
            <img
              src={assets.bg1}
              alt="Doctor"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full md:w-1/2 p-8">
            <h1 className="text-2xl font-bold text-green-900">
              Create Account
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Sign Up to Manage Your Appointments and Care
            </p>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-2 focus:ring-2 focus:ring-green-100
                    ${
                      formik.touched.name && formik.errors.name
                        ? "border-red-500" // Red border for errors
                        : formik.touched.name && !formik.errors.name
                        ? "border-green-400" // Green border for valid input
                        : "border-transparent" // Default state
                    }`}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.name}
                  </div>
                )}
              </div>

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
              formik.touched.email && formik.errors.email
                ? "border-red-500" // Red border for errors
                : formik.touched.email && !formik.errors.email
                ? "border-green-400" // Green border for valid input
                : "border-transparent" // Default state
            }`}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-2 focus:ring-2 focus:ring-green-100 
            ${
              formik.touched.phone && formik.errors.phone
                ? "border-red-500" // Red border for errors
                : formik.touched.phone && !formik.errors.phone
                ? "border-green-400" // Green border for valid input
                : "border-transparent" // Default state
            } `}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.phone}
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
                      formik.touched.password && formik.errors.password
                        ? "border-red-500" // Red border for errors
                        : formik.touched.password && !formik.errors.password
                        ? "border-green-400" // Green border for valid input
                        : "border-transparent" // Default state
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

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmpassword"
                  placeholder="Confirm Password"
                  value={formik.values.confirmpassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-2 focus:ring-2 focus:ring-green-100
                    ${
                      formik.touched.confirmpassword &&
                      formik.errors.confirmpassword
                        ? "border-red-500" // Red border for errors
                        : formik.touched.confirmpassword &&
                          !formik.errors.confirmpassword
                        ? "border-green-400" // Green border for valid input
                        : "border-transparent" // Default state
                    }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {formik.touched.confirmpassword &&
                  formik.errors.confirmpassword && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.confirmpassword}
                    </div>
                  )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${
                  isSubmitting ? "bg-red-400" : "bg-red-500 hover:bg-red-600"
                } text-white py-3 rounded-md transition-colors`}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>

              {/* Google Signup */}

              <Google />

              {/* Already have an account? */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <Link
                  to="/doctor/login"
                  className="text-green-600 hover:underline"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
