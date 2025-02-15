import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import axiosInstance from "../../utils/axiosInterceptors";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

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
        const response = await axiosInstance.post("/doctor/forgot-password/reset", {values, email: localStorage.getItem("doctorForgotPasswordEmail")});
        console.log("Reset password response:", response.data);

        toast.success("Password reset successfully!");
        navigate("/doctor/login");
      } catch (error: any) {
        console.error("Error during password reset:", error);
        toast.error(error.response?.data?.message || "An error occurred during password reset");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <img src={assets.logo} alt="Healio Logo" className="h-12 w-auto" />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
          {/* Form Section */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Reset Password
              </h1>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3.5 rounded-lg bg-[#e8f8e8] border-transparent focus:border-green-500 focus:bg-white focus:ring-0 transition-colors"
                    required
                  />
                  {formik.touched.newPassword && formik.errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3.5 rounded-lg bg-[#e8f8e8] border-transparent focus:border-green-500 focus:bg-white focus:ring-0 transition-colors"
                    required
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
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

                {/* <div className="text-center mt-6">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back to Forgot Password
                  </Link>
                </div> */}
              </form>
            </div>
          </div>

          {/* Doctor Image - Hidden on mobile */}
          <div className="hidden lg:flex justify-center items-center">
            <img
              src={assets.docthink}
              alt="Doctor"
              className="w-[400px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
