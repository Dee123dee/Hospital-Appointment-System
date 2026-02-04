import { createAppointment } from "../services/appointmentService";
import { useState } from "react";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async(e: React.FormEvent) => {
  e.preventDefault();
   try {
    await createAppointment({
      patientName: formData.patientName,
      email: formData.email,
      phone: formData.phone,
      doctor: formData.doctor,
      appointmentDate: formData.appointmentDate,
      reason: formData.reason,
    });

    alert("Appointment booked successfully ✅");

    // reset form
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

      <input
        type="text"
        name="patientName"
        placeholder="Patient Name"
        value={formData.patientName}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <select
        name="doctor"
        value={formData.doctor}
        onChange={handleChange}
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
        required
      />

      <button type="submit">Submit</button>
    </form>
  );
};

export default AppointmentForm;
