import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppointmentForm from "./components/AppointmentForm";
import AdminAppointments from "./pages/AdminAppointments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppointmentForm />} />
        <Route path="/admin" element={<AdminAppointments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
