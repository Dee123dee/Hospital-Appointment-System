import { createAppointment } from "../services/appointmentService";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/form.css";

const AppointmentForm = () => {
  const location = useLocation();

  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    doctor: "",
    appointmentDate: "",
    reason: "",
  });

  // ✅ Auto-fill from Disease page
  useEffect(() => {
    if (location.state) {
      setFormData(prev => ({
        ...prev,
        doctor: location.state.doctor || "",
        reason: location.state.reason || "",
      }));
    }
  }, [location.state]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
if (formData.phone.length !== 10) {
  alert("Phone number must be 10 digits");
  return;
}

if (new Date(formData.appointmentDate) < new Date()) {
  alert("Appointment date must be in the future");
  return;
}
    try {
      await createAppointment(formData);
      alert("Appointment booked successfully ✅");

      setFormData({
        patientName: "",
        email: "",
        phone: "",
        doctor: "",
        appointmentDate: "",
        reason: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to book appointment ❌");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
      <h2>Book an Appointment</h2>

      <input
        name="patientName"
        placeholder="Patient Name"
        value={formData.patientName}
        onChange={handleChange}
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <select
        name="doctor"
        value={formData.doctor}
        onChange={handleChange}
        disabled={!!location.state?.doctor}
        required
      >
        <option value="">Select Doctor</option>
        <option value="Dr. Kumar">Dr. Kumar</option>
        <option value="Dr. Priya">Dr. Priya</option>
        <option value="Dr. John">Dr. John</option>
      </select>

      <input
        type="datetime-local"
        name="appointmentDate"
        value={formData.appointmentDate}
        onChange={handleChange}
        required
      />

      <textarea
        name="reason"
        placeholder="Reason for visit"
        value={formData.reason}
        onChange={handleChange}
        readOnly={!!location.state?.reason}
        required
      />

      <button type="submit">Submit</button>
    </form>
  );
};

export default AppointmentForm;
