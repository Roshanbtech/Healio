import React, { useState, useRef } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import axiosInstance from "../../../utils/axiosInterceptors";
import { toast } from "react-toastify";
import SignatureCanvas from "react-signature-canvas";
import * as yup from "yup";

interface CustomButtonProps {
  children: React.ReactNode;
  variant?: "solid" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = "solid",
  size = "md",
  className = "",
  onClick,
  disabled = false,
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none";
  const variantClasses = {
    solid: "bg-red-600 text-white hover:bg-red-700",
    outline: "bg-white border hover:bg-gray-50",
  };
  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Appointment {
  _id: string;
  appointmentId: string;
  patientId: { _id: string; name: string; email: string; phone: string };
  doctorId: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  fees?: number;
  paymentStatus?: string;
  prescription?: string | null;
}

interface PrescriptionFormProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

const prescriptionSchema = yup.object({
  diagnosis: yup.string().trim().required("Diagnosis is required"),
  medicines: yup
    .array()
    .of(
      yup.object({
        name: yup.string().trim().required("Medicine name is required"),
        dosage: yup.string().trim().required("Dosage is required"),
        frequency: yup.string().trim().required("Frequency is required"),
        duration: yup.string().trim().required("Duration is required"),
        instructions: yup.string().trim(),
      })
    )
    .min(1, "At least one medicine is required"),
  labTests: yup.array().of(yup.string().trim()),
  advice: yup.string().trim(),
  followUpDate: yup
    .date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  doctorNotes: yup.string().trim(),
});

const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ appointment, onClose, onSuccess }) => {
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [labTests, setLabTests] = useState<string[]>([""]);
  const [advice, setAdvice] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [doctorNotes, setDoctorNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [signature, setSignature] = useState<string>("");

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const removeMedicine = (index: number) => {
    const updatedMedicines = [...medicines];
    updatedMedicines.splice(index, 1);
    setMedicines(updatedMedicines);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const addLabTest = () => {
    setLabTests([...labTests, ""]);
  };

  const removeLabTest = (index: number) => {
    const updatedLabTests = [...labTests];
    updatedLabTests.splice(index, 1);
    setLabTests(updatedLabTests);
  };

  const updateLabTest = (index: number, value: string) => {
    const updatedLabTests = [...labTests];
    updatedLabTests[index] = value;
    setLabTests(updatedLabTests);
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setSignature("");
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL("image/png");
      setSignature(dataURL);
    }
  };

  const handleSubmit = () => {
    if (!diagnosis.trim()) {
      toast.error("Diagnosis is required");
      return;
    }
    const isValidMedicines = medicines.every(
      (medicine) =>
        medicine.name.trim() &&
        medicine.dosage.trim() &&
        medicine.frequency.trim() &&
        medicine.duration.trim()
    );
    if (!isValidMedicines) {
      toast.error("Please fill in all required medicine fields");
      return;
    }
    if (sigCanvas.current && !signature) {
      saveSignature();
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;
      const prescriptionData = {
        diagnosis,
        medicines: medicines.filter((med) => med.name.trim() !== ""),
        labTests: labTests.filter((test) => test.trim() !== ""),
        advice,
        followUpDate: parsedFollowUpDate,
        doctorNotes,
      };
      await prescriptionSchema.validate(prescriptionData, { abortEarly: false });
      let signatureFile: File | null = null;
      if (signature) {
        signatureFile = dataURLtoFile(signature, "signature.png");
      }
      const formData = new FormData();
      formData.append("patientId", appointment.patientId._id);
      formData.append("doctorId", appointment.doctorId._id);
      formData.append("diagnosis", diagnosis);
      formData.append("medicines", JSON.stringify(medicines.filter((med) => med.name.trim() !== "")));
      formData.append("labTests", JSON.stringify(labTests.filter((test) => test.trim() !== "")));
      formData.append("advice", advice);
      if (parsedFollowUpDate) {
        formData.append("followUpDate", parsedFollowUpDate.toISOString());
      }
      formData.append("doctorNotes", doctorNotes);
      if (signatureFile) {
        formData.append("signatureFile", signatureFile);
      }
      const response = await axiosInstance.post(
        `/doctor/appointments/${appointment._id}/prescription`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.data.status) {
        toast.success("Prescription created successfully");
        setShowConfirmModal(false);
        onSuccess();
      } else {
        toast.error("Failed to create prescription: " + (response.data.message || "Unknown error"));
      }
    } catch (error: any) {
      if (error.name === "ValidationError") {
        error.errors.forEach((err: string) => toast.error(err));
      } else {
        console.error("Error creating prescription:", error);
        toast.error(error.response?.data?.message || "Error creating prescription");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-red-600 p-4 sticky top-0 z-10">
          <h2 className="text-white text-2xl font-bold">Create Prescription</h2>
          <p className="text-white text-sm mt-1"></p>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Diagnosis <span className="text-red-600">*</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-3"
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis..."
              required
            ></textarea>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-semibold">
                Medicines <span className="text-red-600">*</span>
              </label>
              <CustomButton
                variant="outline"
                size="sm"
                className="text-green-600 border border-green-600"
                onClick={addMedicine}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Medicine
              </CustomButton>
            </div>
            {medicines.map((medicine, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">Medicine #{index + 1}</h4>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-2"
                      value={medicine.name}
                      onChange={(e) => updateMedicine(index, "name", e.target.value)}
                      placeholder="Medicine name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-2"
                      value={medicine.dosage}
                      onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                      placeholder="e.g., 500mg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-2"
                      value={medicine.frequency}
                      onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                      placeholder="e.g., Twice daily"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-2"
                      value={medicine.duration}
                      onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                      placeholder="e.g., 7 days"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-2"
                      value={medicine.instructions}
                      onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                      placeholder="e.g., Take after meals"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-semibold">Lab Tests (Optional)</label>
              <CustomButton
                variant="outline"
                size="sm"
                className="text-blue-600 border border-blue-600"
                onClick={addLabTest}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Test
              </CustomButton>
            </div>
            {labTests.map((test, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  className="flex-grow border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-2"
                  value={test}
                  onChange={(e) => updateLabTest(index, e.target.value)}
                  placeholder="Enter lab test..."
                />
                {labTests.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLabTest(index)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              General Advice (Optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-3"
              rows={2}
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Enter general advice for the patient..."
            ></textarea>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Follow-up Date (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-2"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Doctor's Notes (Optional, not visible to patient)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-3"
              rows={2}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Enter private notes about this prescription..."
            ></textarea>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Digital Signature
            </label>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ className: "w-full h-40 bg-white" }}
              />
            </div>
            <div className="mt-2 flex space-x-2">
              <CustomButton
                variant="outline"
                size="sm"
                className="text-red-600 border border-red-600"
                onClick={clearSignature}
              >
                Clear
              </CustomButton>
              <CustomButton
                variant="outline"
                size="sm"
                className="text-blue-600 border border-blue-600"
                onClick={saveSignature}
              >
                Save Signature
              </CustomButton>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white z-10">
          <CustomButton variant="outline" size="md" className="mr-2 text-gray-700 border-gray-300" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton variant="solid" size="md" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Create Prescription"}
          </CustomButton>
        </div>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowConfirmModal(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl z-50 w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Submission</h3>
            <p className="text-gray-600 mb-6">
              You won't be able to edit this prescription after submission. Are you sure you want to continue?
            </p>
            <div className="flex justify-end space-x-3">
              <CustomButton variant="outline" size="md" className="text-gray-700 border-gray-300" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </CustomButton>
              <CustomButton variant="solid" size="md" onClick={confirmSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Confirm"}
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;
