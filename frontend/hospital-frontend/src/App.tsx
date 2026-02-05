import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DiseasePage from "./pages/DiseasePage";
import AppointmentForm from "./components/AppointmentForm";
import AdminAppointments from "./pages/AdminAppointments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/disease/:id" element={<DiseasePage />} />
        <Route path="/appointment" element={<AppointmentForm />} />
        <Route path="/admin" element={<AdminAppointments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
