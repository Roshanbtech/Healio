import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInterceptors";
import { assets } from "../../assets/assets";
import ToggleButton from "../common/adminCommon/ToggleButton";
import { Sidebar } from "../common/adminCommon/Sidebar";
import Pagination from "../common/adminCommon/Pagination";

// Debounce hook (same as before)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  isBlocked: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const UserList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Items per page
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/admin/users", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm,
        },
      });
      if (response.data?.status) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearchTerm]);

  const handleToggleUser = async (id: string) => {
    try {
      const response = await axiosInstance.patch(`/admin/users/${id}/toggle`);
      if (response.data?.status) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id ? { ...user, isBlocked: !user.isBlocked } : user
          )
        );
        toast.success(response.data.blockUser.message);
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to toggle user status");
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
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Users</h1>

                {/* Custom Search Bar */}
                <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full md:w-80 relative">
                  <input
                    type="text"
                    placeholder="Search Users...."
                    className="flex-grow bg-transparent outline-none text-gray-700"
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
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-red-600">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase hidden md:table-cell">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase hidden md:table-cell">
                        Mobile No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user, index) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={user?.image || assets.userDefault1}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {user.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ToggleButton
                            isBlocked={user.isBlocked}
                            onClick={() => handleToggleUser(user._id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
