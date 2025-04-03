"use client";

import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";

interface EditCouponModalProps {
  selectedCoupon: { _id: string; name: string; code: string; discount: number; expirationDate: string };
  errorMessage: string;
  onCouponChange: (field: keyof EditCouponModalProps["selectedCoupon"], value: string | number) => void;
  onClose: () => void;
  onUpdate: () => void;
}

const EditCouponModal: React.FC<EditCouponModalProps> = ({
  selectedCoupon,
  errorMessage,
  onCouponChange,
  onClose,
  onUpdate,
}) => {
  const [localError, setLocalError] = useState<string>("");

  const validateAndUpdate = () => {
    const { name, code, discount, expirationDate } = selectedCoupon;
    if (!name.trim()) {
      setLocalError("Coupon name is required.");
      return;
    }
    if (!code.trim()) {
      setLocalError("Coupon code is required.");
      return;
    }
    if (discount <= 0) {
      setLocalError("Discount must be greater than 0.");
      return;
    }
    if (!expirationDate.trim()) {
      setLocalError("Expiration date is required.");
      return;
    }
    const expDate = new Date(expirationDate);
    if (isNaN(expDate.getTime())) {
      setLocalError("Invalid expiration date.");
      return;
    }
    if (expDate <= new Date()) {
      setLocalError("Expiration date should be in the future.");
      return;
    }
    setLocalError("");
    onUpdate();
  };

  const inputClassName = `w-full bg-green-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
    localError || errorMessage
      ? "border-red-500 focus:ring-red-500"
      : "border-green-500 focus:ring-green-500"
  }`;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-96">
        <div className="bg-red-600 rounded-t-lg p-4">
          <h2 className="text-lg font-semibold text-white text-center">
            Edit Coupon <FaEdit size={16} className="inline ml-1" />
          </h2>
        </div>
        <div className="p-6 space-y-3">
          <input
            type="text"
            placeholder="Coupon Name"
            value={selectedCoupon.name}
            onChange={(e) => {
              onCouponChange("name", e.target.value);
              setLocalError("");
            }}
            className={inputClassName}
          />
          <input
            type="text"
            placeholder="Coupon Code"
            value={selectedCoupon.code}
            onChange={(e) => onCouponChange("code", e.target.value)}
            className="w-full bg-green-100 rounded-lg px-4 py-2 border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Discount (%)"
            value={selectedCoupon.discount}
            onChange={(e) => onCouponChange("discount", Number(e.target.value))}
            className="w-full bg-green-100 rounded-lg px-4 py-2 border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="datetime-local"
            placeholder="Expiration Date"
            // Use slice(0,16) to include both date and time
            value={
              selectedCoupon.expirationDate
                ? new Date(selectedCoupon.expirationDate).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) => onCouponChange("expirationDate", e.target.value)}
            className="w-full bg-green-100 rounded-lg px-4 py-2 border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {(localError || errorMessage) && (
            <p className="text-red-500 text-sm">{localError || errorMessage}</p>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={validateAndUpdate}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCouponModal;
