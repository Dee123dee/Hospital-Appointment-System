import { useState, ChangeEvent, FormEvent } from "react";
import { createAppointment } from "../services/appointmentService";

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    doctor: "",
    appointmentDate: "",
    reason: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    <form onSubmit={handleSubmit}>
      <h2>Book an Appointment</h2>

      <input name="patientName" value={formData.patientName} onChange={handleChange} placeholder="Patient Name" required />
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />

      <select name="doctor" value={formData.doctor} onChange={handleChange} required>
        <option value="">Select Doctor</option>
        <option value="Dr. Kumar">Dr. Kumar</option>
        <option value="Dr. Priya">Dr. Priya</option>
        <option value="Dr. John">Dr. John</option>
      </select>

      <input type="datetime-local" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} required />
      <textarea name="reason" value={formData.reason} onChange={handleChange} placeholder="Reason" required />

      <button type="submit">Submit</button>
    </form>
  );
};

export default AppointmentForm;
