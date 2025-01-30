import { Routes, Route, useLocation } from "react-router-dom";
import SignUp from "../pages/userPages/SignUp";
// import Login from "../pages/userPages/Login"; // Assuming you have a Login page
import Navbar from "../components/common/userCommon/Nav";
import Home from "../pages/userPages/Home";

const UserRoutes = () => {
  const location = useLocation();

  const showNavbar = !["/signup", "/login",'/otp'].includes(location.pathname);

  return (
    <div className="mx-4 sm:mx-[10%]">
      {showNavbar && <Navbar />} 
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
};

export default UserRoutes;
