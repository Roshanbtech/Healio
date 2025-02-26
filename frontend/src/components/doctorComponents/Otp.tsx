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
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current input is empty
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

    // Focus last input or first empty input
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
        const response = await axiosInstance.post(
          "/doctor/signUp",
          formValues,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(response.data, "data");

        // Check for correct response structure
        if (response.data?.response?.status === true) {
          toast.success(response.data.response.message || "Signup successful!");
          navigate("/doctor/login");
        } else {
          if (
            response.data.response?.message ===
            "OTP does not match or is not found."
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
      setTimeLeft(60); // Reset timer
      setCanResend(false); // Disable the resend button until time is up
      setOtp(["", "", "", ""]); // Clear the OTP input fields

      // Trigger the resend OTP request
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
          toast.error(error.message || "An error occurred while resending OTP");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 px-6 shadow-sm">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2">
            <img src={assets.logo} alt="Healio Logo" className="h-8" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[1000px] bg-white rounded-[20px] shadow-lg flex overflow-hidden">
          {/* OTP Form Section */}
          <div className="w-full md:w-1/2 p-8">
            <div className="max-w-[400px] mx-auto">
              <h2 className="text-2xl font-semibold mb-1">OTP</h2>
              <p className="text-gray-600 text-sm mb-6">
                Enter the otp before the timer runs out
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
                  Resend
                </button>
              </form>
            </div>
          </div>

          {/* Image Section */}
          <div className="hidden md:block w-1/2 p-6">
            <img
              src={assets.bg2}
              alt="Doctor pointing to OTP form"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;
