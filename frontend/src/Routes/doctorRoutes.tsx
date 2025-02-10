import { Routes, Route} from "react-router-dom";
import SignUp from "../pages/doctorPages/SignUp";
import Login from "../pages/doctorPages/Login"; 
import Home from "../pages/doctorPages/Home";
import Qualification from "../pages/doctorPages/Qualification";

const DoctorRoutes = () => {

  return (
    <div className="mx-4 sm:mx-[10%]">
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path ="/login" element = {<Login/>} />
        {/* </Route>        */}
          <Route path="/home" element={<Home />} />
          <Route path="/qualifications" element={<Qualification/>}/>
      </Routes>
    </div>
  );
};

export default DoctorRoutes;
