import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }: { role: string }) => {
  const userRole = localStorage.getItem("userRole");
  const token = localStorage.getItem("authToken");

  if (!token) return <Navigate to="/login" />;
  if (userRole !== role) return <Navigate to="/" />;

  return <Outlet />;
};

export default ProtectedRoute;
