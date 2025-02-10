import { Routes, Route } from "react-router-dom";
import AdminLogin from "../pages/adminPages/AdminLogin"; 
import AdminDashboard from "../pages/adminPages/AdminDashboard";
import ProtectedRoute from "./protectedRoutes/admin"; 
import UserListing from "../pages/adminPages/UserListing";
import DocotorListing from "../pages/adminPages/DoctorListing";
import Services from "../pages/adminPages/Services";

const AdminRoutes = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Routes>
        {/* Public Route - Admin Login */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected Routes - Only for authenticated admins */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
        <Route path='/getUsers' element={<UserListing />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
        <Route path='/getDoctors' element={<DocotorListing />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
        <Route path='/services' element={<Services />} />
        </Route>
      </Routes>
    </div>
  );
};

export default AdminRoutes;
