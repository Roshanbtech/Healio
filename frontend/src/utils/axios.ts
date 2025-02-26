import axios from "axios";

const axiosUrl = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  withCredentials: true,
});

export default axiosUrl;
