import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }: { role: string }) => {
  const userRole = localStorage.getItem("userRole");

  if (userRole !== role) {
    return <Navigate to="/doctor/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
