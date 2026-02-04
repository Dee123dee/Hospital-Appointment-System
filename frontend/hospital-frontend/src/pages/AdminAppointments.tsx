import { useEffect, useState } from "react";
import { getAllAppointments } from "../services/appointmentService";
import type { Appointment } from "../services/appointmentService";

function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    getAllAppointments()
      .then(data => setAppointments(data))
      .catch(err => {
        console.error("API Error:", err);
        setAppointments([]);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Appointments</h2>

      <table border={1} cellPadding={10} style={{ width: "100%" }}>
        <thead>
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
          {appointments.map(a => (
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
    </div>
  );
}

export default AdminAppointments;
