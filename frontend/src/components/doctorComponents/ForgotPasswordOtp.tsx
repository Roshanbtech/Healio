"use client";

import React, { useState, useRef, useEffect } from "react";
import { assets } from "../../assets/assets";
import { backendUrl } from "../../utils/backendUrl";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordOTPProps {
  email: string;
}

const ForgotPasswordOtp: React.FC<ForgotPasswordOTPProps> = ({ email }) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft === 0) {
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
    if (value && index < otp.length - 1) {
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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").split("").slice(0, 4);
    const newOtp = [...otp];
    pastedNumbers.forEach((num, idx) => {
      newOtp[idx] = num;
    });
    setOtp(newOtp);
    const lastFilledIndex = newOtp.findIndex((val) => !val);
    const focusIndex = lastFilledIndex === -1 ? otp.length - 1 : lastFilledIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      console.log("OTP submitted:", otpValue);
      try {
        const response = await fetch(
          `${backendUrl}/doctor/forgot-password/verifyOtp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, otp: otpValue }),
            credentials: "include",
          }
        );
        const data = await response.json();
        console.log(data, "data");
        if (!response.ok) {
          throw new Error(data.message || "OTP verification failed");
        }
        if (data.status === true) {
          toast.success(data.message || "OTP verified successfully!");
          navigate("/doctor/reset-password", { state: { email } });
        } else {
          toast.error(data.message || "OTP verification failed");
        }
      } catch (error: any) {
        console.error("Error verifying OTP:", error);
        toast.error(
          error.message || "An error occurred during OTP verification"
        );
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
      try {
        const response = await fetch(`${backendUrl}/doctor/resendOtp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || "OTP resent successfully!");
        } else {
          toast.error(data.message || "Failed to resend OTP");
        }
      } catch (error) {
        console.error("Error resending OTP:", error);
        toast.error("An error occurred while resending OTP");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center">
          <img src={assets.logo} alt="Healio Logo" className="h-10 w-auto" />
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[1100px] bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
          {/* Left Side - OTP Form Section */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 flex items-center justify-center">
            <div className="max-w-[400px] w-full">
              <h2 className="text-2xl font-semibold mb-1">Enter OTP</h2>
              <p className="text-gray-600 text-sm mb-6">
                Enter the OTP sent to your email. The OTP is valid for a limited
                time.
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
                  Submit OTP
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend}
                  className={`w-full text-center text-sm ${
                    canResend
                      ? "text-red-600 hover:underline cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Resend OTP
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
                Verify your identity by entering the OTP sent to your email and proceed to reset your password.
              </p>
              <div className="flex justify-center items-center">
                <img
                  src={assets.bg2}
                  alt="OTP Verification Illustration"
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

export default ForgotPasswordOtp;
