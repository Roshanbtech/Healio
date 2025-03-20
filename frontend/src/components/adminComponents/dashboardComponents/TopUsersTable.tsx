import React from "react";
import { Calendar } from "lucide-react";

interface User {
  _id: string;
  bookingsCount: number;
  totalSpent: number;
  lastVisit: string;
  userDetails: {
    name: string;
    image: string;
  };
}

interface TopUsersTableProps {
  users: User[];
}

const TopUsersTable: React.FC<TopUsersTableProps> = ({ users }) => {
  const formatLastVisit = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div className="bg-red-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Top Patients</h2>
        <p className="text-red-100 text-sm">Patients ranked by activity</p>
      </div>
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-red-600 text-white">
              <th className="py-4 px-8 text-left text-sm font-medium uppercase tracking-wider">
                Patient
              </th>
              <th className="py-4 px-8 text-left text-sm font-medium uppercase tracking-wider">
                Bookings
              </th>
              <th className="py-4 px-8 text-left text-sm font-medium uppercase tracking-wider">
                Last Visit
              </th>
              <th className="py-4 px-8 text-left text-sm font-medium uppercase tracking-wider">
                Spending (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr
                key={user._id}
                className="group hover:bg-red-50 transition-all duration-300 ease-in-out"
              >
                <td className="py-5 px-8">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-red-300 group-hover:scale-110 transition-all duration-300">
                        <img
                          src={user.userDetails.image}
                          alt={user.userDetails.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-400 border-2 border-white"></span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors duration-200">
                        {user.userDetails.name}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-700">
                        {`PATIENT #${user._id.slice(0, 6).toUpperCase()}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 group-hover:bg-red-200 group-hover:shadow-md transition-all duration-200">
                    {user.bookingsCount}
                  </span>
                </td>
                <td className="py-5 px-8 whitespace-nowrap">
                  <div className="flex items-center group-hover:translate-x-1 transition-transform duration-200">
                    <Calendar className="h-4 w-4 text-red-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {formatLastVisit(user.lastVisit)}
                    </span>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <span className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                    ₹{user.totalSpent.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-8 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">Showing {users.length} patients</p>
      </div>
    </div>
  );
};

export default TopUsersTable;
