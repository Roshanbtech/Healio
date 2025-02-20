import { Routes, Route} from "react-router-dom";
import SignUp from "../pages/doctorPages/SignUp";
import Login from "../pages/doctorPages/Login"; 
import Home from "../pages/doctorPages/Home";
import Qualification from "../pages/doctorPages/Qualification";
import Profile from "../pages/doctorPages/Profile";
import ForgotPassword from "../pages/doctorPages/ForgotPassword";
import ResetPassword from "../pages/doctorPages/ResetPassword";
import Schedule from "../pages/doctorPages/Schedule";

const DoctorRoutes = () => {

  return (
    <div className="mx-4 sm:mx-[10%]">
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path ="/login" element = {<Login/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
        {/* </Route>        */}
          <Route path="/home" element={<Home />} />
          <Route path="/qualifications" element={<Qualification/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/schedules" element={<Schedule/>}/>

      </Routes>
    </div>
  );
};

export default DoctorRoutes;
