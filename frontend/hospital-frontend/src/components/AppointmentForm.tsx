import { createAppointment } from "../services/appointmentService";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/form.css";

const AppointmentForm = () => {
  const location = useLocation();

  const isFromDiseasePage = Boolean(location.state?.reason);

  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    doctor: "",
    appointmentDate: "",
    reason: "",
  });

  /* ===== Auto-fill ONLY if coming from Disease page ===== */
  useEffect(() => {
    if (location.state) {
      setFormData(prev => ({
        ...prev,
        doctor: location.state?.doctor ?? "",
        reason: location.state?.reason ?? "",
      }));
    }
  }, [location.state]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      alert("Phone number must be 10 digits");
      return;
    }

    if (new Date(formData.appointmentDate) <= new Date()) {
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
    <div className="form-page">
      <form className="appointment-form" onSubmit={handleSubmit}>
        <h2>Book an Appointment</h2>

        <div className="form-group">
          <label>Patient Name</label>
          <input
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength={10}
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div className="form-group">
          <label>Doctor</label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            disabled={isFromDiseasePage}
            required
          >
            <option value="">Select Doctor</option>
            <option value="Dr. Kumar">Dr. Kumar</option>
            <option value="Dr. Priya">Dr. Priya</option>
            <option value="Dr. John">Dr. John</option>
          </select>
        </div>

        <div className="form-group">
          <label>Appointment Date</label>
          <input
            type="datetime-local"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Reason</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            readOnly={isFromDiseasePage}
            placeholder={
              isFromDiseasePage
                ? "Auto-filled from selected disease"
                : "Enter reason for appointment"
            }
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Confirm Appointment
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
