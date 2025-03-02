import type React from "react";
import { useState, useRef, useEffect } from "react";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInterceptors";

interface OTPProps {
  onSubmit?: (otp: string) => void;
  onResend?: () => void;
  formData?: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmpassword: string;
  };
}

const OTP: React.FC<OTPProps> = ({ onSubmit, onResend, formData }) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!timeLeft) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) {
      value = value[0];
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").split("").slice(0, 4);
    const newOtp = [...otp];
    pastedNumbers.forEach((num, index) => {
      if (index < 4) newOtp[index] = num;
    });
    setOtp(newOtp);
    const lastFilledIndex = newOtp.findIndex((val) => !val);
    const focusIndex = lastFilledIndex === -1 ? 3 : lastFilledIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      onSubmit?.(otpValue);
      console.log("OTP submitted:", otpValue);
      console.log(formData, "values");
      const formValues = {
        name: formData?.name,
        email: formData?.email,
        password: formData?.password,
        phone: formData?.phone,
        otp: otpValue,
      };
      try {
        const response = await axiosInstance.post("/doctor/signUp", formValues, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        console.log(response.data, "data");
        if (response.data?.response?.status === true) {
          toast.success(response.data.response.message || "Signup successful!");
          navigate("/doctor/login");
        } else {
          if (
            response.data.response?.message === "OTP does not match or is not found."
          ) {
            toast.error(
              response.data.response?.message ||
                "OTP does not match or is not found."
            );
          }
          toast.error(response.data.response?.message || "Signup failed");
        }
      } catch (error: any) {
        console.error("Error Response:", error);
        toast.error(error.message || "An error occurred during signup");
      }
    } else {
      toast.error("Please enter a valid 4-digit OTP");
    }
  };

  const handleResend = async () => {
    if (canResend) {
      setTimeLeft(60);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      if (formData?.email) {
        try {
          const response = await axiosInstance.post("/doctor/resendOtp", {
            email: formData.email,
          });
          console.log(response.data, "data");
          if (response.data?.status) {
            toast.success(response.data.message || "OTP resent successfully!");
          } else {
            toast.error(response.data.message || "Failed to resend OTP");
          }
        } catch (error: any) {
          console.log(error);
          toast.error(
            error.message || "An error occurred while resending OTP"
          );
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <img src={assets.logo} alt="Healio Logo" className="h-10 w-auto" />
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
          {/* Left Side - OTP Form Section */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 flex items-center justify-center">
            <div className="max-w-[400px] mx-auto">
              <h2 className="text-2xl font-semibold mb-1">OTP Verification</h2>
              <p className="text-gray-600 text-sm mb-6">
                Enter the OTP before the timer runs out.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-xl font-semibold rounded-md bg-[#f0fdf4] border-0 focus:outline-none focus:ring-2 focus:ring-green-100"
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500">
                  {timeLeft > 0
                    ? `00:${timeLeft.toString().padStart(2, "0")} sec`
                    : "Time's up!"}
                </div>

                <button
                  type="submit"
                  disabled={otp.some((digit) => !digit)}
                  className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  className={`w-full text-center text-sm ${
                    canResend
                      ? "text-blue-600 hover:underline cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!canResend}
                >
                  Resend OTP
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Premium Gradient & Image Section */}
          <div className="hidden md:block w-full md:w-1/2 bg-gradient-to-br from-red-400 to-red-600 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
            <div className="relative z-10 h-full flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-3">
                Verify Your Account
              </h2>
              <p className="text-green-100 mb-6 max-w-md">
                Please enter the 4-digit OTP sent to your email to verify your account.
              </p>
              <div className="flex justify-center items-center">
                <img
                  src={assets.bg2}
                  alt="Verification Illustration"
                  className="max-h-[400px] object-contain filter drop-shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;
