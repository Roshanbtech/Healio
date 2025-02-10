import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInterceptors";
import profile from "../../assets/profile_pic.png";
import ToggleButton from "../common/adminCommon/ToggleButton";
import { Sidebar } from "../common/adminCommon/Sidebar";

interface Speciality {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  isBlocked: boolean;
  speciality?: Speciality;
  experience?: string;
  docStatus: "pending" | "approved" | "rejected";
}

const DoctorList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [statusFilter, setStatusFilter] = useState<"approved" | "pending" | "rejected">("approved");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axiosInstance.get("/admin/getDoctors");
        if (response.data?.doctorList) {
          setDoctors(response.data.doctorList);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to fetch doctors");
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase().trim();
    let filtered = doctors.filter((doctor) => doctor.docStatus === statusFilter);

    if (searchTermLower) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTermLower) ||
          doctor.email.toLowerCase().includes(searchTermLower) ||
          doctor.phone?.toLowerCase().includes(searchTermLower) ||
          doctor.speciality?.name?.toLowerCase().includes(searchTermLower)
      );
    }

    return filtered;
  }, [doctors, searchTerm, statusFilter]);

  const { currentDoctors, totalPages } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      currentDoctors: filteredDoctors.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(filteredDoctors.length / itemsPerPage),
    };
  }, [filteredDoctors, currentPage]);

  const handleToggleDoctor = async (id: string) => {
    try {
      const response = await axiosInstance.patch(`/admin/toggleDoctor/${id}`);
      if (response.data?.status && response.data.blockUser?.message) {
        setDoctors((prevDoctors) =>
          prevDoctors.map((doctor) =>
            doctor._id === id ? { ...doctor, isBlocked: !doctor.isBlocked } : doctor
          )
        );
        toast.success(response.data.blockUser.message);
      }
    } catch (error) {
      console.error("Error toggling doctor status:", error);
      toast.error("Failed to toggle doctor status");
    }
  };

  const [selectedFile, setSelectedFile] = useState<string[]>([]);
  const [currentCertIndex, setCurrentCertIndex] = useState<number>(0);

  const fetchCertificates = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/admin/docCert/${id}`);
      if (response.data.certificates) {
        setSelectedFile(response.data.certificates);
        setCurrentCertIndex(0);
      } else {
        setSelectedFile([]);
      }
    } catch (error: any) {
      console.error(error);
      setSelectedFile([]);
    }
  };

  const openVerifyModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    fetchCertificates(doctor._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };

  const handleApprove = async () => {
    if (!selectedDoctor) return;
    try {
      const response = await axiosInstance.patch(`/admin/docCertAccept/${selectedDoctor._id}`);
      if (response.data?.status) {
        setDoctors((prevDoctors) =>
          prevDoctors.map((doctor) =>
            doctor._id === selectedDoctor._id ? { ...doctor, docStatus: "approved" } : doctor
          )
        );
        toast.success(response.data.message || "Doctor approved successfully");
      } else {
        toast.error(response.data.message || "Failed to approve doctor");
      }
    } catch (error: any) {
      console.error("Error approving doctor:", error);
      toast.error("Failed to approve doctor");
    }
    closeModal();
  };

  const handleReject = async () => {
    if (!selectedDoctor) return;
    try {
      const response = await axiosInstance.patch(`/admin/docCertReject/${selectedDoctor._id}`);
      if (response.data?.status) {
        setDoctors((prevDoctors) =>
          prevDoctors.map((doctor) =>
            doctor._id === selectedDoctor._id ? { ...doctor, docStatus: "rejected" } : doctor
          )
        );
        toast.success(response.data.message || "Doctor rejected successfully");
      } else {
        toast.error(response.data.message || "Failed to reject doctor");
      }
    } catch (error: any) {
      console.error("Error rejecting doctor:", error);
      toast.error("Failed to reject doctor");
    }
    closeModal();
  };

  return (
    <div className="flex min-h-screen">
  {/* Sidebar */}
  <Sidebar onCollapse={setSidebarCollapsed} />

 {/* Main Content */}
<div
  className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}
>
  <div className="flex justify-center">
    <div className="w-full max-w-7xl px-4 py-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Doctors</h1>
        <div className="relative mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Search Doctors..."
            className="pl-10 pr-4 py-2 border rounded-full w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-150 ease-in-out"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setStatusFilter("approved")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === "approved"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            APPROVED
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === "pending"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            PENDING
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === "rejected"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            REJECTED
          </button>
        </nav>
      </div>

      {/* Doctor Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-red-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                    {currentDoctors.length > 0 ? (
                      currentDoctors.map((doctor, index) => (
                        <tr
                          key={doctor._id}
                          className="hover:bg-gray-50 transition duration-150 ease-in-out"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={doctor.image || profile}
                              alt={doctor.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doctor.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctor.speciality?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctor.experience || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doctor.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                doctor.docStatus === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : doctor.docStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {doctor.docStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {statusFilter === "approved" ? (
                              <ToggleButton
                                isBlocked={doctor.isBlocked}
                                onClick={() => handleToggleDoctor(doctor._id)}
                              />
                            ) : statusFilter === "pending" ? (
                              <button
                                onClick={() => openVerifyModal(doctor)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                              >
                                Verify
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                          No doctors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal for Verification */}
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
                <div className="bg-white p-6 rounded shadow-lg z-50 max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">Verify Doctor</h2>
                  <div className="mb-4">
                    {selectedFile.length > 0 ? (
                      <div className="relative">
                        <iframe
                          src={selectedFile[currentCertIndex]}
                          title="Certificate Document"
                          className="w-full h-64 rounded"
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                        {selectedFile.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setCurrentCertIndex(
                                  (prev) => (prev - 1 + selectedFile.length) % selectedFile.length
                                )
                              }
                              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white p-2 rounded-full"
                            >
                              {"<"}
                            </button>
                            <button
                              onClick={() =>
                                setCurrentCertIndex((prev) => (prev + 1) % selectedFile.length)
                              }
                              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white p-2 rounded-full"
                            >
                              {">"}
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-gray-200 rounded">
                        <span>No Certificates Found</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={handleApprove}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={handleReject}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                        currentPage === index + 1 ? "bg-red-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
      </div>
    </div>
  );
};

export default DoctorList;
