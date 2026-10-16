import axios from "axios";
import type { Appointment } from "./appointmentService";

const API_BASE = "http://localhost:8088/api/doctors";

export interface DoctorSchedule {
  id: string;
  doctorName: string;
  username: string;
  specialty: string;
  available: boolean;
  shiftStart: string;
  shiftEnd: string;
}

export const doctorLogin = async (username: string, password: string): Promise<DoctorSchedule> => {
  const response = await axios.post(`${API_BASE}/login`, { username, password });
  return response.data;
};

export const getDoctorSchedule = async (doctorName: string): Promise<DoctorSchedule> => {
  const response = await axios.get(`${API_BASE}/${encodeURIComponent(doctorName)}/schedule`);
  return response.data;
};

export const getAllDoctorSchedules = async (): Promise<DoctorSchedule[]> => {
  const response = await axios.get(`${API_BASE}/schedules`);
  return response.data;
};

export const updateDoctorSchedule = async (
  id: string,
  available: boolean,
  shiftStart: string,
  shiftEnd: string
): Promise<DoctorSchedule> => {
  const response = await axios.put(`${API_BASE}/${id}/schedule`, {
    available,
    shiftStart,
    shiftEnd,
  });
  return response.data;
};

export const getDoctorAppointments = async (doctorName: string): Promise<Appointment[]> => {
  const response = await axios.get(`${API_BASE}/${encodeURIComponent(doctorName)}/appointments`);
  return response.data;
};
