import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import UserRoutes from "../src/Routes/userRoutes";
// import AdminRoutes from "./src/Routes/adminRoutes";
// import DoctorRoutes from "./src/Routes/doctorRoutes";




const App = () => {
  return (
  <>
  {/* <div className="App text-purple-600 underline">App</div> */}
  <Router>
    <Routes>
      <Route path="/*" element={<UserRoutes />} />
      {/* <Route path="/doctors" element={<DoctorRoutes />} />
      <Route path="/admin" element={<AdminRoutes />} /> */}
    </Routes>
  </Router>
  </>
  )
}

export default App;