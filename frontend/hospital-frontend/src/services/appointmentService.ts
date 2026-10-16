import axios from "axios";

const API_URL = "http://localhost:8088/api/appointments";

// ✅ EXPORT TYPE (NOT interface)
export type Appointment = {
  id?: string;
  patientName: string;
  email: string;
  phone: string;
  doctor: string;
  appointmentDate: string;
  reason: string;
  status?: "CONFIRMED" | "COMPLETED" | "CANCELLED" | string;
  bookingReference?: string;
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

// GET – lookup appointments by phone or booking reference
export const lookupAppointments = async (query: string): Promise<Appointment[]> => {
  const response = await axios.get(`${API_URL}/lookup`, {
    params: { query },
  });
  return response.data;
};

// PUT – update appointment status (CONFIRMED, COMPLETED, CANCELLED)
export const updateAppointmentStatus = async (
  id: string,
  status: string
): Promise<Appointment> => {
  const response = await axios.put(`${API_URL}/${id}/status`, { status });
  return response.data;
};

// PUT – cancel appointment
export const cancelAppointment = async (id: string): Promise<Appointment> => {
  const response = await axios.put(`${API_URL}/${id}/cancel`);
  return response.data;
};

// Types for 2-step slot picker
export type AvailableHour = {
  hour: string; // "09", "10", etc.
  label: string; // "09:00 am", "10:00 am", etc.
};

export type TimeSlot = {
  time: string; // "10:00", "10:10", etc.
  label: string; // "10:00 am", "10:10 am", etc.
  available: boolean;
  reason: string;
};

// GET – available hours for doctor on a given date
export const getDoctorAvailableHours = async (
  doctor: string,
  date: string
): Promise<AvailableHour[]> => {
  const response = await axios.get(`${API_URL}/doctor-hours`, {
    params: { doctor, date },
  });
  return response.data;
};

// GET – 10-minute slots for selected hour
export const getSlotsForHour = async (
  doctor: string,
  date: string,
  hour: number
): Promise<TimeSlot[]> => {
  const response = await axios.get(`${API_URL}/slots`, {
    params: { doctor, date, hour },
  });
  return response.data;
};

// Notification Types & API
const NOTIF_URL = "http://localhost:8088/api/notifications";

export type NotificationItem = {
  id?: string;
  appointmentId?: string;
  bookingReference?: string;
  recipientEmail: string;
  recipientPhone: string;
  channel: "EMAIL" | "SMS";
  type: "BOOKING_CONFIRMATION" | "CANCELLATION" | "STATUS_UPDATE";
  subject: string;
  message: string;
  status: string;
  sentAt: string;
};

export const getNotificationsByReference = async (
  reference: string
): Promise<NotificationItem[]> => {
  const response = await axios.get(`${NOTIF_URL}/reference/${reference}`);
  return response.data;
};

export const getNotificationsByPhone = async (
  phone: string
): Promise<NotificationItem[]> => {
  const response = await axios.get(`${NOTIF_URL}/phone/${phone}`);
  return response.data;
};

export const getNotificationsByAppointment = async (
  appointmentId: string
): Promise<NotificationItem[]> => {
  const response = await axios.get(`${NOTIF_URL}/appointment/${appointmentId}`);
  return response.data;
};
