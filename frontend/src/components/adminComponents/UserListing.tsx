import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInterceptors";
import { assets } from "../../assets/assets";
import ToggleButton from "../common/adminCommon/ToggleButton";
import { Sidebar } from "../common/adminCommon/Sidebar";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  isBlocked: boolean;
}

const UserList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [users, setUsers] = useState<User[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/admin/getUsers");
        if (response.data?.userList) {
          setUsers(response.data.userList);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase().trim();
    if (!searchTermLower) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        user.phone?.toLowerCase().includes(searchTermLower)
    );
  }, [users, searchTerm]);

  const { currentUsers, totalPages } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      currentUsers: filteredUsers.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(filteredUsers.length / itemsPerPage),
    };
  }, [filteredUsers, currentPage]);

  const handleToggleUser = async (id: string) => {
    try {
      const response = await axiosInstance.patch(`/admin/toggleUser/${id}`);
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

      {/* Main Content */}
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
                <h1 className="text-2xl font-bold text-gray-800">
                  User Management
                </h1>
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    {currentUsers.map((user, index) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={user.image || assets.userDefault1}
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
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium
                        ${
                          currentPage === index + 1
                            ? "bg-red-600 text-white border-red-600"
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
                    className="px-4 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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

export default UserList;
