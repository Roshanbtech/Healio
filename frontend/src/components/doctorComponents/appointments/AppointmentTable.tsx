import React from "react";
import { Appointment } from "../../../types/appointmentTypes";
import { Clock, Info, Check, MessageCircle, Eye, Calendar, FileText } from "lucide-react";
import CustomButton from "../../common/doctorCommon/CustomButton";
import { format } from "date-fns";

interface AppointmentTableProps {
  appointments: Appointment[];
  currentPage: number;
  itemsPerPage: number;
  onConfirmAppointment: (appointmentId: string) => void;
  onCompleteAppointment: (appointmentId: string) => void;
  onReschedule: (appointment: Appointment) => void;
  onOpenModal: (appointment: Appointment, modalType: "appointment" | "prescription" | "previousReport") => void;
  onConsult: (appointment: Appointment) => void;
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  currentPage,
  itemsPerPage,
  onConfirmAppointment,
  onCompleteAppointment,
  onReschedule,
  onOpenModal,
  onConsult,
}) => {
  // Helper functions for formatting and badge classes
  const formatAppointmentDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusBadgeClass = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "cancelled by Dr":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusBadgeClass = (status?: string) => {
    switch (status) {
      case "payment completed":
        return "bg-green-100 text-green-800";
      case "payment pending":
        return "bg-yellow-100 text-yellow-800";
      case "payment failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-red-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              No.
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Patient Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Info
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {appointments.map((appointment, index) => (
            <tr key={appointment._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {appointment.appointmentId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {appointment.patientId.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatAppointmentDate(appointment.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {appointment.time}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(
                    appointment.paymentStatus
                  )}`}
                >
                  {appointment.paymentStatus || "N/A"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <CustomButton
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border border-blue-600 hover:bg-blue-50"
                  onClick={() => onOpenModal(appointment, "appointment")}
                >
                  <Info className="w-4 h-4" />
                </CustomButton>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-2">
                  {appointment.status === "pending" && (
                    <>
                      <CustomButton
                        variant="outline"
                        size="sm"
                        className="text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                        onClick={() => onOpenModal(appointment, "previousReport")}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Prev Report
                      </CustomButton>
                      <CustomButton
                        variant="outline"
                        size="sm"
                        className="text-green-600 border border-green-600 hover:bg-green-50"
                        onClick={() => onConfirmAppointment(appointment._id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </CustomButton>
                    </>
                  )}
                  {appointment.status === "accepted" && (
                    <>
                      <CustomButton
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border border-blue-600 hover:bg-blue-50"
                        onClick={() => onConsult(appointment)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Consult
                      </CustomButton>
                      <CustomButton
                        variant="solid"
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => onCompleteAppointment(appointment._id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Complete
                      </CustomButton>
                      <CustomButton
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 border border-yellow-600 hover:bg-yellow-50"
                        onClick={() => onReschedule(appointment)}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Reschedule
                      </CustomButton>
                    </>
                  )}
                  {appointment.status === "completed" && !appointment.prescription && (
                    <CustomButton
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border border-purple-600 hover:bg-purple-50"
                      onClick={() => onOpenModal(appointment, "appointment")}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Add Prescription
                    </CustomButton>
                  )}
                  {appointment.status === "completed" && appointment.prescription && (
                    <CustomButton
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border border-blue-600 hover:bg-blue-50"
                      onClick={() => onOpenModal(appointment, "prescription")}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Prescription
                    </CustomButton>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
