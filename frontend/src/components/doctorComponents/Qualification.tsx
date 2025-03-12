import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../utils/axiosInterceptors";
import { toast } from "react-toastify";
import { Sidebar } from "../common/doctorCommon/Sidebar";

interface FormField {
  label: string;
  name: string;
  placeholder: string;
}

interface Service {
  _id: string;
  name: string;
  isActive: boolean;
}

interface QualificationDetails {
  degree: string;
  experience: string;
  country: string;
  speciality: string;
  hospital: string;
  achievements: string;
}

interface FormValues {
  degree: string;
  experience: string;
  country: string;
  speciality: string;
  hospital: string;
  achievements: string;
}

interface QualificationDetails extends FormValues {
  files: string[];
}

export const QualificationForm: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedData, setSubmittedData] =
    useState<QualificationDetails | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const leftFields: FormField[] = [
    { label: "Degree", name: "degree", placeholder: "Enter degree" },
    {
      label: "Experience",
      name: "experience",
      placeholder: "Years of experience",
    },
    { label: "Country", name: "country", placeholder: "Enter country" },
  ];

  const rightFields: FormField[] = [
    {
      label: "Speciality",
      name: "speciality",
      placeholder: "Select speciality",
    },
    { label: "Hospital", name: "hospital", placeholder: "Enter hospital name" },
    {
      label: "Achievements",
      name: "achievements",
      placeholder: "Enter achievements (optional)",
    },
  ];

  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get("/doctor/services");
      if (response.data?.data?.services) {
        setServices(response.data.data.services);
      }
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    }
  };

  const fetchExistingQualifications = async () => {
    try {
      const doctorId = sessionStorage.getItem("doctorId");
      if (!doctorId) {
        throw new Error("Doctor ID not found in session storage.");
      }
      const response = await axiosInstance.get(`/doctor/qualifications/${doctorId}`);
      if (response.data.status && response.data.data.qualifications) {
        setSubmittedData(response.data.data.qualifications);
      }
    } catch (error: any) {
      console.error("Error fetching qualifications:", error.message);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchExistingQualifications();
  }, []);

  const validationSchema = Yup.object({
    degree: Yup.string().required("Degree is required"),
    experience: Yup.number()
      .typeError("Experience must be a number")
      .required("Experience is required"),
    country: Yup.string().required("Country is required"),
    speciality: Yup.string().required("Speciality is required"),
    hospital: Yup.string().required("Hospital name is required"),
    achievements: Yup.string(),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      degree: "",
      experience: "",
      country: "",
      speciality: "",
      hospital: "",
      achievements: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!selectedFile) {
        toast.error("Please upload a document.");
        return;
      }
      setIsLoading(true);
      const doctorId = sessionStorage.getItem("doctorId");
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        formData.append(key, values[key as keyof FormValues]);
      });

      selectedFile.forEach((file) => formData.append("certificate", file));
      formData.append("doctorId", doctorId || "");

      try {
        const response = await axiosInstance.post(
          "/doctor/qualifications",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (response.data.status) {
          toast.success("Qualifications submitted successfully!");
          setSubmittedData({
            ...values,
            files: selectedFile.map((file) => file.name),
          });
        }
      } catch (error: any) {
        console.error("Form submission error:", error);
        toast.error("Failed to submit qualifications");
      }
      setIsLoading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      setSelectedFile(files);
    }
  };

  const mainContentMargin = isSidebarCollapsed ? "4rem" : "16rem";

  return (
    <>
      {/* Sidebar component */}
      <Sidebar onCollapse={setSidebarCollapsed} />

      {/* Main content wrapper */}
      <div
        style={{ marginLeft: mainContentMargin }}
        className="min-h-screen p-6 transition-all duration-300"
      >
        {submittedData ? (
          // Success view when qualification details have been submitted
          <div className="bg-green-100 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-700">
                Qualification Details Submitted
              </h3>
            </div>

            <div className="bg-white rounded-lg p-6 mt-4">
              <h4 className="text-lg font-medium text-gray-800 mb-4">
                Your Information
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Degree:</span>{" "}
                    {submittedData.degree}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Experience:</span>{" "}
                    {submittedData.experience} years
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Country:</span>{" "}
                    {submittedData.country}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Speciality:</span>{" "}
                    {submittedData.speciality?.name}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Hospital:</span>{" "}
                    {submittedData.hospital}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Achievements:</span>{" "}
                    {submittedData.achievements || "None"}
                  </p>
                </div>
              </div>

              {submittedData.files && submittedData.files.length > 0 && (
                <div className="mt-6">
                  <h5 className="text-md font-medium text-gray-800 mb-2">
                    Uploaded Documents
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {submittedData.files.map((file, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        Document {index + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Form view when no qualification details have been submitted
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Form Section */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-6">
                Current Practicing Details
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {/* Left Fields */}
                <div className="space-y-4">
                  {leftFields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm text-gray-600 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formik.values[field.name as keyof FormValues]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full p-2 rounded-lg bg-[#e8f8e8] border-2 ${
                          formik.touched[field.name as keyof FormValues] &&
                          formik.errors[field.name as keyof FormValues]
                            ? "border-red-500"
                            : formik.touched[field.name as keyof FormValues] &&
                              !formik.errors[field.name as keyof FormValues]
                            ? "border-green-400"
                            : "border-transparent"
                        }`}
                      />
                      {formik.touched[field.name as keyof FormValues] &&
                        formik.errors[field.name as keyof FormValues] && (
                          <p className="text-sm text-red-600">
                            {formik.errors[field.name as keyof FormValues]}
                          </p>
                        )}
                    </div>
                  ))}
                </div>

                {/* Right Fields */}
                <div className="space-y-4">
                  {rightFields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm text-gray-600 mb-1">
                        {field.label}
                      </label>
                      {field.name === "speciality" ? (
                        <select
                          name={field.name}
                          value={formik.values.speciality}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full p-2 rounded-lg bg-[#e8f8e8] border-2 ${
                            formik.touched[field.name as keyof FormValues] &&
                            formik.errors[field.name as keyof FormValues]
                              ? "border-red-500"
                              : formik.touched[
                                  field.name as keyof FormValues
                                ] &&
                                !formik.errors[field.name as keyof FormValues]
                              ? "border-green-400"
                              : "border-transparent"
                          } cursor-pointer`}
                        >
                          <option value="" disabled>
                            {field.placeholder}
                          </option>
                          {services.map((service) => (
                            <option key={service._id} value={service._id}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name={field.name}
                          placeholder={field.placeholder}
                          value={formik.values[field.name as keyof FormValues]}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full p-2 rounded-lg bg-[#e8f8e8] border-2 ${
                            formik.touched[field.name as keyof FormValues] &&
                            formik.errors[field.name as keyof FormValues]
                              ? "border-red-500"
                              : formik.touched[
                                  field.name as keyof FormValues
                                ] &&
                                !formik.errors[field.name as keyof FormValues]
                              ? "border-green-400"
                              : "border-transparent"
                          }`}
                        />
                      )}
                      {formik.touched[field.name as keyof FormValues] &&
                        formik.errors[field.name as keyof FormValues] && (
                          <p className="text-sm text-red-600">
                            {formik.errors[field.name as keyof FormValues]}
                          </p>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className={`px-8 py-2 text-white rounded-lg ${
                    isLoading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Save"}
                </button>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-6">
                Upload your documents
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-[#e8f8e8]">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Select your file or drag and drop
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                  />
                  <label
                    htmlFor="fileInput"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                  >
                    Browse
                  </label>
                  {selectedFile && selectedFile.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedFile.length} file
                      {selectedFile.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
};
