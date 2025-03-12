// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import UserRoutes from "../src/Routes/userRoutes";
import AdminRoutes from "../src/Routes/adminRoutes";
import DoctorRoutes from "../src/Routes/doctorRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import NotFound from "./components/common/NotFound";

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
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