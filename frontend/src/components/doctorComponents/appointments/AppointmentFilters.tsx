import React from "react";

interface AppointmentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  clearDateFilter: () => void;
}

const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  clearDateFilter,
}) => {
  return (
    <div className="mb-6 bg-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
      <div className="relative mt-4 sm:mt-0">
        <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full sm:w-96">
          <input
            type="text"
            placeholder="Search Appointments..."
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
      </div>
      <div className="mt-2 md:mt-0 flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-2">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {["pending", "accepted", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                statusFilter === status
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </nav>
        <div className="flex items-center mt-2 md:mt-0 self-end">
          <div className="relative flex items-center">
            <label htmlFor="dateFilter" className="mr-2 text-sm font-medium text-gray-700">
              Date:
            </label>
            <input
              type="date"
              id="dateFilter"
              className="border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm p-2"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button onClick={clearDateFilter} className="ml-2 text-sm text-red-600 hover:text-red-800">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFilters;
