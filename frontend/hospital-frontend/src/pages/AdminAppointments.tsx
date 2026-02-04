import { useEffect, useState } from "react";

interface Appointment {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  doctor: string;
  appointmentDate: string;
  problem: string;
}

function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/appointments")
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
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
            <th>Date</th>
            <th>Problem</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.id}>
              <td>{a.patientName}</td>
              <td>{a.email}</td>
              <td>{a.phone}</td>
              <td>{a.doctor}</td>
              <td>
                {new Date(a.appointmentDate).toLocaleString()}
            </td>
              <td>{a.problem}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminAppointments;
