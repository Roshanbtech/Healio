import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInterceptors";
import { Sidebar } from "../common/userCommon/Sidebar";
import { Camera, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  gender?: "male" | "female" | "other";
  DOB?: string;
  age?: number;
  image?: string;
  isBlocked?: boolean;
}

const Profile: React.FC = () => {
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Tab state: 'editProfile' | 'changePassword'
  const [activeTab, setActiveTab] = useState<"editProfile" | "changePassword">(
    "editProfile"
  );

  // Change Password form state
  const [changePassword, setChangePassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Password visibility toggles for change password form
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Submission state for forms
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const user = localStorage.getItem("userId");

  // Fetch user profile
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axiosInstance.get(`/profile/${user}`);
        const fetchedProfile = response.data.user;
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

    if (user) {
      getProfile();
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditProfile((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              name === "age"
                ? value === ""
                  ? ""
                  : parseInt(value, 10)
                : value,
          }
        : null
    );
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setEditProfile((prev) => (prev ? { ...prev, image: url } : null));
    setProfile((prev) => (prev ? { ...prev, image: url } : null));
  };

  // Submit the Edit Profile form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfile) return;
    setIsSubmittingProfile(true);
    try {
      const formData = new FormData();
      for (const key in editProfile) {
        if (key === "image" || key === "id" || key === "userId" || key === "wallet") continue;
        formData.append(
          key,
          String(editProfile[key as keyof UserProfile] || "")
        );
      }
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      const response = await axiosInstance.patch(
        `/editProfile/${user}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const editedProfile = response.data?.data?.result;
      setEditProfile(editedProfile);
      setProfile(editedProfile);
      toast.success("Profile updated successfully!");
      localStorage.setItem("image", response.data?.data?.result?.image);
    } catch (error) {
      setError("Error updating profile");
      toast.error("Error updating profile");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // Handle Change Password input changes
  const handleChangePasswordInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setChangePassword((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the Change Password form
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (changePassword.newPassword !== changePassword.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsSubmittingPassword(true);
    try {
      await axiosInstance.patch(`/changePassword/${user}`, {
        oldPassword: changePassword.oldPassword,
        newPassword: changePassword.newPassword,
      });

      toast.success("Password changed successfully!");
      setChangePassword({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      toast.error("Error changing password");
    } finally {
      setIsSubmittingPassword(false);
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
          <h1 className="text-3xl font-bold text-green-800">User Profile</h1>
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
              <div className="flex flex-col items-center md:w-1/3 relative">
                <div className="relative">
                  <img
                    src={profile?.image || assets.userDefault1}
                    alt={profile?.name || "User"}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                  />
                  {/* Block status indicator */}
                  <span
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                      profile?.isBlocked ? "bg-red-600" : "bg-green-600"
                    }`}
                  ></span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-green-800">
                  {profile?.name}
                </h3>
                <p className="text-sm text-gray-600">{profile?.email}</p>
              </div>

              {/* Right Column: Address, DOB, Age, Gender and Phone */}
              <div className="mt-6 md:mt-0 md:ml-8 md:w-2/3">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-2">
                    Address
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {profile?.address || "No address provided."}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-2">
                    Date of Birth
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {profile?.DOB
                      ? new Date(profile.DOB).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-2">
                    Age
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {profile?.age || "N/A"}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-2">
                    Gender
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {profile?.gender
                      ? profile.gender.charAt(0).toUpperCase() +
                        profile.gender.slice(1)
                      : "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-y-2 text-base">
                  <p>
                    <span className="font-semibold text-green-800">Phone:</span>{" "}
                    {profile?.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile / Change Password Container */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tab Buttons */}
            <div className="bg-red-600 px-6 py-4 flex justify-center space-x-4">
              <button
                className={`text-xl font-semibold text-white px-4 py-2 ${
                  activeTab === "editProfile"
                    ? "border-b-2 border-white"
                    : "opacity-80"
                }`}
                onClick={() => setActiveTab("editProfile")}
              >
                Edit Profile
              </button>
              <button
                className={`text-xl font-semibold text-white px-4 py-2 ${
                  activeTab === "changePassword"
                    ? "border-b-2 border-white"
                    : "opacity-80"
                }`}
                onClick={() => setActiveTab("changePassword")}
              >
                Change Password
              </button>
            </div>

            <div className="p-6">
              {/* EDIT PROFILE FORM */}
              {activeTab === "editProfile" && (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Image Upload */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-md bg-red-100 flex items-center justify-center overflow-hidden">
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
                      label="Phone"
                      name="phone"
                      value={editProfile?.phone}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Age"
                      name="age"
                      type="number"
                      value={
                        editProfile?.age !== undefined ? editProfile.age : ""
                      }
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Address"
                      name="address"
                      value={editProfile?.address}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Date of Birth"
                      name="DOB"
                      type="date"
                      value={
                        editProfile?.DOB
                          ? new Date(editProfile.DOB)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleInputChange}
                    />
                    {/* Gender Dropdown - spanning both columns */}
                    <div className="col-span-2">
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={editProfile?.gender || ""}
                        onChange={handleInputChange}
                        className="w-full bg-green-100 px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingProfile}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-75"
                  >
                    {isSubmittingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}

              {/* CHANGE PASSWORD FORM */}
              {activeTab === "changePassword" && (
                <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Old Password"
                      name="oldPassword"
                      type="password"
                      value={changePassword.oldPassword}
                      onChange={handleChangePasswordInput}
                      required
                      showPassword={showOldPassword}
                      toggleShowPassword={() =>
                        setShowOldPassword((prev) => !prev)
                      }
                    />
                    <FormField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={changePassword.newPassword}
                      onChange={handleChangePasswordInput}
                      required
                      showPassword={showNewPassword}
                      toggleShowPassword={() =>
                        setShowNewPassword((prev) => !prev)
                      }
                    />
                    <FormField
                      label="Confirm New Password"
                      name="confirmNewPassword"
                      type="password"
                      value={changePassword.confirmNewPassword}
                      onChange={handleChangePasswordInput}
                      required
                      showPassword={showConfirmNewPassword}
                      toggleShowPassword={() =>
                        setShowConfirmNewPassword((prev) => !prev)
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-75"
                  >
                    {isSubmittingPassword ? "Changing..." : "Change Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Reusable FormField component */
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  readOnly?: boolean;
  showPassword?: boolean;
  toggleShowPassword?: () => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  readOnly,
  showPassword,
  toggleShowPassword,
}) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    {type === "password" && toggleShowPassword ? (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          min={type === "number" ? 0 : undefined}
          id={name}
          name={name}
          value={value !== undefined ? value : ""}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          className="w-full bg-green-100 px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          onClick={toggleShowPassword}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5 text-gray-500" />
          ) : (
            <Eye className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
    ) : (
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        id={name}
        name={name}
        value={value !== undefined ? value : ""}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        className="w-full bg-green-100 px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
      />
    )}
  </div>
);

export default Profile;
