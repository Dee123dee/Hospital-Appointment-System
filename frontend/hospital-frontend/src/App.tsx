import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DiseasePage from "./pages/DiseasePage";
import AppointmentForm from "./components/AppointmentForm";
import AdminAppointments from "./pages/AdminAppointments";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./components/AdminRoute";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorRoute from "./components/DoctorRoute";
import MyAppointments from "./pages/MyAppointments";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/disease/:id" element={<DiseasePage />} />
        <Route path="/appointment" element={<AppointmentForm />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminAppointments />
            </AdminRoute>
          }
        />

        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route
          path="/doctor-dashboard"
          element={
            <DoctorRoute>
              <DoctorDashboard />
            </DoctorRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
