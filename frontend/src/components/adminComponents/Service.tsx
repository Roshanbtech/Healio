"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/adminCommon/Sidebar";
import AddServiceModal from "./serviceComponents/AddServiceModal";
import EditServiceModal from "./serviceComponents/EditServiceModal";
import ServiceTable from "./serviceComponents/ServiceTable";
import type { Service, PaginationInfo, ServiceListResponse } from "../../types/admin/serviceListTypes";
import useDebounce from "../../hooks/useDebounce";

const Service: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
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
  const [newService, setNewService] = useState<{ name: string }>({ name: "" });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editErrorMessage, setEditErrorMessage] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get("/admin/services", {
        params: { page: currentPage, limit: itemsPerPage, search: debouncedSearchTerm },
      });
      if (response.data?.data?.serviceList) {
        const res: ServiceListResponse = response.data.data.serviceList;
        setServices(res.data);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    }
  };

  // Reset page to 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  // Refetch services on page or search term change
  useEffect(() => {
    fetchServices();
  }, [currentPage, debouncedSearchTerm]);

  const handleToggleService = async (id: string) => {
    try {
      const response = await axiosInstance.patch(`/admin/services/${id}/toggle`);
      if (response.data?.status) {
        setServices((prev) =>
          prev.map((service) =>
            service._id === id ? { ...service, isActive: !service.isActive } : service
          )
        );
        toast.success(response.data.service.message);
      }
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast.error("Failed to toggle service status");
    }
  };

  const handleAddService = async () => {
    if (!newService.name.trim()) {
      setErrorMessage("Service name cannot be empty.");
      return;
    }
    if (newService.name.length > 20) {
      setErrorMessage("Service name cannot exceed 20 characters.");
      return;
    }
    try {
      const response = await axiosInstance.post("/admin/services", newService);
      if (response.data?.status) {
        fetchServices();
        toast.success("Service added successfully");
        setIsAddModalOpen(false);
        setNewService({ name: "" });
      }
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Failed to add service");
    }
  };

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleUpdateService = async () => {
    if (!selectedService || !selectedService.name.trim()) {
      setEditErrorMessage("Service name is required.");
      return;
    }
    try {
      const response = await axiosInstance.patch(`/admin/services/${selectedService._id}`, {
        name: selectedService.name,
      });
      if (response.data?.status) {
        setServices((prev) =>
          prev.map((service) =>
            service._id === selectedService._id ? { ...service, name: selectedService.name } : service
          )
        );
        toast.success("Service updated successfully");
        setIsEditModalOpen(false);
        setSelectedService(null);
      }
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Failed to update service");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800">Services</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-96">
                <input
                  type="text"
                  placeholder="Search Services..."
                  className="flex-grow bg-transparent outline-none text-gray-700 focus:ring-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-150"
              >
                Add Service
              </button>
            </div>
          </div>
          <ServiceTable
            services={services}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            pagination={pagination}
            onToggle={handleToggleService}
            onEdit={handleEditClick}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {isAddModalOpen && (
        <AddServiceModal
          newService={newService}
          errorMessage={errorMessage}
          onNewServiceChange={(value) => setNewService({ name: value })}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddService}
        />
      )}
      {isEditModalOpen && selectedService && (
        <EditServiceModal
          selectedService={selectedService}
          errorMessage={editErrorMessage}
          onServiceNameChange={(value) => setSelectedService({ ...selectedService, name: value })}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedService(null);
          }}
          onUpdate={handleUpdateService}
        />
      )}
    </div>
  );
};

export default Service;
