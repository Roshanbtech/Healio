import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInterceptors";
import { toast } from "react-toastify";
import {
  createAppointment,
  verifyAppointment,
  bookAppointmentUsingWallet,
} from "../../services/appointment";
import { assets } from "../../assets/assets";

interface IDoctor {
  name: string;
  about: string;
  experience: number;
  fees: number;
  image: string;
  speciality: string | { name: string };
  degree?: string;
}

interface PaymentBreakdown {
  consultingFees: number;
  taxCharges: number;
  discount: number;
  payable: number;
}

interface ICoupon {
  id: string;
  code: string;
  description?: string;
  discount?: number;
}

interface IUserProfile {
  name: string;
  email: string;
  address: string;
  wallet?: {
    balance: number;
    transactions?: any[];
  };
}

const BookAppointment: React.FC = () => {
  const { state } = useLocation();
  const { selectedDate, selectedTime } = state || {};
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [docInfo, setDocInfo] = useState<IDoctor | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("razorpay");
  const [couponCode, setCouponCode] = useState<string>("");
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<ICoupon | null>(null);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [isProcessingWallet, setIsProcessingWallet] = useState<boolean>(false);

  const consultingFees = docInfo?.fees ?? 0;
  const discountPercentage = appliedCoupon?.discount || 0;
  const discountAmount = consultingFees * (discountPercentage / 100);
  const paymentBreakdown: PaymentBreakdown = {
    consultingFees,
    taxCharges: 100,
    discount: discountAmount,
    payable: consultingFees + 100 - discountAmount,
  };

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/doctorDetails/${id}`);
      if (data?.doctor) {
        setDocInfo(data.doctor);
      } else {
        throw new Error("Doctor not found");
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get("/coupons");
      if (response.data?.coupons) {
        console.log("Fetched coupons:", response.data.coupons);
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      axiosInstance
        .get(`/profile/${userId}`)
        .then((response) => {
          if (response.data?.user) {
            setUserProfile(response.data.user);
          } else {
            console.error("User not found in response");
          }
        })
        .catch((err) => {
          console.error("Error fetching user profile", err);
        });
    }
  }, []);

  const applyCoupon = () => {
    const foundCoupon = coupons.find(
      (c) => c.code.toLowerCase() === couponCode.toLowerCase()
    );
    if (foundCoupon) {
      setAppliedCoupon(foundCoupon);
      toast.success(`Coupon ${foundCoupon.code} applied successfully!`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleProceed = async () => {
    const user = localStorage.getItem("userId");

    const data = {
      currency: "INR",
      fees: paymentBreakdown.payable,
      patientId: user,
      doctorId: id,
      date: selectedTime.datetime,
      time: selectedTime.slot,
      isApplied: appliedCoupon ? true : false,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      couponDiscount: appliedCoupon ? appliedCoupon.discount : null,
      paymentMethod: selectedPayment,
    };

    console.log("Selected Date & Time:", data.date, data.time);

    try {
      let appointment;
      if (selectedPayment === "wallet") {
        try {
          setIsProcessingWallet(true);
          appointment = await bookAppointmentUsingWallet(data);
          if (!appointment) {
            setIsProcessingWallet(false);
            return;
          }
          toast.success("Payment successful!");
          const successData = {
            transactionId: appointment.transactionId || "N/A",
            amount: paymentBreakdown.payable.toString(),
            date: new Date().toLocaleString(),
            patientName: userProfile?.name || "John Doe",
            email: userProfile?.email || "john.doe@example.com",
            address: userProfile?.address || "123 Main Street, City",
            doctorName: docInfo?.name,
            appointmentTime: selectedTime?.slot,
            healioLogo: assets.logo,
          };
          setTimeout(() => {
            setIsProcessingWallet(false);
            navigate("/success", { state: successData });
          }, 1500);
        } catch (error: any) {
          setIsProcessingWallet(false);
          console.error("Wallet Payment Error:", error);
          let errorMessage = "An error occurred while processing your payment.";
          if (error.response && error.response.data) {
            if (typeof error.response.data === "string") {
              try {
                const parsed = JSON.parse(error.response.data);
                if (parsed.message) {
                  errorMessage = parsed.message;
                } else {
                  errorMessage = error.response.data;
                }
              } catch (e) {
                errorMessage = error.response.data;
              }
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          // Use setTimeout with 0 delay to ensure toast is called after state updates
          setTimeout(() => {
            toast.error(errorMessage);
          }, 0);
        }
      } else if (selectedPayment === "razorpay") {
        appointment = await createAppointment(data);
        if (!appointment) {
          toast.error("Failed to create order. Try again.");
          return;
        }
        console.log("Order Data:", appointment);
        openRazorpay(appointment?.appointment?.order);
      } else {
        return;
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while processing your payment.";
      toast.error(errorMessage);
    }
  };

  const routeData = {
    patientId: localStorage.getItem("userId"),
    doctorId: id,
  };

  const openRazorpay = (appointmentData: any) => {
    interface RazorpayOptions {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: any) => void;
      prefill: {
        name: string;
        email: string;
      };
      theme: {
        color: string;
      };
      modal?: {
        ondismiss?: () => void;
      };
    }
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded. Please try again.");
      return;
    }
    const options: RazorpayOptions = {
      key: import.meta.env.VITE_PAYMENT_KEY_ID,
      amount: appointmentData.amount,
      currency: appointmentData.currency,
      name: " HEALIO",
      description: `Payment for appointment with Dr. ${docInfo?.name}`,
      order_id: appointmentData.id,
      handler: async function (response: any) {
        console.log("Payment Response:", response);
        const verify = await verifyAppointment(response, routeData);
        console.log("Verify Response:", verify.success);
        if (verify.status) {
          toast.success("Payment successful!");
          const successData = {
            transactionId: response.razorpay_payment_id,
            amount: paymentBreakdown.payable.toString(),
            date: new Date().toLocaleString(),
            patientName: userProfile?.name || "John Doe",
            email: userProfile?.email || "john.doe@example.com",
            address: userProfile?.address || "123 Main Street, City",
            doctorName: docInfo?.name,
            appointmentTime: selectedTime?.slot,
            healioLogo: assets.logo,
          };
          navigate("/success", { state: successData });
        } else {
          toast.error("Payment failed. Redirecting to your appointments.");
          setTimeout(() => {
            navigate("/appointments");
          }, 1500);
        }
      },
      prefill: {
        name: userProfile?.name || "John Doe",
        email: userProfile?.email || "john.doe@example.com",
      },
      theme: {
        color: "#dc2626",
      },
      modal: {
        ondismiss: () => {
          toast.error("Payment cancelled. Redirecting to your appointments.");
          setTimeout(() => {
            navigate("/appointments");
          }, 1500);
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    fetchDoctorDetails();
    fetchCoupons();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!docInfo)
    return (
      <div className="text-center py-16 text-gray-600">
        <div className="text-3xl mb-4">😕</div>
        <div className="text-xl font-semibold">Doctor not found</div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 pb-16 bg-gray-50 min-h-screen">
      {/* Doctor Info Card */}
      <div className="bg-white rounded-lg shadow-lg mb-8 transform transition-all hover:shadow-xl">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-lg">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
              <img
                src={docInfo.image || "/default-avatar.png"}
                alt="Doctor"
                className="w-full h-full object-cover bg-green-100"
              />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                {docInfo.name} {docInfo.degree ? `(${docInfo.degree})` : ""}
              </h2>
              <p className="text-sm bg-red-500 inline-block px-3 py-1 rounded-full mt-1 shadow-sm">
                {typeof docInfo.speciality === "object"
                  ? docInfo.speciality.name
                  : docInfo.speciality}
              </p>
              <p className="text-sm mt-2 opacity-90">
                Experience: {docInfo.experience} years
              </p>
            </div>
          </div>
        </div>
        <div className="p-8 border-b border-gray-100">
          <div className="flex justify-between mb-4">
            <div className="text-center bg-green-100 p-4 rounded-lg shadow-sm flex-1 mr-4">
              <p className="font-semibold text-gray-700 mb-1">
                Appointment Date
              </p>
              <p className="text-lg font-medium text-gray-900">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not Selected"}
              </p>
            </div>
            <div className="text-center bg-green-100 p-4 rounded-lg shadow-sm flex-1">
              <p className="font-semibold text-gray-700 mb-1">
                Appointment Time
              </p>
              <p className="text-lg font-medium text-gray-900">
                {selectedTime ? selectedTime.slot : "Not Selected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-t-lg">
          <h3 className="text-white text-lg font-semibold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            Select Payment Method
          </h3>
        </div>
        <div className="p-8">
          {/* Payment Methods */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPayment === "razorpay"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
                onClick={() => setSelectedPayment("razorpay")}
              >
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={selectedPayment === "razorpay"}
                    onChange={() => setSelectedPayment("razorpay")}
                    className="form-radio text-red-600 focus:ring-red-500 h-5 w-5"
                  />
                  <div className="flex items-center">
                    <svg
                      className="h-8 w-8 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="24" height="24" rx="4" fill="#2B84EA" />
                      <path d="M13.5 8.25H17.25V12H13.5V8.25Z" fill="white" />
                      <path d="M6.75 8.25H10.5V12H6.75V8.25Z" fill="white" />
                      <path d="M13.5 15H17.25V18.75H13.5V15Z" fill="white" />
                      <path d="M6.75 15H10.5V18.75H6.75V15Z" fill="white" />
                    </svg>
                    <span className="font-medium">Razorpay</span>
                  </div>
                </label>
              </div>

              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPayment === "wallet"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-red-300"
                }`}
                onClick={() => setSelectedPayment("wallet")}
              >
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={selectedPayment === "wallet"}
                    onChange={() => setSelectedPayment("wallet")}
                    className="form-radio text-red-600 focus:ring-red-500 h-5 w-5"
                  />
                  <div className="flex items-center">
                    <svg
                      className="h-8 w-8 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="24" height="24" rx="4" fill="#FF5252" />
                      <path
                        d="M17 9V7C17 5.89543 16.1046 5 15 5H9C7.89543 5 7 5.89543 7 7V9M17 9C17.5523 9 18 9.44772 18 10V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V10C6 9.44772 6.44772 9 7 9M17 9H7M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="font-medium">Wallet</span>
                  </div>
                  {userProfile && userProfile.wallet && (
                    <div className="ml-auto text-sm text-green-600">
                      Balance: ₹{userProfile.wallet.balance}
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold mb-3 flex items-center text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
              </svg>
              Apply Coupon
            </h4>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
                onClick={applyCoupon}
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <div className="bg-green-50 text-green-800 p-3 rounded-md mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    {appliedCoupon.code} applied - ₹{appliedCoupon.discount} OFF
                  </span>
                </div>
                <button
                  className="text-sm text-red-600 hover:text-red-800"
                  onClick={() => setAppliedCoupon(null)}
                >
                  Remove
                </button>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600 mb-2">
                Available Coupons:
              </div>
              <div className="flex flex-wrap gap-2">
                {coupons.length > 0 ? (
                  coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="border border-dashed border-red-300 bg-white inline-block px-3 py-2 rounded text-sm cursor-pointer hover:bg-red-50 transition-colors"
                      onClick={() => {
                        setCouponCode(coupon.code);
                        setAppliedCoupon(coupon);
                      }}
                    >
                      <div className="font-medium text-red-600">
                        {coupon.code}
                      </div>
                      {coupon.description && (
                        <div className="text-xs text-gray-500">
                          {coupon.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600 text-sm py-2">
                    No coupons available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold mb-4 flex items-center text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Payment Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Consulting Fees</span>
                <span className="font-medium">
                  ₹{paymentBreakdown.consultingFees}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax Charges</span>
                <span className="font-medium">
                  ₹{paymentBreakdown.taxCharges}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">
                  -₹{paymentBreakdown.discount}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Payable</span>
                  <span className="text-red-600">
                    ₹{paymentBreakdown.payable}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Now Button */}
          <button
            className="w-full bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 transition-colors font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
            onClick={handleProceed}
          >
            Pay Now
          </button>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Secure Payment Guaranteed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
