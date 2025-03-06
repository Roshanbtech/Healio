import { Routes, Route } from "react-router-dom";
import AdminLogin from "../pages/adminPages/AdminLogin";
import AdminDashboard from "../pages/adminPages/AdminDashboard";
import ProtectedRoute from "./protectedRoutes/admin";
import UserListing from "../pages/adminPages/UserListing";
import DocotorListing from "../pages/adminPages/DoctorListing";
import Services from "../pages/adminPages/Services";
import Coupons from "../pages/adminPages/Coupon";

const AdminRoutes = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/users" element={<UserListing />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/doctors" element={<DocotorListing />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/services" element={<Services />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/coupons" element={<Coupons />} />
        </Route>
      </Routes>
    </div>
  );
};

export default AdminRoutes;
