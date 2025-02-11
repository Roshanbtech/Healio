import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("authToken");

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
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_AXIOS_BASE_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );

        console.log("Generated Access Token:", data.accessToken);
        
        const decodedToken = jwtDecode(data.accessToken) as { role: string };
        
        console.log("Decoded Role:", decodedToken.role);

        localStorage.setItem("authToken", data.accessToken);
        localStorage.setItem("userRole", decodedToken.role);  

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole"); 
        window.location.href = "/";  
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
