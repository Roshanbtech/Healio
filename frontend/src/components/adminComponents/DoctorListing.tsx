import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/adminCommon/Sidebar";
import DoctorTable from "./doctorListComponents/DoctorTable";
import VerificationModal from "./doctorListComponents/VerificationModal";
import InfoModal from "./doctorListComponents/InfoModal";
import { Doctor, PaginationInfo } from "../../types/admin/doctorListTypes";

const DoctorList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<"approved" | "pending" | "rejected">("approved");
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string[]>([]);
  const [currentCertIndex, setCurrentCertIndex] = useState<number>(0);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [selectedInfoDoctor, setSelectedInfoDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/admin/doctors", {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter,
        },
      });
      if (response.data?.doctorList) {
        setDoctors(response.data.doctorList.data);
        setPagination(response.data.doctorList.pagination);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to fetch doctors");
      }
    }
    setLoading(false);
  };

  // Debounced effect handles initial fetch and subsequent updates.
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (currentPage !== 1 && searchTerm) {
        setCurrentPage(1);
      }
      fetchDoctors();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage, statusFilter]);

  const handleToggleDoctor = async (id: string) => {
    try {
      const response = await axiosInstance.patch(`/admin/doctors/${id}/toggle`);
      if (response.data.blockDoctor?.message) {
        setDoctors((prevDoctors) =>
          prevDoctors.map((doctor) =>
            doctor._id === id ? { ...doctor, isBlocked: !doctor.isBlocked } : doctor
          )
        );
        toast.success(response.data.blockDoctor.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to toggle doctor status");
      }
    }
  };

  const fetchCertificates = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/admin/doctors/${id}/certificates`);
      if (response.data.certificates) {
        setSelectedFile(response.data.certificates);
        setCurrentCertIndex(0);
      } else {
        setSelectedFile([]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
        setSelectedFile([]);
      }
    }
  };

  const openVerifyModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    fetchCertificates(doctor._id);
    setShowRejectInput(false);
    setRejectionReason("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
    setShowRejectInput(false);
    setRejectionReason("");
  };

  const handleApprove = async () => {
    if (!selectedDoctor) return;
    if (selectedDoctor.certificate?.length === 0) {
      toast.error("No certificates found for this doctor");
      return;
    }
    try {
      const response = await axiosInstance.patch(
        `/admin/doctors/${selectedDoctor._id}/certificates/accept`
      );
      if (response.data?.status) {
        toast.success(response.data.message || "Doctor approved successfully");
      } else {
        toast.error(response.data.message || "Failed to approve doctor");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to approve doctor");
      }
    }
    closeModal();
    fetchDoctors(); // Update table by re-fetching data
  };
  
  const handleConfirmReject = async () => {
    if (!selectedDoctor) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      const response = await axiosInstance.patch(
        `/admin/doctors/${selectedDoctor._id}/certificates/reject`,
        { reason: rejectionReason }
      );
      if (response.data?.status) {
        toast.success(response.data.message || "Doctor rejected successfully");
      } else {
        toast.error(response.data.message || "Failed to reject doctor");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to reject doctor");
      }
    }
    closeModal();
    fetchDoctors(); 
  };
  

  const handleRejectButton = async () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return Promise.resolve();
    } else {
      return handleConfirmReject();
    }
  };

  const openInfoModal = (doctor: Doctor) => {
    setSelectedInfoDoctor(doctor);
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
    setSelectedInfoDoctor(null);
  };

  const changeStatusFilter = (status: "approved" | "pending" | "rejected") => {
    setStatusFilter(status);
    setCurrentPage(1);
    setLoading(true);
    setDoctors([]);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-3xl font-bold text-gray-800">Doctors</h1>
              <div className="relative mt-4 sm:mt-0">
                <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full sm:w-96">
                  <input
                    type="text"
                    placeholder="Search Doctors..."
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
              </div>
            </div>
            <div className="mb-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => changeStatusFilter("approved")} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === "approved" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>APPROVED</button>
                <button onClick={() => changeStatusFilter("pending")} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === "pending" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>PENDING</button>
                <button onClick={() => changeStatusFilter("rejected")} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === "rejected" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>REJECTED</button>
              </nav>
            </div>
            <DoctorTable
              doctors={doctors}
              pagination={pagination}
              loading={loading}
              statusFilter={statusFilter}
              onToggle={handleToggleDoctor}
              onInfo={openInfoModal}
              onVerify={openVerifyModal}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      {showModal && selectedDoctor && (
        <VerificationModal
          doctor={selectedDoctor}
          certificates={selectedFile}
          currentCertIndex={currentCertIndex}
          onCertChange={setCurrentCertIndex}
          onApprove={handleApprove}
          onReject={handleRejectButton}
          showRejectInput={showRejectInput}
          rejectionReason={rejectionReason}
          onRejectionReasonChange={setRejectionReason}
          onClose={closeModal}
        />
      )}
      {showInfoModal && selectedInfoDoctor && (
        <InfoModal
          doctor={selectedInfoDoctor}
          currentCertIndex={currentCertIndex}
          onCertChange={setCurrentCertIndex}
          onClose={closeInfoModal}
        />
      )}
    </div>
  );
};

export default DoctorList;
