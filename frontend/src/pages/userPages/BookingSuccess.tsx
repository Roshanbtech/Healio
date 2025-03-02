import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SuccessPage from "../../components/userComponents/BookingSuccess";

const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  } = location.state || {};

  // Fallback if state is missing
  if (!transactionId) {
    navigate("/home");
    return null;
  }

  const handleBackToHome = () => {
    navigate("/home");
  };

  return (
    <div>
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
    </div>
  );
};

export default BookingSuccess;