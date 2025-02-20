import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa"; // Import edit icon
import axiosInstance from "../../utils/axiosInterceptors";
import ToggleButton from "../common/adminCommon/ToggleButton";
import { Sidebar } from "../common/adminCommon/Sidebar";

interface Service {
  _id: string;
  name: string;
  isActive: boolean;
}

const Service: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [newService, setNewService] = useState<{ name: string }>({ name: "" });
  const [errorMessage, setErrorMessage] = useState<string>(""); // For Add modal
  const [editErrorMessage, setEditErrorMessage] = useState<string>(""); // For Edit modal
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get("/admin/services");
        if (response.data?.data?.serviceList) {
          setServices(response.data.data.serviceList);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to fetch services");
      }
    };
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearchTerm) return services;
    return services.filter((service) =>
      service.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [services, searchTerm]);

  const { currentServices, totalPages } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      currentServices: filteredServices.slice(
        indexOfFirstItem,
        indexOfLastItem
      ),
      totalPages: Math.ceil(filteredServices.length / itemsPerPage),
    };
  }, [filteredServices, currentPage]);

  const handleToggleService = async (id: string) => {
    try {
      const response = await axiosInstance.patch(`/admin/toggleService/${id}`);
      if (response.data?.status) {
        setServices((prevServices) =>
          prevServices.map((service) =>
            service._id === id
              ? { ...service, isActive: !service.isActive }
              : service
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
    if (newService.name.length > 12) {
      setErrorMessage("Service name cannot exceed 12 characters.");
      return;
    }
    try {
      const response = await axiosInstance.post(
        "/admin/addService",
        newService
      );
      if (response.data?.status) {
        setServices((prevServices) => [response.data.service, ...prevServices]);
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
      const response = await axiosInstance.patch(
        `/admin/updateService/${selectedService._id}`,
        { name: selectedService.name }
      );
      if (response.data?.status) {
        setServices((prevServices) =>
          prevServices.map((service) =>
            service._id === selectedService._id
              ? { ...service, name: selectedService.name }
              : service
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
    <div className="flex min-h-screen ">
      <Sidebar onCollapse={setSidebarCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="p-8">
          {/* Header & Search */}
          <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800">Services</h1>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-96">
                <input
                  type="text"
                  placeholder="Search Services..."
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
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-150"
              >
                Add Service
              </button>
            </div>
          </div>

          {/* Service Table */}
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentServices.length > 0 ? (
                    currentServices.map((service, index) => (
                      <tr
                        key={service._id}
                        className="hover:bg-gray-50 transition duration-150 ease-in-out"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.isActive ? "Active" : "Inactive"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <ToggleButton
                              isBlocked={!service.isActive}
                              onClick={() => handleToggleService(service._id)}
                            />
                            <button
                              onClick={() => handleEditClick(service)}
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
                        colSpan={4}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No services found
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

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96">
            {/* Header */}
            <div className="bg-red-600 rounded-t-lg p-4">
              <h2 className="text-lg font-semibold text-white text-center">
                Add Service
              </h2>
            </div>
            {/* Content */}
            <div className="p-6 space-y-3">
              <input
                type="text"
                placeholder="Service Name"
                value={newService.name}
                onChange={(e) => {
                  setNewService({ name: e.target.value });
                  setErrorMessage("");
                }}
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
                  onClick={handleAddService}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96">
            {/* Header */}
            <div className="bg-red-600 rounded-t-lg p-4">
              <h2 className="text-lg font-semibold text-white text-center">
                Edit Service
              </h2>
            </div>
            {/* Content */}
            <div className="p-6 space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={selectedService.name}
                onChange={(e) => {
                  setSelectedService({
                    ...selectedService,
                    name: e.target.value,
                  });
                  setEditErrorMessage("");
                }}
                className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  editErrorMessage ? "border-red-500" : ""
                }`}
              />
              {editErrorMessage && (
                <p className="text-red-500 text-sm">{editErrorMessage}</p>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedService(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateService}
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

export default Service;
