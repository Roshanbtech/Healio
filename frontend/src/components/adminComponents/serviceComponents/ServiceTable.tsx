import React from "react";
import { Service, PaginationInfo } from "../../../types/admin/serviceListTypes";
import ToggleButton from "../../common/adminCommon/ToggleButton";
import { FaEdit } from "react-icons/fa";

interface ServiceTableProps {
  services: Service[];
  currentPage: number;
  itemsPerPage: number;
  pagination: PaginationInfo;
  onToggle: (id: string) => void;
  onEdit: (service: Service) => void;
  onPageChange: (page: number) => void;
}

const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  currentPage,
  itemsPerPage,
  pagination,
  onToggle,
  onEdit,
  onPageChange,
}) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-red-600">
              <tr>
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
              {services.length > 0 ? (
                services.map((service, index) => (
                  <tr key={service._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
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
                        <ToggleButton isBlocked={!service.isActive} onClick={() => onToggle(service._id)} />
                        <button onClick={() => onEdit(service)} className="text-green-600 hover:text-green-800 transition duration-150 ease-in-out">
                          <FaEdit size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                  currentPage === index + 1 ? "bg-red-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, pagination.totalPages))}
              disabled={currentPage === pagination.totalPages}
              className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

export default ServiceTable;
