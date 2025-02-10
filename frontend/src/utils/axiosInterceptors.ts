import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  withCredentials: true, // Needed for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Attach Access Token
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

// Response Interceptor - Handles Expired Tokens (401)
axiosInstance.interceptors.response.use(
  (response) => response, // Pass successful response
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized (token expired) and we haven't tried refreshing already
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Send request to refresh token
        const { data } = await axios.post(
          `${import.meta.env.VITE_AXIOS_BASE_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );

        // Log the newly generated access token and its role
        console.log("Generated Access Token:", data.accessToken);
        
        // Decode the access token to get the role
        const decodedToken = jwtDecode(data.accessToken) as { role: string };
        
        // Log the decoded role
        console.log("Decoded Role:", decodedToken.role);

        // Store new access token and role in localStorage
        localStorage.setItem("authToken", data.accessToken);
        localStorage.setItem("userRole", decodedToken.role);  // Store user role

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");  // Remove role data as well
        window.location.href = "/";  // 
      }
    }

    // In case of other errors, reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;
