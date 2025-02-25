import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInterceptors";
import { toast } from "react-toastify";

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
  discountAmount?: number;
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

  // Payment breakdown uses the doctor's fee fetched from doctor details.
  const paymentBreakdown: PaymentBreakdown = {
    consultingFees: docInfo?.fees ?? 1200,
    taxCharges: 100,
    discount: 50,
    payable: (docInfo?.fees ?? 1200) + 100 - 50,
  };

  // Fetch doctor details based on the doctor ID
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

  // Fetch available coupons from the backend
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
    fetchDoctorDetails();
    fetchCoupons();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!docInfo)
    return <div className="text-center py-8">Doctor not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Doctor Info Card */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="bg-red-600 p-6 rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white">
              <img
                src={docInfo.image || "/default-avatar.png"}
                alt="Doctor"
                className="w-full h-full object-cover bg-green-100"
              />
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">
                {docInfo.name} {docInfo.degree ? `(${docInfo.degree})` : ""}
              </h2>
              <p className="text-sm">
                {typeof docInfo.speciality === "object"
                  ? docInfo.speciality.name
                  : docInfo.speciality}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <div>
              <p className="font-semibold">Date</p>
              <p className="text-gray-600">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not Selected"}
              </p>
            </div>
            <div>
              <p className="font-semibold">Time</p>
              <p className="text-gray-600">
                {selectedTime ? selectedTime.slot : "Not Selected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-red-600 p-4 rounded-t-lg">
          <h3 className="text-white text-lg font-semibold">
            Select Payment Method
          </h3>
        </div>
        <div className="p-6">
          {/* Payment Methods */}
          <div className="mb-6">
            {["razorpay", "account"].map((method) => (
              <div key={method} className="mb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={selectedPayment === method}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="form-radio text-red-600"
                  />
                  <span className="capitalize">{method}</span>
                </label>
              </div>
            ))}
          </div>

          {/* Coupon Section */}
          <div className="mb-6">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2"
              />
              <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                Apply
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-gray-100 inline-block px-3 py-1 rounded text-sm"
                  >
                    {coupon.code}
                  </div>
                ))
              ) : (
                <div className="text-gray-600 text-sm">No coupons available.</div>
              )}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Payment Amount</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Consulting Fees</span>
                <span>{paymentBreakdown.consultingFees} INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax Charges</span>
                <span>{paymentBreakdown.taxCharges} INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span>-{paymentBreakdown.discount} INR</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Payable</span>
                  <span>{paymentBreakdown.payable} INR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Now Button */}
          <button className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors">
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
