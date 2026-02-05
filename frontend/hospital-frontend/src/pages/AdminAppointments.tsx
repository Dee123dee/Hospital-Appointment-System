import { useEffect, useState } from "react";
import { getAllAppointments } from "../services/appointmentService";
import type { Appointment } from "../services/appointmentService";

function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getAllAppointments()
      .then(data => setAppointments(data))
      .catch(err => {
        console.error("API Error:", err);
        setAppointments([]);
      });
  }, []);

  const filteredAppointments =
    filter === "All"
      ? appointments
      : appointments.filter(a => a.reason === filter);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2 style={{ marginBottom: "20px" }}>Hospital Appointments (Admin)</h2>

      {/* Filter */}
      <div style={{ marginBottom: "15px" }}>
        <label><b>Filter by Disease:</b> </label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: "5px", marginLeft: "10px" }}
        >
          <option value="All">All</option>
          <option value="Fever">Fever</option>
          <option value="Heart Problem">Heart Problem</option>
          <option value="Surgery">Surgery</option>
          <option value="Dental">Dental</option>
        </select>
      </div>

      {/* Empty State */}
      {filteredAppointments.length === 0 ? (
        <p>No appointments available</p>
      ) : (
        <table
          border={1}
          cellPadding={10}
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th>Patient</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {filteredAppointments.map(a => (
              <tr key={a.id}>
                <td>{a.patientName}</td>
                <td>{a.email}</td>
                <td>{a.phone}</td>
                <td>{a.doctor}</td>
                <td>{new Date(a.appointmentDate).toLocaleString()}</td>
                <td>{a.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminAppointments;
