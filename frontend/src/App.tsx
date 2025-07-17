// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import UserRoutes from "./Routes/userRoutes";
import AdminRoutes from "./Routes/adminRoutes";
import DoctorRoutes from "./Routes/doctorRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import NotFound from "./components/common/NotFound";
import GlobalNotifications from "./components/common/GlobalNotification";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <ErrorBoundary>
      <ToastContainer />
      <Router>
      <GlobalNotifications />
        <Routes>
          <Route path="/*" element={<UserRoutes />} />
          <Route path="/doctor/*" element={<DoctorRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
