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

let isRefreshing = false;
interface QueueItem {
  resolve: (value?: string | null) => void;
  reject: (error?: any) => void;
}

let failedQueue: QueueItem[] = [];

interface ProcessQueueArgs {
  error: Error | null;
  token: string | null;
}

const processQueue = (
  error: ProcessQueueArgs["error"],
  token: ProcessQueueArgs["token"] = null
): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("accessToken expired trying to refresh.....");
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;

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
        processQueue(null, data.accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError:any) {
        processQueue(refreshError, null);
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.reload();
        return Promise.reject(refreshError);
      }finally {
        isRefreshing = false;
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
      handleDoctorLogout(error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
