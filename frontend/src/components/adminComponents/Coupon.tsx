"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/adminCommon/Sidebar";
import AddCouponModal from "./couponComponents/AddCouponModal";
import EditCouponModal from "./couponComponents/EditCouponModal";
import CouponTable from "./couponComponents/CouponTable";
import type { Coupon, PaginationInfo, CouponListResponse } from "../../types/admin/couponListTypes";

const Coupon: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const itemsPerPage = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [newCoupon, setNewCoupon] = useState({
    name: "",
    code: "",
    discount: 0,
    expirationDate: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [editErrorMessage, setEditErrorMessage] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get("/admin/coupons", {
        params: { page: currentPage, limit: itemsPerPage, search: searchTerm },
      });
      if (response.data?.coupons) {
        const res: CouponListResponse = response.data.coupons;
        setCoupons(res.data);
        setPagination(res.pagination);
      }
    } catch (error: unknown) {
      if(error instanceof Error) {
        toast.error(error.message || "Failed to fetch coupons");
      }
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoupons();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage]);
  

  const handleToggleCoupon = async (couponId: string) => {
    try {
      const response = await axiosInstance.patch(`/admin/coupons/${couponId}/toggle`);
      if (response.data?.coupon?.status) {
        setCoupons((prev) =>
          prev.map((coupon) =>
            coupon._id === couponId ? { ...coupon, isActive: !coupon.isActive } : coupon
          )
        );
        toast.success(response.data?.coupon?.message || "Coupon toggled successfully");
      } else {
        toast.error(response.data?.message || "Failed to update coupon");
      }
    } catch (error: unknown) {
      if(error instanceof Error) {
        toast.error(error.message || "Failed to update coupon");
      }
    }
  };

  const validateNewCoupon = (coupon: typeof newCoupon): string | null => {
    if (!coupon.name.trim()) return "Coupon name is required.";
    if (!coupon.code.trim()) return "Coupon code is required.";
    if (coupon.discount <= 0) return "Discount must be greater than 0.";
    if (!coupon.expirationDate.trim()) return "Expiration date is required.";
    const expDate = new Date(coupon.expirationDate);
    if (isNaN(expDate.getTime())) return "Invalid expiration date.";
    if (expDate <= new Date()) return "Expiration date should be in the future.";
    return null;
  };

  const handleAddCoupon = async () => {
    setErrorMessage("");
    const validationError = validateNewCoupon(newCoupon);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    try {
      const payload = { ...newCoupon, expirationDate: new Date(newCoupon.expirationDate) };
      const response = await axiosInstance.post("/admin/coupons", payload);
      if (response.data?.status) {
        toast.success("Coupon added successfully");
        setIsAddModalOpen(false);
        setNewCoupon({ name: "", code: "", discount: 0, expirationDate: "" });
        setCurrentPage(1);
        fetchCoupons();
      } else {
        toast.error(response.data?.message || "Failed to add coupon");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message || "Failed to add coupon");
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to add coupon");
      } else {
        toast.error("An unknown error occurred. Please try again.");
      }
    }
  };
  

  const validateSelectedCoupon = (coupon: Coupon): string | null => {
    if (!coupon.name.trim()) return "Coupon name is required.";
    if (!coupon.code.trim()) return "Coupon code is required.";
    if (coupon.discount <= 0) return "Discount must be greater than 0.";
    if (!coupon.expirationDate) return "Expiration date is required.";
    const expDate = new Date(coupon.expirationDate);
    if (isNaN(expDate.getTime())) return "Invalid expiration date.";
    if (expDate <= new Date()) return "Expiration date should be in the future.";
    return null;
  };

  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsEditModalOpen(true);
  };

  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return;
    const validationError = validateSelectedCoupon(selectedCoupon);
    if (validationError) {
      setEditErrorMessage(validationError);
      return;
    }
    try {
      const response = await axiosInstance.patch(`/admin/coupons/${selectedCoupon._id}`, selectedCoupon);
      if (response.data?.status) {
        setCoupons((prev) =>
          prev.map((coupon) => (coupon._id === selectedCoupon._id ? selectedCoupon : coupon))
        );
        toast.success("Coupon updated successfully");
        setIsEditModalOpen(false);
        setSelectedCoupon(null);
      } else {
        toast.error(response.data?.message || "Failed to update coupon");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || error.message || "Failed to update coupon");
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to update coupon");
      } else {
        toast.error("An unknown error occurred. Please try again.");
      }
    }
  };
  

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800">Coupons</h1>
            <div className="flex items-center space-x-4">
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
                <button type="button" className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center ml-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <button onClick={() => setIsAddModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-150">
                Add Coupon
              </button>
            </div>
          </div>
          <CouponTable
            coupons={coupons}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            pagination={pagination}
            onToggle={handleToggleCoupon}
            onEdit={handleEditClick}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {isAddModalOpen && (
        <AddCouponModal
          newCoupon={newCoupon}
          errorMessage={errorMessage}
          onNewCouponChange={(field, value) => setNewCoupon({ ...newCoupon, [field]: value })}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCoupon}
        />
      )}
      {isEditModalOpen && selectedCoupon && (
        <EditCouponModal
          selectedCoupon={selectedCoupon}
          errorMessage={editErrorMessage}
          onCouponChange={(field, value) => setSelectedCoupon({ ...selectedCoupon, [field]: value })}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCoupon(null);
          }}
          onUpdate={handleUpdateCoupon}
        />
      )}
    </div>
  );
};

export default Coupon;
