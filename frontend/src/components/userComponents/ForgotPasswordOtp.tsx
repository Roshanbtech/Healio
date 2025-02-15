"use client"

import React, { useState, useRef, useEffect } from "react"
import { assets } from "../../assets/assets"
import { backendUrl } from "../../utils/backendUrl"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

interface ForgotPasswordOTPProps {
  email: string
}

const ForgotPasswordOtp: React.FC<ForgotPasswordOTPProps> = ({ email }) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    if (value.length > 1) {
      value = value[0]
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    const pastedNumbers = pastedData.replace(/\D/g, "").split("").slice(0, 4)

    const newOtp = [...otp]
    pastedNumbers.forEach((num, idx) => {
      newOtp[idx] = num
    })
    setOtp(newOtp)

    // Focus the next empty input or the last one
    const lastFilledIndex = newOtp.findIndex((val) => !val)
    const focusIndex = lastFilledIndex === -1 ? otp.length - 1 : lastFilledIndex
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join("")
    if (otpValue.length === 4) {
      console.log("OTP submitted:", otpValue)
      try {
        const response = await fetch(`${backendUrl}/forgot-password/verifyOtp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp: otpValue }),
          credentials: "include",
        })

        const data = await response.json()
        console.log(data, "data")
        if (!response.ok) {
          throw new Error(data.message || "OTP verification failed")
        }

        if (data.status === true) {
          toast.success(data.message || "OTP verified successfully!")
          // Navigate to reset password page (pass the email if needed)
          navigate("/reset-password", { state: { email } })
        } else {
          toast.error(data.message || "OTP verification failed")
        }
      } catch (error: any) {
        console.error("Error verifying OTP:", error)
        toast.error(error.message || "An error occurred during OTP verification")
      }
    }
  }

  const handleResend = async () => {
    if (canResend) {
      setTimeLeft(60) // Reset timer
      setCanResend(false) // Disable resend until timer is up
      setOtp(["", "", "", ""]) // Clear the OTP fields

      try {
        const response = await fetch(`${backendUrl}/resendOtp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
          credentials: "include",
        })

        const data = await response.json()
        if (response.ok) {
          toast.success(data.message || "OTP resent successfully!")
        } else {
          toast.error(data.message || "Failed to resend OTP")
        }
      } catch (error) {
        console.error("Error resending OTP:", error)
        toast.error("An error occurred while resending OTP")
      }
    }
  }

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
              <h2 className="text-2xl font-semibold mb-1">Enter OTP</h2>
              <p className="text-gray-600 text-sm mb-6">
                Enter the OTP sent to your email. The OTP is valid for a limited time.
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
                      ? "text-blue-600 hover:underline cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Resend OTP
                </button>
              </form>
            </div>
          </div>

          {/* Image Section */}
          <div className="hidden md:block w-1/2 p-6">
            <img
              src={assets.bg2}
              alt="Illustration for OTP verification"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordOtp
