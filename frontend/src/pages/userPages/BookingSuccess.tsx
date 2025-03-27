import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SuccessPage from "../../components/userComponents/BookingSuccess";

const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    navigate("/home");
    return null;
  }

  const {
    transactionId,
    amount,
    date,
    patientName,
    email,
    address,
    doctorName,
    appointmentTime,
    healioLogo,
  } = location.state as {
    transactionId: string;
    amount: string;
    date: string;
    patientName: string;
    email: string;
    address: string;
    doctorName?: string;
    appointmentTime?: string;
    healioLogo?: string;
  };

  const handleBackToHome = () => {
    navigate("/appointments");
  };

  return (
    <SuccessPage
      transactionId={transactionId}
      amount={amount}
      date={date}
      patientName={patientName}
      email={email}
      address={address}
      doctorName={doctorName}
      appointmentTime={appointmentTime}
      onBackToHome={handleBackToHome}
      healioLogo={healioLogo}
    />
  );
};

export default BookingSuccess;
