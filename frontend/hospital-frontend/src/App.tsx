import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DiseasePage from "./pages/DiseasePage";
import AppointmentForm from "./components/AppointmentForm";
import AdminAppointments from "./pages/AdminAppointments";
import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/disease/:id" element={<DiseasePage />} />
        <Route path="/appointment" element={<AppointmentForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminAppointments />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
