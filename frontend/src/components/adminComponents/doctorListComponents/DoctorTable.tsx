import React from "react";
import ToggleButton from "../../common/adminCommon/ToggleButton";
import { assets } from "../../../assets/assets";
import { Doctor, PaginationInfo } from "../../../types/admin/doctorListTypes";
import { signedUrltoNormalUrl } from "../../../utils/getUrl";

interface DoctorTableProps {
  doctors: Doctor[];
  pagination: PaginationInfo;
  loading: boolean;
  statusFilter: "approved" | "pending" | "rejected";
  onToggle: (id: string) => void;
  onInfo: (doctor: Doctor) => void;
  onVerify: (doctor: Doctor) => void;
  onPageChange: (page: number) => void;
}

const DoctorTable: React.FC<DoctorTableProps> = ({
  doctors,
  pagination,
  loading,
  statusFilter,
  onToggle,
  onInfo,
  onVerify,
  onPageChange,
}) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-red-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">No</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Info</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
              {statusFilter !== "rejected" && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : doctors.length > 0 ? (
              doctors.map((doctor, index) => (
                <tr key={doctor._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={doctor.image ? signedUrltoNormalUrl(doctor.image) : assets.doc11} alt={doctor.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.speciality?.name || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button onClick={() => onInfo(doctor)} className="hover:text-blue-500 focus:outline-none" title="View Doctor Info">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8 4a1 1 0 100-2 1 1 0 000 2zm1-8a1 1 0 10-2 0v4a1 1 0 102 0V6z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doctor.docStatus === "approved" ? "bg-green-100 text-green-800" : 
                      doctor.docStatus === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                    }`}>
                      {doctor.docStatus}
                    </span>
                  </td>
                  {statusFilter !== "rejected" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusFilter === "approved" ? (
                        <ToggleButton isBlocked={doctor.isBlocked} onClick={() => onToggle(doctor._id)} />
                      ) : statusFilter === "pending" ? (
                        <button onClick={() => onVerify(doctor)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">
                          Verify
                        </button>
                      ) : null}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">No doctors found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button onClick={() => onPageChange(Math.max(pagination.page - 1, 1))} disabled={pagination.page === 1} className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${pagination.page === index + 1 ? "bg-red-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                {index + 1}
              </button>
            ))}
            <button onClick={() => onPageChange(Math.min(pagination.page + 1, pagination.totalPages))} disabled={pagination.page === pagination.totalPages} className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

export default DoctorTable;
