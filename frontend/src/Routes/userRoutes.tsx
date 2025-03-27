import { Routes, Route, useLocation } from "react-router-dom";
import SignUp from "../pages/userPages/SignUp";
import Login from "../pages/userPages/Login";
import Navbar from "../components/common/userCommon/Nav";
import ProtectedRoute from "./protectedRoutes/user";

import Home from "../pages/userPages/Home";
import Footer from "../components/common/userCommon/Footer";
import ForgotPassword from "../pages/userPages/ForgotPassword";
import ResetPassword from "../pages/userPages/ResetPassword";
import Doctors from "../pages/userPages/Doctors";
import Profile from "../pages/userPages/Profile";
import DoctorDetails from "../pages/userPages/DoctorDetails";
import DoctorSlots from "../components/userComponents/AppointmentSlots";
import BookAppointment from "../pages/userPages/BookAppointment";
import Chat from "../components/userComponents/Chats";
import Success from "../pages/userPages/BookingSuccess";
import UserAppointments from "../components/userComponents/AppointmentList";
import Wallet from "../components/userComponents/Wallet";
import About from "../components/common/userCommon/About";
import ContactPage from "../components/common/userCommon/Contact";
import ErrorBoundary from "../components/common/ErrorBoundary";
import NotFound from "../pages/userPages/NotFound";
// import Landing from "../pages/userPages/Landing";

const UserRoutes = () => {
  const location = useLocation();

  const showNavbar = ![
    "/signup",
    "/login",
    "/otp",
    "/forgot-password",
    "/reset-password",
    "/profile",
    "/chats",
    "/success",
    "/appointments",
    "/wallet",
  ].includes(location.pathname);
  const showFooter = ![
    "/signup",
    "/login",
    "/otp",
    "/forgot-password",
    "/reset-password",
    "/profile",
    "/chats",
    "/success",
    "/appointments",
    "/wallet",
  ].includes(location.pathname);

  return (
    <div className="mx-4 sm:mx-[10%]">
      {showNavbar && <Navbar />}
      <ErrorBoundary>
      <Routes>
        {/* <Route path="/" element={<Landing/>} /> */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/home" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctorDetails/:id" element={<DoctorDetails />} />
          <Route path="/doctorSlots/:id" element={<DoctorSlots />} />
          <Route path="/book-appointment/:id" element={<BookAppointment />} />
          <Route path="/success" element={<Success />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chats" element={<Chat />} />
          <Route path="/appointments" element={<UserAppointments />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </ErrorBoundary>
      {showFooter && <Footer />}
    </div>
  );
};

export default UserRoutes;