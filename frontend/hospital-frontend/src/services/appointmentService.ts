import axios from "axios";

const API_URL = "http://localhost:8080/api/appointments";

export interface Appointment {
  id?: string;
  name: string;
  email: string;
  phone: string;
  doctor: string;
  appointmentDate: string;
  problem: string;
}

// POST – create appointment
export const createAppointment = async (appointment: Appointment) => {
  const response = await axios.post(API_URL, appointment);
  return response.data;
};

// GET – fetch all appointments
export const getAllAppointments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
