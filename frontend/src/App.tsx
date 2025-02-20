import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import UserRoutes from "../src/Routes/userRoutes";
import AdminRoutes from "../src/Routes/adminRoutes";
import DoctorRoutes from "../src/Routes/doctorRoutes";
import ErrorBoundary from './pages/userPages/ErrorBoundary';


const App = () => {
  return (
  <>
  <Router>
  <ErrorBoundary>
    <Routes>
      <Route path="/*" element={<UserRoutes />} />
      <Route path="/doctor/*" element={<DoctorRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
    </ErrorBoundary>
  </Router>
  </>
  )
}

export default App;