"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInterceptors";
import ToggleButton from "../common/adminCommon/ToggleButton";
import { Sidebar } from "../common/adminCommon/Sidebar";

interface Coupon {
  _id?: string;
  name: string;
  code: string;
  discount: number;
  expirationDate: Date;
  startDate?: Date;
  isActive?: boolean;
}

const Coupon: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  // newCoupon holds form data as strings from the inputs.
  const [newCoupon, setNewCoupon] = useState({
    name: "",
    code: "",
    discount: 0,
    expirationDate: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [editErrorMessage, setEditErrorMessage] = useState<string>("");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Fetch coupons when the component mounts.
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axiosInstance.get("/admin/coupons");
        if (response.data?.coupons) {
          console.log("Fetched coupons:", response.data.coupons);
          setCoupons(response.data.coupons);
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        toast.error("Failed to fetch coupons");
      }
    };
    fetchCoupons();
  }, []);

  // Filter coupons based on the search term.
  const filteredCoupons = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearchTerm) return coupons;
    return coupons.filter(
      (coupon) =>
        coupon.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        coupon.code.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [coupons, searchTerm]);

  // Pagination logic.
  const { currentCoupons, totalPages } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      currentCoupons: filteredCoupons.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(filteredCoupons.length / itemsPerPage),
    };
  }, [filteredCoupons, currentPage]);

  // Validation for adding a coupon.
  const validateNewCoupon = (coupon: typeof newCoupon): string | null => {
    if (!coupon.name.trim()) return "Coupon name is required.";
    if (!coupon.code.trim()) return "Coupon code is required.";
    if (coupon.discount <= 0) return "Discount must be greater than 0.";
    if (!coupon.expirationDate.trim()) return "Expiration date is required.";
    const expDate = new Date(coupon.expirationDate);
    if (isNaN(expDate.getTime())) return "Invalid expiration date.";
    if (expDate <= new Date())
      return "Expiration date should be in the future.";
    return null;
  };

  // Validation for editing a coupon.
  const validateSelectedCoupon = (coupon: Coupon): string | null => {
    if (!coupon.name.trim()) return "Coupon name is required.";
    if (!coupon.code.trim()) return "Coupon code is required.";
    if (coupon.discount <= 0) return "Discount must be greater than 0.";
    if (!coupon.expirationDate) return "Expiration date is required.";
    const expDate = new Date(coupon.expirationDate);
    if (isNaN(expDate.getTime())) return "Invalid expiration date.";
    if (expDate <= new Date())
      return "Expiration date should be in the future.";
    return null;
  };

  // Handle adding a coupon.
  const handleAddCoupon = async () => {
    setErrorMessage(""); // Clear previous errors
    const validationError = validateNewCoupon(newCoupon);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    try {
      const payload = {
        ...newCoupon,
        expirationDate: new Date(newCoupon.expirationDate),
      };
      const response = await axiosInstance.post("/admin/coupons", payload);
      if (response.data?.status) {
        const addedCoupon = response.data.result.coupon;
        console.log("Added coupon:", addedCoupon);
        // Prepend the new coupon so it appears on the first page.
        setCoupons((prevCoupons) => [addedCoupon, ...prevCoupons]);
        toast.success("Coupon added successfully");
        setIsAddModalOpen(false);
        // Reset the form.
        setNewCoupon({ name: "", code: "", discount: 0, expirationDate: "" });
        setCurrentPage(1);
      } else {
        toast.error(response.data?.result?.message || "Failed to add coupon");
      }
    } catch (error) {
      console.error("Error adding coupon:", error);
      toast.error("Failed to add coupon");
    }
  };

  // When the edit button is clicked, open the edit modal with the coupon data.
  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsEditModalOpen(true);
  };

  // Handle updating a coupon.
  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return;
    const validationError = validateSelectedCoupon(selectedCoupon);
    if (validationError) {
      setEditErrorMessage(validationError);
      return;
    }
    try {
      const response = await axiosInstance.patch(
        `/admin/coupons/${selectedCoupon._id}`,
        selectedCoupon
      );
      if (response.data?.status) {
        setCoupons((prevCoupons) =>
          prevCoupons.map((coupon) =>
            coupon._id === selectedCoupon._id ? selectedCoupon : coupon
          )
        );
        toast.success("Coupon updated successfully");
        setIsEditModalOpen(false);
        setSelectedCoupon(null);
      } else {
        toast.error(response.data?.message || "Failed to update coupon");
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Failed to update coupon");
    }
  };

  // Toggle coupon active/inactive status.
  const handleToggleCoupon = async (couponId: string) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/coupons/${couponId}/toggle`
      );
      if (response.data?.status) {
        setCoupons((prevCoupons) =>
          prevCoupons.map((coupon) => {
            if (coupon._id === couponId) {
              return { ...coupon, isActive: !coupon.isActive };
            }
            return coupon;
          })
        );
        toast.success(response.data?.coupon?.message || "Coupon toggled successfully");
      } else {
        toast.error(response.data?.message || "Failed to update coupon");
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Failed to update coupon");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="p-8">
          {/* Header & Search */}
          <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800">Coupons</h1>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-96">
                <input
                  type="text"
                  placeholder="Search Coupons..."
                  className="flex-grow bg-transparent outline-none text-gray-700 focus:ring-0"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <button
                  type="button"
                  className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center ml-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              {/* Add Coupon Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-150"
              >
                Add Coupon
              </button>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-red-600">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Expiration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCoupons.length > 0 ? (
                    currentCoupons.map((coupon, index) => (
                      <tr
                        key={coupon._id}
                        className="hover:bg-gray-50 transition duration-150 ease-in-out"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {coupon.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.discount}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.startDate
                            ? new Date(coupon.startDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(coupon.expirationDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.isActive ? "Active" : "Inactive"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <ToggleButton
                              isBlocked={!coupon.isActive}
                              onClick={() =>
                                coupon._id && handleToggleCoupon(coupon._id)
                              }
                            />
                            <button
                              onClick={() => handleEditClick(coupon)}
                              className="text-green-600 hover:text-green-800 transition duration-150 ease-in-out"
                            >
                              <FaEdit size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No coupons found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === index + 1
                        ? "bg-red-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96">
            <div className="bg-red-600 rounded-t-lg p-4">
              <h2 className="text-lg font-semibold text-white text-center">
                Add Coupon
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <input
                type="text"
                placeholder="Coupon Name"
                value={newCoupon.name}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                placeholder="Coupon Code"
                value={newCoupon.code}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, code: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                placeholder="Discount (%)"
                value={newCoupon.discount}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    discount: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="datetime-local"
                placeholder="Expiration Date"
                value={newCoupon.expirationDate}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, expirationDate: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCoupon}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {isEditModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96">
            <div className="bg-red-600 rounded-t-lg p-4">
              <h2 className="text-lg font-semibold text-white text-center">
                Edit Coupon
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <input
                type="text"
                placeholder="Coupon Name"
                value={selectedCoupon.name}
                onChange={(e) =>
                  setSelectedCoupon({ ...selectedCoupon, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                placeholder="Coupon Code"
                value={selectedCoupon.code}
                onChange={(e) =>
                  setSelectedCoupon({ ...selectedCoupon, code: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                placeholder="Discount (%)"
                value={selectedCoupon.discount}
                onChange={(e) =>
                  setSelectedCoupon({
                    ...selectedCoupon,
                    discount: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="datetime-local"
                placeholder="Expiration Date"
                value={
                  selectedCoupon.expirationDate
                    ? new Date(selectedCoupon.expirationDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setSelectedCoupon({
                    ...selectedCoupon,
                    expirationDate: new Date(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {editErrorMessage && (
                <p className="text-red-500 text-sm">{editErrorMessage}</p>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedCoupon(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCoupon}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupon;
