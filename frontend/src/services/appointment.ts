import axiosInstance from "../utils/axiosInterceptors";

export const createAppointment = async (data: any) => {
    try{
        const response = await axiosInstance.post("/bookings", data);
        localStorage.setItem("bookingId", response.data.appointment?.appointmentId);
        return response.data
    }catch(err: any){
        console.log(err);
    }
}

export const verifyAppointment = async (response: any, data: any) => {
    try{
        const bookingId = localStorage.getItem("bookingId"); 
        const res= await axiosInstance.post("/verifyBooking", {response, data, bookingId});
        localStorage.removeItem("bookingId");
        return res.data
    }catch(err: any){
        console.log(err);
    }
}