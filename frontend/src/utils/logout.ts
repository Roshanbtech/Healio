import { toast } from "react-toastify";
import axiosInstance from "./axiosInterceptors";

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.get("/logout");
    const { success, message } = await response.data;
    if (success) {
      localStorage.clear();
    } else {
      toast.error(message);
    }
  } catch (error) {
    console.error(error);
  }
};