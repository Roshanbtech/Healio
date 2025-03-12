// components/appointments/AppointmentDetailsModal.tsx
import React from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Appointment } from "../../types/appointmentTypes";
import CustomButton from "../common/doctorCommon/CustomButton";

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  modalViewType: "appointment" | "prescription" | "previousReport";
  onClose: () => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  modalViewType,
  onClose,
}) => {
  // Format the appointment date
  const formatAppointmentDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-xl shadow-2xl z-50 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 p-4">
          <h2 className="text-white text-2xl font-bold">
            {modalViewType === "prescription"
              ? "Prescription Details"
              : modalViewType === "previousReport"
              ? "Previous Medical Records"
              : "Appointment Details"}
          </h2>
        </div>
        {/* Content */}
        <div className="p-6 text-green-800">
          {modalViewType === "prescription" ? (
            <>
              <div className="mb-3">
                <p className="text-sm font-semibold">Patient:</p>
                <p className="text-base">
                  {appointment.patientId.name}
                </p>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Date:</p>
                  <p className="text-base">
                    {formatAppointmentDate(appointment.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Time:</p>
                  <p className="text-base">
                    {appointment.time}
                  </p>
                </div>
              </div>
              <hr className="my-4 border-green-200" />
              <div>
                <p className="text-sm font-semibold">Prescription:</p>
                <p className="text-base">
                  {appointment.prescription}
                </p>
              </div>
            </>
          ) : modalViewType === "previousReport" ? (
            <>
              <div className="mb-3">
                <p className="text-sm font-semibold">Patient:</p>
                <p className="text-base">
                  {appointment.patientId.name}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-lg font-semibold">
                  Previous Medical Records:
                </p>
              </div>
              {appointment.medicalRecords &&
              appointment.medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  {appointment.medicalRecords.map(
                    (record, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg border-green-300 bg-green-50"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Record Date:
                            </p>
                            <p className="text-base">
                              {record.recordDate
                                ? format(
                                    new Date(record.recordDate),
                                    "dd/MM/yyyy"
                                  )
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              Condition:
                            </p>
                            <p className="text-base">
                              {record.condition || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              Symptoms:
                            </p>
                            <p className="text-base">
                              {record.symptoms &&
                              record.symptoms.length > 0
                                ? record.symptoms.join(", ")
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              Medications:
                            </p>
                            <p className="text-base">
                              {record.medications &&
                              record.medications.length > 0
                                ? record.medications.join(", ")
                                : "N/A"}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-semibold">
                              Notes:
                            </p>
                            <p className="text-base">
                              {record.notes || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-2 text-base text-gray-600">
                  No previous records available.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold">ID:</p>
                  <p className="text-base">
                    {appointment.appointmentId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Patient:</p>
                  <p className="text-base">
                    {appointment.patientId.name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold">Contact:</p>
                  <p className="text-base">
                    {appointment.patientId.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Email:</p>
                  <p className="text-base">
                    {appointment.patientId.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold">Date:</p>
                  <p className="text-base">
                    {formatAppointmentDate(appointment.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Time:</p>
                  <p className="text-base">
                    {appointment.time}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold">Status:</p>
                  <p className="text-base">
                    {appointment.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Payment:</p>
                  <p className="text-base">
                    {appointment.paymentStatus || "N/A"}
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-sm font-semibold">Reason:</p>
                <p className="text-base">
                  {appointment.reason || "Not specified"}
                </p>
              </div>
              {appointment.fees && (
                <div className="mb-3">
                  <p className="text-sm font-semibold">Fees:</p>
                  <p className="text-base">
                    ₹{appointment.fees}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-green-200 flex justify-end">
          <CustomButton
            variant="solid"
            size="sm"
            onClick={onClose}
          >
            Close
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;