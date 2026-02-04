import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminAppointments from "./pages/AdminAppointments";
import AppointmentForm from "./components/AppointmentForm"; // your old page

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
