import axios from "axios";

const API_URL = "http://localhost:8080/api/appointments";

// ✅ EXPORT TYPE (NOT interface)
export type Appointment = {
  id?: string;
  patientName: string;
  email: string;
  phone: string;
  doctor: string;
  appointmentDate: string;
  reason: string;
};

// POST – create appointment
export const createAppointment = async (
  appointment: Appointment
): Promise<Appointment> => {
  const response = await axios.post(API_URL, appointment);
  return response.data;
};

// GET – fetch all appointments
export const getAllAppointments = async (): Promise<Appointment[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};
