import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/adminCommon/Sidebar";
import Pagination from "../common/adminCommon/Pagination";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { assets } from "../../assets/assets";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  docStatus: string;
  fees: number;
  averageRating: number | null;
}

interface Appointment {
  _id: string;
  appointmentId: string;
  patientId: Patient;
  doctorId: Doctor;
  date: string;
  time: string;
  status: string;
  fees: number;
  paymentMethod: string;
  paymentStatus: string;
  couponCode: string | null;
  couponDiscount: string | null;
  isApplied: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AppliedFilters {
  startDate: string;
  endDate: string;
  status?: string;
  search?: string;
}

const ReportManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [reports, setReports] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const itemsPerPage = 10;

  useEffect(() => {
    if (appliedFilters) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedFilters]);

  const fetchReports = async () => {
    if (
      !appliedFilters ||
      !appliedFilters.startDate ||
      !appliedFilters.endDate
    ) {
      return;
    }
    if (new Date(appliedFilters.startDate) > new Date(appliedFilters.endDate)) {
      toast.error("Start date cannot be greater than end date.");
      return;
    }
    setLoading(true);
    try {
      const params: { [key: string]: any } = {
        page: currentPage,
        limit: itemsPerPage,
        search: appliedFilters.search || "",
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
      };
      if (appliedFilters.status) params.status = appliedFilters.status;
      const response = await axiosInstance.get("/admin/reports", { params });
      if (response.data?.status) {
        setReports(response.data.data.data);
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        } else {
          setPagination({
            total: response.data.data.length,
            page: currentPage,
            limit: itemsPerPage,
            totalPages: Math.ceil(response.data.data.length / itemsPerPage),
          });
        }
      } else {
        setReports([]);
      }
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error(error.response?.data?.message || "Failed to fetch reports");
      setReports([]);
    }
    setLoading(false);
  };

  // Fetch all records for PDF generation (ignores pagination)
  const fetchAllReportsForPDF = async () => {
    try {
      const params: { [key: string]: any } = {
        search: appliedFilters?.search || "",
        startDate: appliedFilters!.startDate,
        endDate: appliedFilters!.endDate,
        limit: 10000, // high limit to fetch all records
      };
      if (appliedFilters?.status) params.status = appliedFilters.status;
      const response = await axiosInstance.get("/admin/reports", { params });
      if (response.data?.status) {
        return response.data.data.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching all reports:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch full reports for PDF"
      );
      return [];
    }
  };

  const applyFilters = () => {
    if (!startDate || !endDate) {
      toast.error(
        "Both start date and end date must be provided to filter reports."
      );
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be greater than end date.");
      return;
    }
    setCurrentPage(1);
    setAppliedFilters({
      startDate,
      endDate,
      status: statusFilter,
      search: debouncedSearchTerm,
    });
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("");
    setSearchTerm("");
    setAppliedFilters(null);
    setCurrentPage(1);
    setReports([]);
    setPagination(null);
  };
  const downloadPDF = async () => {
    if (
      !appliedFilters ||
      !appliedFilters.startDate ||
      !appliedFilters.endDate
    ) {
      toast.error("Please apply filters to download the report.");
      return;
    }

    const allReports = await fetchAllReportsForPDF();
    if (!allReports || allReports.length === 0) {
      toast.error("No data found for the selected filters.");
      return;
    }

    const doc = new jsPDF("p", "pt");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    const headerHeight = 60;
    doc.setFillColor(220, 53, 69);
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    doc.addImage(assets.logo, "PNG", margin, 10, 40, 40);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(
      "HEALIO APPOINTMENTS REPORT",
      pageWidth / 2,
      headerHeight / 2 + 7,
      { align: "center" }
    );

    doc.setFillColor(240, 240, 240);
    doc.roundedRect(
      margin,
      headerHeight + 15,
      pageWidth - margin * 2,
      25,
      3,
      3,
      "F"
    );
    doc.setTextColor(70, 70, 70);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      pageWidth - margin - 10,
      headerHeight + 30,
      { align: "right" }
    );

    let startY = headerHeight + 60;

    if (appliedFilters) {
      doc.setFillColor(245, 245, 245);
      const filterBoxHeight =
        20 +
        (appliedFilters.startDate ? 15 : 0) +
        (appliedFilters.endDate ? 15 : 0) +
        (appliedFilters.status ? 15 : 0) +
        (appliedFilters.search ? 15 : 0) +
        10;

      doc.roundedRect(
        margin,
        startY,
        pageWidth - margin * 2,
        filterBoxHeight,
        3,
        3,
        "F"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(34, 82, 34);
      doc.text("Applied Filters:", margin + 10, startY + 15);

      let filterY = startY + 15;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);

      if (appliedFilters.startDate) {
        filterY += 15;
        doc.text(
          `Start Date: ${new Date(
            appliedFilters.startDate
          ).toLocaleDateString()}`,
          margin + 20,
          filterY
        );
      }

      if (appliedFilters.endDate) {
        filterY += 15;
        doc.text(
          `End Date: ${new Date(appliedFilters.endDate).toLocaleDateString()}`,
          margin + 20,
          filterY
        );
      }

      if (appliedFilters.status) {
        filterY += 15;
        doc.text(`Status: ${appliedFilters.status}`, margin + 20, filterY);
      }

      if (appliedFilters.search) {
        filterY += 15;
        doc.text(`Search: ${appliedFilters.search}`, margin + 20, filterY);
      }

      startY += filterBoxHeight + 20;
    }

    // Added SI No. to the columns
    const tableColumn = [
      "SI No.",
      "Appointment ID",
      "Doctor",
      "Patient",
      "Date",
      "Time",
      "Status",
      "Fees",
    ];
    const tableRows: any[][] = [];
    let totalFees = 0;

    // Update this condition to check if status filter is specifically "completed"
    const shouldShowTotal =
      appliedFilters?.status?.toLowerCase() === "completed" ||
      !appliedFilters?.status;

    allReports.forEach(
      (
        report: {
          status: string;
          fees: number;
          appointmentId: any;
          doctorId: { name: any };
          patientId: { name: any };
          date: string | number | Date;
          time: any;
        },
        index: number
      ) => {
        // Only add to total if status is completed
        if (report.status.toLowerCase() === "completed") {
          totalFees += report.fees;
        }

        const reportData = [
          (index + 1).toString(), // Adding serial number
          report.appointmentId,
          report.doctorId.name,
          report.patientId.name,
          new Date(report.date).toLocaleDateString(),
          report.time,
          report.status,
          `Rs. ${report.fees}`,
        ];

        tableRows.push(reportData);
      }
    );

    const chunkSize = 15;
    const chunks = [];

    for (let i = 0; i < tableRows.length; i += chunkSize) {
      chunks.push(tableRows.slice(i, i + chunkSize));
    }

    chunks.forEach((chunk, index) => {
      if (index > 0) {
        doc.addPage();

        doc.setFillColor(220, 53, 69);
        doc.rect(0, 0, pageWidth, headerHeight, "F");
        doc.addImage(assets.logo, "PNG", margin, 10, 40, 40);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(
          "HEALIO APPOINTMENTS REPORT",
          pageWidth / 2,
          headerHeight / 2 + 7,
          { align: "center" }
        );

        startY = headerHeight + 30;
      }

      autoTable(doc, {
        head: [tableColumn],
        body: chunk,
        startY: startY,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
          fillColor: [220, 53, 69],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center" }, // SI No.
          1: { halign: "center" }, // Appointment ID
          4: { halign: "center" }, // Date
          5: { halign: "center" }, // Time
          6: { halign: "center" }, // Status
          7: { halign: "right" }, // Fees
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
    });

    // Only show total for completed status or when no status filter is applied
    if (shouldShowTotal && totalFees > 0) {
      const finalY = (doc as any).lastAutoTable.finalY + 20;

      doc.setFillColor(220, 53, 69, 0.1);
      doc.roundedRect(pageWidth - 200, finalY - 15, 160, 30, 3, 3, "F");

      doc.setDrawColor(220, 53, 69);
      doc.setLineWidth(1);
      doc.roundedRect(pageWidth - 200, finalY - 15, 160, 30, 3, 3, "S");

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 53, 69);
      doc.text(`Total:`, pageWidth - 180, finalY, { align: "left" });

      doc.setFontSize(14);
      doc.text(`Rs. ${totalFees.toLocaleString()}`, pageWidth - 60, finalY, {
        align: "right",
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "italic");
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 20, {
        align: "center",
      });

      doc.setDrawColor(220, 53, 69, 0.5);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
    }

    doc.save("appointment_reports.pdf");
    toast.success("PDF downloaded successfully");
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
                <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full md:w-80 relative">
                  <input
                    type="text"
                    placeholder="Search Appointments..."
                    className="flex-grow bg-transparent outline-none text-gray-700"
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
            </div>
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Filter Reports
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={applyFilters}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                      Apply Filters
                    </button>
                    <button
                      onClick={clearFilters}
                      className="w-full bg-green-100 hover:bg-green-200 text-green-600 py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Appointment List
                </h2>
                <button
                  onClick={downloadPDF}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </button>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-red-600">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                          Appointment ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">
                          Payment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reports.length > 0 ? (
                        reports.map((report, index) => (
                          <tr key={report._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {report.appointmentId}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {report.doctorId.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {report.doctorId.email}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {report.doctorId.phone}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {report.patientId.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {report.patientId.email}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {report.patientId.phone}
                                </span>
                                <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {report.patientId.address}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex flex-col">
                                <span>
                                  {new Date(report.date).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {report.time}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                  report.status
                                )}`}
                              >
                                {report.status.charAt(0).toUpperCase() +
                                  report.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  ₹{report.fees}
                                </span>
                                <span className="text-xs uppercase text-gray-500">
                                  {report.paymentMethod}
                                </span>
                                <span
                                  className={`text-xs ${
                                    report.paymentStatus.includes("completed")
                                      ? "text-green-600"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  {report.paymentStatus}
                                </span>
                                {report.isApplied && (
                                  <span className="text-xs text-blue-600 mt-1">
                                    Coupon: {report.couponCode} (
                                    {report.couponDiscount}%)
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-10 text-center text-gray-500"
                          >
                            No appointments found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  if (appliedFilters) {
                    fetchReports();
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;
