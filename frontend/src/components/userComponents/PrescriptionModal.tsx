import React, { useRef } from "react";
import { X, Download, Printer, FileText } from "lucide-react";
import { assets } from "../../assets/assets";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  _id?: { $oid?: string } | string;
}

interface PrescriptionData {
  _id?: { $oid?: string } | string;
  appointmentId?: string;
  patientId?: { $oid?: string } | string;
  doctorId?: { $oid?: string } | string;
  diagnosis: string;
  medicines: Medicine[];
  labTests?: string[];
  advice?: string;
  followUpDate?: { $date?: string } | string;
  doctorNotes?: string;
  signature?: string;
  createdAt?: { $date?: string } | string;
  updatedAt?: { $date?: string } | string;
  doctor: {
    name: string;
    speciality: string;
    phone?: string;
    email?: string;
  };
  patient: {
    name: string;
    age: number;
    gender: string;
    phone?: string;
    email?: string;
    address?: string;
    dateOfBirth?: string;
  };
}

interface PrescriptionProps {
  prescription: PrescriptionData;
  onClose: () => void;
}

const PrescriptionComponent: React.FC<PrescriptionProps> = ({
  prescription,
  onClose,
}) => {
  const prescriptionRef = useRef<HTMLDivElement>(null);

  // Generate a consistent prescription ID from MongoDB ObjectId or string
  const generatePrescriptionId = (id?: { $oid?: string } | string): string => {
    if (!id) return "UNKNOWN";
    // If id is a string, use it directly.
    if (typeof id === "string") {
      return id.substring(0, 6).toUpperCase();
    }
    if (id.$oid) {
      return id.$oid.substring(0, 6).toUpperCase();
    }
    return "UNKNOWN";
  };

  // Format date from ISO string in MongoDB format or a string directly
  const formatDate = (dateObj?: { $date?: string } | string): string => {
    if (!dateObj) return "N/A";
    const dateString = typeof dateObj === "string" ? dateObj : dateObj.$date;
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const downloadPDF = async () => {
    const element = prescriptionRef.current;
    if (!element) return;
  
    try {
      // Create a clone of the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      document.body.appendChild(clone);
      
      // Set the clone's styles for capturing
      clone.style.position = "absolute";
      clone.style.width = "210mm"; // A4 width
      clone.style.backgroundColor = "white";
      clone.style.zIndex = "-9999";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.display = "block";
      
      // Make everything black and white to avoid color issues
      const allElements = clone.querySelectorAll("*");
      allElements.forEach(el => {
        const elementStyle = el as HTMLElement;
        
        // Set all text to black
        elementStyle.style.color = "#000000";
        
        // Set all backgrounds to white
        elementStyle.style.backgroundColor = "#ffffff";
        
        // Remove all shadows, gradients, and advanced styles
        elementStyle.style.boxShadow = "none";
        elementStyle.style.textShadow = "none";
        elementStyle.style.background = "none";
        elementStyle.style.backgroundImage = "none";
        
        // Keep only black borders if they exist
        if (window.getComputedStyle(el).borderWidth !== "0px") {
          elementStyle.style.borderColor = "#000000";
        } else {
          elementStyle.style.border = "none";
        }
        
        // Set full opacity
        elementStyle.style.opacity = "1";
      });
      
      // Handle SVG elements - make them basic black and white
      const svgElements = clone.querySelectorAll("svg");
      svgElements.forEach(svg => {
        const svgPaths = svg.querySelectorAll("path, rect, circle, ellipse, line, polyline, polygon");
        svgPaths.forEach(path => {
          path.setAttribute("fill", "#ffffff");
          path.setAttribute("stroke", "#000000");
          path.setAttribute("stroke-width", "1");
        });
      });
      
      // Preserve important colored elements with specific styles if needed
      // For example, to preserve important colored headers or warning text:
      const importantElements = clone.querySelectorAll(".important-header, .warning-text");
      importantElements.forEach(el => {
        // Example: Keep red for warnings
        if ((el as HTMLElement).classList.contains("warning-text")) {
          (el as HTMLElement).style.color = "#ff0000";
        }
        // Example: Keep blue for headers
        if ((el as HTMLElement).classList.contains("important-header")) {
          (el as HTMLElement).style.color = "#0000ff";
        }
      });
      
      // Wait for rendering
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // html2canvas options
      const options = {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: false,
      };
      
      // Capture with html2canvas
      const canvas = await html2canvas(clone, options);
      document.body.removeChild(clone);
      
      // Use a higher quality setting for the JPEG
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      // Create PDF with jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      
      // Handle multi-page PDFs if needed
      if (imgHeight > pdfHeight) {
        let heightLeft = imgHeight;
        let position = 0;
        
        heightLeft -= pdfHeight;
        position = -pdfHeight;
        
        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
          position -= pdfHeight;
        }
      }
      
      const prescriptionId = generatePrescriptionId(prescription._id);
      pdf.save(`Healio_Prescription_${prescriptionId}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again or use the print option.");
    }
  };

  const handlePrint = () => {
    const content = prescriptionRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print the prescription.");
      return;
    }

    const printDocument = printWindow.document;
    printDocument.write("<html><head><title>Healio Prescription</title>");
    printDocument.write("<style>");
    printDocument.write(`
      body { 
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #fee2e2;
      }
      tr:nth-child(even) {
        background-color: #f0fdf4;
      }
      .header {
        display: flex;
        justify-content: space-between;
        border-bottom: 2px solid #dc2626;
        padding-bottom: 15px;
        margin-bottom: 20px;
      }
      .section-title {
        color: #dc2626;
        font-weight: bold;
        border-bottom: 1px solid #dc2626;
        padding-bottom: 5px;
        margin-top: 20px;
      }
    `);
    printDocument.write("</style></head><body>");
    printDocument.write(content.innerHTML);
    printDocument.write("</body></html>");
    printDocument.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Use createdAt if available, otherwise fallback to today's date
  const prescriptionDate = prescription.createdAt
    ? formatDate(prescription.createdAt)
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const prescriptionId = generatePrescriptionId(prescription._id);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Actions Bar */}
        <div className="flex justify-between items-center bg-red-600 p-3 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-full">
              <img
                src={assets.logo}
                alt="Healio Logo"
                className="w-10 h-10 rounded-full"
                crossOrigin="anonymous"
              />
            </div>
            <h2 className="text-white text-2xl font-bold">Healio Prescription</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadPDF}
              className="text-white hover:bg-red-700 p-2 rounded-full transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="text-white hover:bg-red-700 p-2 rounded-full transition-colors"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-red-700 p-2 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Content */}
        <div ref={prescriptionRef} className="p-6 space-y-4 bg-white">
          {/* Header and Prescription Info */}
          <div className="border-b-2 border-red-600 pb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-600 p-1 rounded-full">
                  <img
                    src={assets.logo}
                    alt="Healio Logo"
                    className="w-10 h-10 rounded-full"
                    crossOrigin="anonymous"
                  />
                </div>
                <h2 className="text-red-600 text-2xl font-bold">
                  Healio Prescription
                </h2>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex space-x-2">
                  <span className="font-medium">Prescription ID:</span>
                  <span>{prescriptionId}</span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-medium">Date:</span>
                  <span>{prescriptionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient and Doctor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600 border-b border-red-600 pb-1">
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">Name</p>
                  <p>{prescription.patient.name}</p>
                </div>
                <div>
                  <p className="font-medium">Age</p>
                  <p>{prescription.patient.age}</p>
                </div>
                <div>
                  <p className="font-medium">Gender</p>
                  <p>{prescription.patient.gender}</p>
                </div>
                {prescription.patient.phone && (
                  <div>
                    <p className="font-medium">Phone</p>
                    <p>{prescription.patient.phone}</p>
                  </div>
                )}
                {prescription.patient.email && (
                  <div>
                    <p className="font-medium">Email</p>
                    <p>{prescription.patient.email}</p>
                  </div>
                )}
                {prescription.patient.dateOfBirth && (
                  <div>
                    <p className="font-medium">Date of Birth</p>
                    <p>{prescription.patient.dateOfBirth}</p>
                  </div>
                )}
              </div>

              {prescription.patient.address && (
                <div>
                  <p className="font-medium">Address</p>
                  <p>{prescription.patient.address}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600 border-b border-red-600 pb-1">
                Doctor Information
              </h3>
              <div>
                <p className="font-medium">Name</p>
                <p>{prescription.doctor.name}</p>
              </div>
              <div>
                <p className="font-medium">Specialty</p>
                <p>{prescription.doctor.speciality}</p>
              </div>
              {prescription.doctor.phone && (
                <div>
                  <p className="font-medium">Phone</p>
                  <p>{prescription.doctor.phone}</p>
                </div>
              )}
              {prescription.doctor.email && (
                <div>
                  <p className="font-medium">Email</p>
                  <p>{prescription.doctor.email}</p>
                </div>
              )}
              {prescription.diagnosis && (
                <div>
                  <p className="font-medium">Diagnosis</p>
                  <p className="font-semibold text-red-600">
                    {prescription.diagnosis}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Medicines */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-600 border-b border-red-600 pb-1">
              Prescribed Medications
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-red-100">
                    <th className="px-4 py-2 border text-left">Medication</th>
                    <th className="px-4 py-2 border text-left">Dosage</th>
                    <th className="px-4 py-2 border text-left">Frequency</th>
                    <th className="px-4 py-2 border text-left">Duration</th>
                    <th className="px-4 py-2 border text-left">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medicines.map((med, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-green-50" : "bg-white"}
                    >
                      <td className="px-4 py-2 border">{med.name}</td>
                      <td className="px-4 py-2 border">{med.dosage}</td>
                      <td className="px-4 py-2 border">{med.frequency}</td>
                      <td className="px-4 py-2 border">
                        {med.duration || "-"}
                      </td>
                      <td className="px-4 py-2 border">
                        {med.instructions || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lab Tests */}
          {prescription.labTests && prescription.labTests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600 border-b border-red-600 pb-1">
                Lab Tests
              </h3>
              <ul className="list-disc ml-5 text-gray-700 pl-4">
                {prescription.labTests.map((test, index) => (
                  <li key={index} className="mb-1">
                    {test}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advice */}
          {prescription.advice && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600 border-b border-red-600 pb-1">
                General Advice
              </h3>
              <p className="text-gray-700 bg-green-50 p-3 rounded">
                {prescription.advice}
              </p>
            </div>
          )}

          {/* Follow Up */}
          {prescription.followUpDate && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600 border-b border-red-600 pb-1">
                Follow-Up Date
              </h3>
              <p className="text-gray-700 font-semibold">
                {formatDate(prescription.followUpDate)}
              </p>
            </div>
          )}

          {/* Doctor's Notes */}
          {prescription.doctorNotes && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600 border-b border-red-600 pb-1">
                Doctor's Notes
              </h3>
              <p className="text-gray-700 italic bg-green-50 p-3 rounded">
                {prescription.doctorNotes}
              </p>
            </div>
          )}

          {/* Signature */}
          <div className="mt-8 flex justify-between items-end">
            <div className="text-sm text-gray-500">
              <p>This prescription is electronically generated.</p>
              <p>If you have any questions, please contact your doctor.</p>
            </div>
            <div className="text-right">
              {prescription.signature ? (
                <div className="flex flex-col items-end">
                  <img
                    src={prescription.signature}
                    alt="Doctor's Signature"
                    className="w-40 h-20 object-contain mb-1"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.style.display = "none";
                    }}
                  />
                  <div className="border-t border-black w-40 text-center pt-1">
                    <p className="font-semibold">{prescription.doctor.name}</p>
                    <p className="text-sm">{prescription.doctor.speciality}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <div className="h-16 w-40 border-b border-black mb-1"></div>
                  <div className="w-40 text-center">
                    <p className="font-semibold">{prescription.doctor.name}</p>
                    <p className="text-sm">{prescription.doctor.speciality}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t flex justify-between items-center bg-gray-50">
          <p className="text-sm text-gray-500">© 2025 Healio Medical Services</p>
          <div className="flex space-x-2">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionComponent;