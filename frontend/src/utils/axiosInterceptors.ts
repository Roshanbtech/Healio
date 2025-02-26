import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const handleUserLogout = (message?: string) => {
  toast.error(message || "Session expired. Please login again.");
  localStorage.clear();
  window.location.href = "/login";
};

const handleDoctorLogout = (message?: string) => {
  toast.error(message || "Session expired. Please login again.");
  localStorage.clear();
  window.location.href = "/doctor/login";
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("authToken");
    console.log("Auth Token (Before Request):", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("accessToken expired trying to refresh.....");
      originalRequest._retry = true;

      try {
        const { data } = await axiosInstance.post(
          `${import.meta.env.VITE_AXIOS_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        console.log("New Access Token:", data.accessToken);

        const decodedToken = jwtDecode(data.accessToken) as { role: string };

        console.log("Decoded Role:", decodedToken.role);

        localStorage.setItem("authToken", data.accessToken);
        localStorage.setItem("userRole", decodedToken.role);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.reload();
      }
    } else if (
      error.response?.status === 403 &&
      error.response.data.message === "Access denied. User is blocked."
    ) {
      handleUserLogout(error.response.data.message);
    } else if (
      error.response?.status === 403 &&
      error.response.data.message === "Access denied. Doctor is blocked."
    ) {
      handleDoctorLogout();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
