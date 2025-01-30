import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { assets } from "../../assets/assets"; 
import { backendUrl } from '../../utils/backendUrl';
import Otp from '../../components/userComponents/Otp';
import { SignUpFormValues } from '../../interfaces/userInterface';


const Signup: React.FC = () => {
    // const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [otpPage,setOtpPage] = React.useState(false);
    const [formData, setFormData] = React.useState<SignUpFormValues>({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmpassword: "",
      });
    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string()
            .email('Invalid email address')
            .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')
            .required('Email is required'),
        phone: Yup.string()
            .matches(/^\d{10}$/, 'Phone number must be 10 digits')
            .required('Phone number is required'),
        password: Yup.string()
            .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must be at least 8 characters long, include one uppercase letter, one number, and one special character')
            .required('Password is required'),
        confirmpassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Confirm password is required'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmpassword: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            if (isSubmitting) return; // Prevent double submission
            setIsSubmitting(true);
            try {
                console.log("Submitting:", values);
                setFormData(values);

                const response = await fetch(`${backendUrl}/sendOtp`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                    credentials: 'include', // Include cookies if your API uses sessions
                });

                const data = await response.json();
                console.log(data,'data')
                if (!response.ok) {
                    throw new Error(data.message || "Signup failed");
                }
                
                // Check for correct response structure
                if (data?.response?.status === true) {
                    toast.success(data.response.message || "Signup successful!");
                    setOtpPage(true);
                } else {
                    toast.error(data.response?.message || "Email Already in Use");
                }
                
                
                

                // Clear form
                formik.resetForm();
                
                // Redirect to login page after successful signup
                // setTimeout(() => {
                //     navigate('/otp');
                // }, 1500); // Give time for the success message to be seen



            } catch (error: any) {
                console.error("Error Response:", error);
                toast.error(error.message || "An error occurred during signup");
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return (
        
        (otpPage ? <Otp formData={formData}/> : 
      <> <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
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
                    <h1 className="text-2xl font-bold text-green-900">Create Account</h1>
                    <p className="text-gray-600 text-sm mb-6">Please sign up to book appointment</p>

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
                                className="w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-0 focus:ring-2 focus:ring-green-100"
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
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
                                className="w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-0 focus:ring-2 focus:ring-green-100"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
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
                                className="w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-0 focus:ring-2 focus:ring-green-100"
                            />
                            {formik.touched.phone && formik.errors.phone && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.phone}</div>
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
                                className="w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-0 focus:ring-2 focus:ring-green-100"
                            />
                            <button 
                                type="button" 
                                className="absolute right-3 top-3" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 
                                    <EyeOff className="h-5 w-5 text-gray-400" /> : 
                                    <Eye className="h-5 w-5 text-gray-400" />
                                }
                            </button>
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
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
                                className="w-full px-4 py-3 rounded-md bg-[#f0fdf4] border-0 focus:ring-2 focus:ring-green-100"
                            />
                            <button 
                                type="button" 
                                className="absolute right-3 top-3" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? 
                                    <EyeOff className="h-5 w-5 text-gray-400" /> : 
                                    <Eye className="h-5 w-5 text-gray-400" />
                                }
                            </button>
                            {formik.touched.confirmpassword && formik.errors.confirmpassword && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.confirmpassword}</div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full ${
                                isSubmitting ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'
                            } text-white py-3 rounded-md transition-colors`}
                        >
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>

                        {/* Google Signup */}
                        <div className="flex items-center justify-center mt-4">
                            <button 
                                type="button"
                                className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-3 rounded-md w-full hover:bg-gray-50 transition-colors"
                            >
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
                                    alt="Google" 
                                    className="h-5 w-5" 
                                />
                                Continue with Google
                            </button>
                        </div>

                        {/* Already have an account? */}
                        <p className="text-center text-sm text-gray-600 mt-6">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:underline">
                                Login here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
        </> 
    ) )
};

export default Signup;