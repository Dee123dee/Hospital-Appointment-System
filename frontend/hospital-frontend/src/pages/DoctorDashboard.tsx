import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDoctorSchedule,
  updateDoctorSchedule,
  getDoctorAppointments,
} from "../services/doctorService";
import type { DoctorSchedule } from "../services/doctorService";
import { updateAppointmentStatus } from "../services/appointmentService";
import type { Appointment } from "../services/appointmentService";
import "../styles/doctor.css";
import "../styles/admin.css";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<DoctorSchedule | null>(null);
  const [available, setAvailable] = useState(true);
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("17:00");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      if (doctor) {
        const freshAppts = await getDoctorAppointments(doctor.doctorName);
        setAppointments(freshAppts);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("doctorUser");
    if (!stored) {
      navigate("/doctor-login");
      return;
    }

    try {
      const parsed: DoctorSchedule = JSON.parse(stored);
      setDoctor(parsed);

      // Load fresh schedule and appointments
      Promise.all([
        getDoctorSchedule(parsed.doctorName),
        getDoctorAppointments(parsed.doctorName),
      ])
        .then(([sched, appts]) => {
          if (sched) {
            setAvailable(sched.available);
            setShiftStart(sched.shiftStart);
            setShiftEnd(sched.shiftEnd);
          }
          setAppointments(appts || []);
        })
        .catch(err => {
          console.error("Error loading doctor data:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (e) {
      console.error(e);
      navigate("/doctor-login");
    }
  }, [navigate]);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    setSaveStatus("Saving...");
    try {
      const updated = await updateDoctorSchedule(doctor.id, available, shiftStart, shiftEnd);
      setDoctor(updated);
      localStorage.setItem("doctorUser", JSON.stringify(updated));
      setSaveStatus("✅ Schedule updated successfully!");
      setTimeout(() => setSaveStatus(""), 4000);
    } catch (err: any) {
      console.error(err);
      setSaveStatus("❌ Failed to update schedule");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("doctorUser");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="doctor-page">
        <p>Loading Doctor Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="doctor-page">
      <div className="doctor-header">
        <div>
          <h1>
            {doctor?.doctorName}
            <span
              className={`doctor-badge ${
                available ? "badge-active" : "badge-inactive"
              }`}
            >
              {available ? "ON DUTY" : "OFF DUTY"}
            </span>
          </h1>
          <p style={{ color: "#718096", margin: "4px 0 0" }}>
            Specialty: <strong>{doctor?.specialty}</strong> | Username:{" "}
            <code>{doctor?.username}</code>
          </p>
        </div>

        <button className="doctor-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {saveStatus && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: saveStatus.includes("✅") ? "#c6f6d5" : "#fed7d7",
            color: saveStatus.includes("✅") ? "#22543d" : "#742a2a",
            fontWeight: 500,
          }}
        >
          {saveStatus}
        </div>
      )}

      {/* ===== Shift Controls ===== */}
      <div className="doctor-controls-grid">
        <div className="control-card">
          <h3>Duty & Shift Schedule</h3>
          <form onSubmit={handleSaveSchedule}>
            <div className="toggle-container">
              <input
                type="checkbox"
                id="dutyToggle"
                checked={available}
                onChange={e => setAvailable(e.target.checked)}
              />
              <label htmlFor="dutyToggle" style={{ fontWeight: 600, cursor: "pointer" }}>
                {available
                  ? "Currently Accepting Appointments"
                  : "Unavailable / Off-Duty (Blocks new bookings)"}
              </label>
            </div>

            <div className="shift-input-group">
              <label>Shift Start Time (24h)</label>
              <input
                type="time"
                value={shiftStart}
                onChange={e => setShiftStart(e.target.value)}
                required
              />
            </div>

            <div className="shift-input-group">
              <label>Shift End Time (24h - supports overnight shifts)</label>
              <input
                type="time"
                value={shiftEnd}
                onChange={e => setShiftEnd(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="save-schedule-btn">
              Update My Availability
            </button>
          </form>
        </div>

        <div className="control-card">
          <h3>Shift Overview</h3>
          <p style={{ color: "#4a5568", lineHeight: "1.6" }}>
            <strong>Hospital Policy (24/7 Operations):</strong>
            <br />
            Patients can only schedule an appointment with you during your active shift window.
          </p>
          <ul style={{ color: "#4a5568", paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>Current Shift: <strong>{shiftStart}</strong> to <strong>{shiftEnd}</strong></li>
            <li>Slot Interval: <strong>10 minutes</strong> reserved per patient</li>
            <li>Status: <strong>{available ? "Available" : "Off-Duty"}</strong></li>
          </ul>
        </div>
      </div>

      {/* ===== My Scheduled Appointments ===== */}
      <div className="doctor-appointments-section">
        <h2>My Scheduled Appointments ({appointments.length})</h2>

        {appointments.length === 0 ? (
          <div className="empty-state">
            No upcoming appointments scheduled for you yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Appointment Date & Time</th>
                  <th>Reason / Disease</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.patientName}</strong>
                      <br />
                      <small style={{ color: "#718096" }}>{a.bookingReference || a.id}</small>
                    </td>
                    <td>
                      {a.appointmentDate
                        ? new Date(a.appointmentDate).toLocaleString()
                        : "-"}
                    </td>
                    <td>{a.reason}</td>
                    <td>
                      <div>📞 {a.phone}</div>
                      <div>✉️ <small>{a.email}</small></div>
                    </td>
                    <td>
                      <span
                        className={`doctor-badge ${
                          (a.status || "CONFIRMED") === "CONFIRMED"
                            ? "badge-active"
                            : (a.status === "COMPLETED" ? "" : "badge-inactive")
                        }`}
                        style={
                          a.status === "COMPLETED"
                            ? { backgroundColor: "#bee3f8", color: "#2b6cb0" }
                            : {}
                        }
                      >
                        {a.status || "CONFIRMED"}
                      </span>
                    </td>
                    <td>
                      {(a.status || "CONFIRMED") === "CONFIRMED" && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => handleStatusChange(a.id!, "COMPLETED")}
                            style={{
                              backgroundColor: "#3182ce",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(a.id!, "CANCELLED")}
                            style={{
                              backgroundColor: "#e53e3e",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
