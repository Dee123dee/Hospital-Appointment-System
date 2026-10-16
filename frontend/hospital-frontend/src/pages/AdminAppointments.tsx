import { useEffect, useState } from "react";
import { getAllAppointments, updateAppointmentStatus } from "../services/appointmentService";
import type { Appointment } from "../services/appointmentService";
import "../styles/admin.css";

function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const loadAppointments = () => {
    getAllAppointments()
      .then(data => {
        setAppointments(data || []);
      })
      .catch(err => {
        console.error("API Error:", err);
        setAppointments([]);
      });
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      loadAppointments();
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment status");
    }
  };

  /* ===== Dashboard Calculations ===== */
  const totalAppointments = appointments.length;

  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(a =>
    a.appointmentDate &&
    new Date(a.appointmentDate).toDateString() === today
  ).length;

  const diseaseOptions = Array.from(
    new Set(
      appointments
        .map(a => a.reason)
        .filter(Boolean)
    )
  );

  const doctorCount = new Set(
    appointments
      .map(a => a.doctor)
      .filter(Boolean)
  ).size;

  /* ===== Filter + Search (SAFE) ===== */
  const filteredAppointments = appointments.filter(a => {
    const patientName = a.patientName ?? "";
    const reason = a.reason ?? "";

    const matchesDisease =
      filter === "All" || reason === filter;

    const matchesSearch =
      patientName.toLowerCase().includes(search.toLowerCase());

    return matchesDisease && matchesSearch;
  });

  return (
    <div className="admin-page">
      <h1>Hospital Appointments</h1>
      <p className="subtitle">Admin Dashboard – Manage Patient Bookings</p>
<button
  className="logout-btn"
  onClick={() => {
    localStorage.removeItem("isAdmin");
    window.location.href = "/";
  }}
>
  Logout
</button>

      {/* ===== Dashboard Cards ===== */}
      <div className="dashboard-cards">
        <div className="card">
          <h3>{totalAppointments}</h3>
          <p>Total Appointments</p>
        </div>

        <div className="card">
          <h3>{todayAppointments}</h3>
          <p>Today</p>
        </div>

        <div className="card">
          <h3>{diseaseOptions.length}</h3>
          <p>Diseases Covered</p>
        </div>

        <div className="card">
          <h3>{doctorCount}</h3>
          <p>Doctors</p>
        </div>
      </div>

      {/* ===== Filter + Search ===== */}
      <div className="filter-bar">
        <label>Filter:</label>

        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="All">All Diseases</option>
          {diseaseOptions.map(disease => (
            <option key={disease} value={disease}>
              {disease}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search patient name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ===== Table ===== */}
      <div className="table-wrapper">
        {filteredAppointments.length === 0 ? (
          <p className="empty-text">No appointments available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map(a => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.patientName || "N/A"}</strong>
                    <br />
                    <small style={{ color: "#718096" }}>{a.bookingReference || a.id}</small>
                  </td>
                  <td>{a.doctor || "-"}</td>
                  <td>
                    {a.appointmentDate
                      ? new Date(a.appointmentDate).toLocaleString()
                      : "-"}
                  </td>
                  <td>{a.reason || "-"}</td>
                  <td>
                    <div>📞 {a.phone || "-"}</div>
                    <div><small>✉️ {a.email || "-"}</small></div>
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
        )}
      </div>
    </div>
  );
}

export default AdminAppointments;
