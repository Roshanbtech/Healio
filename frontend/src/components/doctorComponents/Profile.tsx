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
  speciality: Specialization | { _id: string; name: string }; // it might come as an object with _id
  experience: number;
  about: string;
  phone: string;
  country?: string;
  fees?: number;
  image?: string;
  hospital?: string;
  degree?: string;
  achievements?: string;
  docStatus?: string;
  isBlocked?: boolean;
}

const Profile: React.FC = () => {
  // State for the profile (from DB)
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  // State for the edit form
  const [editProfile, setEditProfile] = useState<DoctorProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Sidebar collapse state
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
        if (fetchedProfile.image) {
          setPreviewUrl(fetchedProfile.image);
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

    setEditProfile((prev) => (prev ? { ...prev, image: url } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfile) return;
    
    try {
      const formData = new FormData();
      
      for (const key in editProfile) {
        if (key === "image") continue;
        
        if (key === "speciality") {
          const specialityObj = editProfile.speciality as any;
          const specialityId = specialityObj?._id || specialityObj?.id || "";
          formData.append(key, specialityId);
        } else {
          formData.append(key, String(editProfile[key as keyof DoctorProfile]));
        }
      }
      
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      
      await axiosInstance.patch(
        `/doctor/editProfile/${doctor}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
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
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        <Sidebar onCollapse={(collapsed) => setSidebarCollapsed(collapsed)} />
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-6 transition-all duration-300">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">Doctor Profile</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Display Profile Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
  <div className="bg-red-600 px-6 py-4">
    <h2 className="text-2xl font-semibold text-white text-center">
      Profile Information
    </h2>
  </div>
  <div className="p-6 flex flex-col md:flex-row">
    {/* Left Column: Profile Image and Basic Info */}
    <div className="flex flex-col items-center md:w-1/3">
      <div className="relative">
        {selectedImage ? (
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Selected"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
          />
        ) : (
          <img
            src={profile?.image || assets.doc11}
            alt={profile?.name || "Doctor"}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
          />
        )}
        <div
          className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
            profile && profile.isBlocked ? "bg-red-500" : "bg-green-500"
          }`}
        ></div>
      </div>
      <h3 className="mt-4 text-xl font-bold text-green-700">
        {profile?.name}
      </h3>
      <p className="text-sm text-gray-600">{profile?.email}</p>
    </div>

    {/* Right Column: About Content at Top, then Other Details */}
    <div className="mt-6 md:mt-0 md:ml-8 md:w-2/3">
      {/* About Section */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-green-700 mb-2">
          About
        </h4>
        <p className="text-gray-700 leading-relaxed">
          {profile?.about || "No description provided."}
        </p>
      </div>

      {/* Separation Line */}
      <div className="border-t border-gray-300 my-4"></div>

      {/* Other Details */}
      <div className="grid grid-cols-1 gap-y-2 text-base">
        <p>
          <span className="font-semibold text-green-700">Phone:</span>{" "}
          {profile?.phone || "N/A"}
        </p>
        <p>
          <span className="font-semibold text-green-700">Speciality:</span>{" "}
          {profile?.speciality?.name || "N/A"}
        </p>
        <p>
          <span className="font-semibold text-green-700">Experience:</span>{" "}
          {profile?.experience || "N/A"} years
        </p>
        <p>
          <span className="font-semibold text-green-700">Hospital:</span>{" "}
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
          <span className="font-semibold text-green-700">Achievements:</span>{" "}
          {profile?.achievements || "N/A"}
        </p>
        <p>
          <span className="font-semibold text-green-700">Fees:</span>{" "}
          {profile?.fees || "N/A"}
        </p>
      </div>
    </div>
  </div>
</div>




          {/* Edit Profile Form */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <h2 className="text-2xl font-semibold text-white text-center">Edit Profile</h2>
            </div>
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Image Upload */}
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
                      htmlFor="imageUpload"
                      className="absolute inset-0 flex items-center justify-center bg-red-600 bg-opacity-0 hover:bg-opacity-50 transition-colors cursor-pointer"
                    >
                      <span className="text-white text-xs">Change</span>
                      <input
                        id="imageUpload"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
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
                    value={editProfile?.email}
                    onChange={handleInputChange}
                    required
                    readOnly={true}
                  />
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
                    type="number"
                    value={editProfile?.fees}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Phone"
                    name="phone"
                    value={editProfile?.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* About Field */}
                <div className="space-y-1">
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                    About
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={editProfile?.about}
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

const FormField: React.FC<{
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  readOnly?: boolean;
}> = ({ label, name, type = "text", value, onChange, required, readOnly }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      readOnly={readOnly}
      className="w-full bg-green-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
    />
  </div>
);

export default Profile;
