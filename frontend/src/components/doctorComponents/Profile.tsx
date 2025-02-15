import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/doctorCommon/Sidebar";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

interface Specialization {
  id: string;
  name: string;
}

interface Service {
  _id: string;
  name: string;
  isActive: boolean;
}

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  speciality: Specialization;
  experience: number;
  bio: string;
  phoneNumber: string;
  country?: string;
  fees?: string;
  profilePicture?: string;
  hospital?: string;
  degree?: string;
  achievements?: string;
  docStatus?: string;
  isBlocked?: boolean;
}

const Profile: React.FC = () => {
  // State for profile displayed on the left side (database state)
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  // State for the edit form
  const [editProfile, setEditProfile] = useState<DoctorProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for image upload in the edit form
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // State to track sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const doctor = sessionStorage.getItem("doctorId");

  // Fetch doctor profile
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axiosInstance.get(`/doctor/profile/${doctor}`);
        const fetchedProfile = response.data.data.profile;
        setProfile(fetchedProfile);
        setEditProfile(fetchedProfile);
        if (fetchedProfile.profilePicture) {
          setPreviewUrl(fetchedProfile.profilePicture);
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    getProfile();
  }, [doctor]);

  // Fetch services list
  useEffect(() => {
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

    fetchServices();
  }, []);

  // Update editProfile state when form fields change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditProfile((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Optionally update editProfile with the new image URL
    setEditProfile((prev) => (prev ? { ...prev, profilePicture: url } : null));
  };

  // Submit handler: update the database then update the display (left side)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfile) return;
    try {
      const response = await axiosInstance.put(
        `/doctor/profile/${doctor}`,
        editProfile
      );
      // If the update is successful, update the left side profile display
      setProfile(editProfile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      setError("Error updating profile");
      toast.error("Error updating profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Container with dynamic width */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <Sidebar onCollapse={(collapsed) => setSidebarCollapsed(collapsed)} />
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-6 transition-all duration-300">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">Doctor Profile</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Updated Profile Information Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <h2 className="text-2xl font-semibold text-white text-center">
                Profile Information
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-6">
                {/* Image with active/inactive indicator */}
                <div className="relative">
                  <img
                    src={profile?.profilePicture || assets.doc11}
                    alt={profile?.name || "Doctor"}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-300"
                  />
                  <div
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                      profile && profile.isBlocked
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                </div>
                <div>
                  <h3 className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-green-700">
                      {profile?.name}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        profile?.docStatus === "approved"
                          ? "bg-green-100 text-green-800"
                          : profile?.docStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {profile?.docStatus || "N/A"}
                    </span>
                  </h3>
                  <p className="text-base text-gray-600">{profile?.email}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-y-3 text-base">
                <p>
                  <span className="font-semibold text-green-700">Phone:</span>{" "}
                  {profile?.phoneNumber || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-green-700">
                    Speciality:
                  </span>{" "}
                  {profile?.speciality?.name || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-green-700">
                    Experience:
                  </span>{" "}
                  {profile?.experience || "N/A"} years
                </p>
                <p>
                  <span className="font-semibold text-green-700">
                    Hospital:
                  </span>{" "}
                  {profile?.hospital || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-green-700">Degree:</span>{" "}
                  {profile?.degree || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-green-700">Country:</span>{" "}
                  {profile?.country || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-green-700">
                    Achievements:
                  </span>{" "}
                  {profile?.achievements || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Form Card (Right Side) */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <h2 className="text-2xl font-semibold text-white text-center">
                Edit Profile
              </h2>
            </div>
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Image Upload Field */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-md bg-green-100 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                    <label
                      htmlFor="profilePictureUpload"
                      className="absolute inset-0 flex items-center justify-center bg-red-600 bg-opacity-0 hover:bg-opacity-50 transition-colors cursor-pointer"
                    >
                      <span className="text-white text-xs">Change</span>
                      <input
                        id="profilePictureUpload"
                        name="profilePictureUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Grid layout for form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Name"
                    name="name"
                    value={editProfile?.name}
                    onChange={handleInputChange}
                    required
                  />
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={editProfile?.email}
                    onChange={handleInputChange}
                    required
                  />
                  {/* Dropdown for Specialization using fetched services */}
                  <div className="space-y-1">
                    <label
                      htmlFor="specialization"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Specialization
                    </label>
                    <select
                      id="specialization"
                      name="specialization"
                      value={editProfile?.speciality.id || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedService = services.find(
                          (service) => service._id === selectedId
                        );
                        if (selectedService) {
                          setEditProfile((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  speciality: {
                                    id: selectedService._id,
                                    name: selectedService.name,
                                  },
                                }
                              : null
                          );
                        }
                      }}
                      required
                      className="w-full bg-green-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FormField
                    label="Experience (years)"
                    name="experience"
                    type="number"
                    value={editProfile?.experience}
                    onChange={handleInputChange}
                    required
                  />
                  <FormField
                    label="Country"
                    name="country"
                    value={editProfile?.country}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Fees"
                    name="fees"
                    value={editProfile?.fees}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Phone Number"
                    name="phoneNumber"
                    value={editProfile?.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Bio field full width */}
                <div className="space-y-1">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={editProfile?.bio || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-green-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const FormField: React.FC<{
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}> = ({ label, name, type = "text", value, onChange, required }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      className="w-full bg-green-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
    />
  </div>
);

export default Profile;
