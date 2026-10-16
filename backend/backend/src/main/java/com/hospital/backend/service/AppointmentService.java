package com.hospital.backend.service;

import com.hospital.backend.model.Appointment;
import com.hospital.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AppointmentService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[0-9]{10}$");

    private static final int SLOT_DURATION_MINUTES = 10;

    private final AppointmentRepository appointmentRepository;
    private final DoctorScheduleService doctorScheduleService;
    private final NotificationService notificationService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorScheduleService doctorScheduleService,
                              NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorScheduleService = doctorScheduleService;
        this.notificationService = notificationService;
    }

    public Appointment createAppointment(Appointment appointment) {
        validateAppointment(appointment);
        if (appointment.getStatus() == null || appointment.getStatus().trim().isEmpty()) {
            appointment.setStatus("CONFIRMED");
        }
        if (appointment.getBookingReference() == null || appointment.getBookingReference().trim().isEmpty()) {
            appointment.setBookingReference(generateBookingReference());
        }
        doctorScheduleService.validateDoctorAvailability(appointment.getDoctor(), appointment.getAppointmentDate());
        checkDoctorAvailability(appointment);
        Appointment saved = appointmentRepository.save(appointment);

        // Dispatch Email and SMS Booking Notifications
        try {
            notificationService.sendBookingConfirmation(saved);
        } catch (Exception e) {
            // Non-blocking: log warning so notification failure does not rollback successful appointment booking
            org.slf4j.LoggerFactory.getLogger(AppointmentService.class)
                    .warn("Could not dispatch booking notifications: {}", e.getMessage());
        }

        return saved;
    }

    public List<Appointment> getAppointmentsByDoctor(String doctor) {
        if (doctor == null || doctor.trim().isEmpty()) {
            return List.of();
        }
        return appointmentRepository.findByDoctor(doctor.trim());
    }

    public Appointment updateAppointmentStatus(String id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with id: " + id));

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }
        String upperStatus = status.trim().toUpperCase();
        if (!List.of("CONFIRMED", "COMPLETED", "CANCELLED").contains(upperStatus)) {
            throw new IllegalArgumentException("Invalid status. Allowed: CONFIRMED, COMPLETED, CANCELLED");
        }
        appointment.setStatus(upperStatus);
        Appointment saved = appointmentRepository.save(appointment);

        try {
            if ("CANCELLED".equals(upperStatus)) {
                notificationService.sendCancellationNotification(saved);
            } else {
                notificationService.sendStatusUpdateNotification(saved, upperStatus);
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AppointmentService.class)
                    .warn("Could not dispatch status update notifications: {}", e.getMessage());
        }

        return saved;
    }

    public Appointment cancelAppointment(String id) {
        return updateAppointmentStatus(id, "CANCELLED");
    }

    public List<Appointment> lookupAppointments(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        String clean = query.trim();

        // Try lookup by Booking Reference first
        Optional<Appointment> byRef = appointmentRepository.findByBookingReference(clean.toUpperCase());
        if (byRef.isPresent()) {
            return List.of(byRef.get());
        }

        // Fallback to phone number lookup
        return appointmentRepository.findByPhone(clean);
    }

    public List<Map<String, String>> getAvailableHours(String doctorName, LocalDate date) {
        return doctorScheduleService.getAvailableHours(doctorName, date);
    }

    public List<Map<String, Object>> getSlotsForHour(String doctorName, LocalDate date, int hour) {
        if (doctorName == null || date == null || hour < 0 || hour > 23) {
            return List.of();
        }

        List<Map<String, Object>> slots = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        int[] minutes = {0, 10, 20, 30, 40, 50};

        for (int m : minutes) {
            LocalDateTime slotTime = date.atTime(hour, m);
            String timeStr = String.format("%02d:%02d", hour, m);
            String label = slotTime.format(DateTimeFormatter.ofPattern("hh:mm a"));

            // Check if slot is in the past
            if (slotTime.isBefore(now)) {
                slots.add(Map.of("time", timeStr, "label", label, "available", false, "reason", "Past Time"));
                continue;
            }

            // Check if within doctor's shift
            try {
                doctorScheduleService.validateDoctorAvailability(doctorName, slotTime);
            } catch (IllegalStateException e) {
                slots.add(Map.of("time", timeStr, "label", label, "available", false, "reason", "Off Shift"));
                continue;
            }

            // Check if slot conflicts with an existing non-cancelled appointment
            LocalDateTime windowStart = slotTime.minusMinutes(SLOT_DURATION_MINUTES).plusSeconds(1);
            LocalDateTime windowEnd = slotTime.plusMinutes(SLOT_DURATION_MINUTES).minusSeconds(1);

            List<Appointment> conflicts = appointmentRepository.findByDoctorAndStatusNotAndAppointmentDateBetween(
                    doctorName.trim(), "CANCELLED", windowStart, windowEnd
            );

            boolean isAvailable = conflicts.isEmpty();
            slots.add(Map.of(
                    "time", timeStr,
                    "label", label,
                    "available", isAvailable,
                    "reason", isAvailable ? "Available" : "Booked"
            ));
        }
        return slots;
    }

    private String generateBookingReference() {
        return String.format("VRH-%05d", new java.util.Random().nextInt(100000));
    }

    private void checkDoctorAvailability(Appointment appointment) {
        String doctor = appointment.getDoctor().trim();
        LocalDateTime appointmentDate = appointment.getAppointmentDate();

        // 10-minute slot window: [appointmentDate - 10 min + 1s, appointmentDate + 10 min - 1s]
        LocalDateTime windowStart = appointmentDate.minusMinutes(SLOT_DURATION_MINUTES).plusSeconds(1);
        LocalDateTime windowEnd = appointmentDate.plusMinutes(SLOT_DURATION_MINUTES).minusSeconds(1);

        // CANCELLED appointments are ignored so time slots are released
        List<Appointment> conflicts = appointmentRepository.findByDoctorAndStatusNotAndAppointmentDateBetween(
                doctor, "CANCELLED", windowStart, windowEnd
        );

        boolean hasConflict = conflicts.stream()
                .anyMatch(existing -> appointment.getId() == null || !existing.getId().equals(appointment.getId()));

        if (hasConflict) {
            throw new IllegalStateException(
                    "Doctor " + doctor + " is already booked for this time slot. " +
                    "Appointments must be scheduled at least " + SLOT_DURATION_MINUTES + " minutes apart."
            );
        }
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    private void validateAppointment(Appointment appointment) {
        if (appointment == null) {
            throw new IllegalArgumentException("Appointment cannot be null");
        }
        if (appointment.getPatientName() == null || appointment.getPatientName().trim().isEmpty()) {
            throw new IllegalArgumentException("Patient name is required");
        }
        if (appointment.getEmail() == null || appointment.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (!EMAIL_PATTERN.matcher(appointment.getEmail().trim()).matches()) {
            throw new IllegalArgumentException("Please provide a valid email address");
        }
        if (appointment.getPhone() == null || appointment.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        if (!PHONE_PATTERN.matcher(appointment.getPhone().trim()).matches()) {
            throw new IllegalArgumentException("Phone number must be a valid 10-digit number");
        }
        if (appointment.getDoctor() == null || appointment.getDoctor().trim().isEmpty()) {
            throw new IllegalArgumentException("Doctor is required");
        }
        if (appointment.getAppointmentDate() == null) {
            throw new IllegalArgumentException("Appointment date is required");
        }
        if (appointment.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Appointment date must be in the future");
        }
        if (appointment.getReason() == null || appointment.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Reason is required");
        }
    }
}
