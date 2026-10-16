package com.hospital.backend.service;

import com.hospital.backend.model.DoctorSchedule;
import com.hospital.backend.repository.DoctorScheduleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DoctorScheduleService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final DoctorScheduleRepository doctorScheduleRepository;

    public DoctorScheduleService(DoctorScheduleRepository doctorScheduleRepository) {
        this.doctorScheduleRepository = doctorScheduleRepository;
    }

    @PostConstruct
    public void seedDefaultDoctors() {
        if (doctorScheduleRepository.count() == 0) {
            doctorScheduleRepository.saveAll(List.of(
                    new DoctorSchedule("Dr. T. Vijayaragavan", "dr.vijayaragavan", "doctor123",
                            "General Surgery", true, "08:00", "20:00"),
                    new DoctorSchedule("Dr. Kumar", "dr.kumar", "doctor123",
                            "General Medicine", true, "09:00", "17:00"),
                    new DoctorSchedule("Dr. Priya", "dr.priya", "doctor123",
                            "Pediatrics", true, "14:00", "22:00"),
                    new DoctorSchedule("Dr. John", "dr.john", "doctor123",
                            "Emergency Care (Night Shift)", true, "22:00", "06:00")
            ));
        }
    }

    public DoctorSchedule login(String username, String password) {
        if (username == null || password == null) {
            throw new IllegalArgumentException("Username and password are required");
        }
        DoctorSchedule doctor = doctorScheduleRepository.findByUsername(username.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid doctor credentials"));

        if (!doctor.getPassword().equals(password.trim())) {
            throw new IllegalArgumentException("Invalid doctor credentials");
        }
        return doctor;
    }

    public List<DoctorSchedule> getAllSchedules() {
        return doctorScheduleRepository.findAll();
    }

    public DoctorSchedule getScheduleByDoctorName(String doctorName) {
        return doctorScheduleRepository.findByDoctorName(doctorName.trim())
                .orElse(null);
    }

    public DoctorSchedule updateSchedule(String id, boolean available, String shiftStart, String shiftEnd) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor schedule not found"));

        validateTimeFormat(shiftStart);
        validateTimeFormat(shiftEnd);

        schedule.setAvailable(available);
        schedule.setShiftStart(shiftStart);
        schedule.setShiftEnd(shiftEnd);

        return doctorScheduleRepository.save(schedule);
    }

    public List<Map<String, String>> getAvailableHours(String doctorName, LocalDate date) {
        if (doctorName == null || date == null) {
            return List.of();
        }
        Optional<DoctorSchedule> scheduleOpt = doctorScheduleRepository.findByDoctorName(doctorName.trim());
        if (scheduleOpt.isEmpty()) {
            return List.of();
        }
        DoctorSchedule schedule = scheduleOpt.get();
        if (!schedule.isAvailable()) {
            return List.of();
        }

        List<Map<String, String>> hours = new ArrayList<>();
        LocalTime now = LocalTime.now();
        boolean isToday = date.equals(LocalDate.now());

        for (int h = 0; h < 24; h++) {
            LocalTime hourStart = LocalTime.of(h, 0);
            LocalTime hourEnd = LocalTime.of(h, 59);

            boolean inShift = isTimeWithinShift(hourStart, schedule.getShiftStart(), schedule.getShiftEnd())
                    || isTimeWithinShift(hourEnd, schedule.getShiftStart(), schedule.getShiftEnd());

            if (inShift) {
                // If the selected date is today, skip past hours
                if (isToday && h < now.getHour()) {
                    continue;
                }
                String hh = String.format("%02d", h);
                String label = hourStart.format(DateTimeFormatter.ofPattern("hh:00 a"));
                hours.add(Map.of("hour", hh, "label", label));
            }
        }
        return hours;
    }

    public boolean isTimeWithinShift(LocalTime time, String shiftStart, String shiftEnd) {
        LocalTime start = LocalTime.parse(shiftStart, TIME_FORMATTER);
        LocalTime end = LocalTime.parse(shiftEnd, TIME_FORMATTER);

        if (start.equals(end)) {
            return true;
        } else if (start.isBefore(end)) {
            return !time.isBefore(start) && !time.isAfter(end);
        } else {
            return !time.isBefore(start) || !time.isAfter(end);
        }
    }

    public void validateDoctorAvailability(String doctorName, LocalDateTime appointmentDateTime) {
        if (doctorName == null || appointmentDateTime == null) {
            return;
        }

        Optional<DoctorSchedule> scheduleOpt = doctorScheduleRepository.findByDoctorName(doctorName.trim());
        if (scheduleOpt.isEmpty()) {
            return; // If doctor is not managed in schedule database, allow
        }

        DoctorSchedule schedule = scheduleOpt.get();

        if (!schedule.isAvailable()) {
            throw new IllegalStateException("Doctor " + doctorName + " is currently off-duty and not accepting appointments.");
        }

        LocalTime appointmentTime = appointmentDateTime.toLocalTime();
        boolean isWithinShift = isTimeWithinShift(appointmentTime, schedule.getShiftStart(), schedule.getShiftEnd());

        if (!isWithinShift) {
            throw new IllegalStateException(
                    "Doctor " + doctorName + " is only available between " +
                    schedule.getShiftStart() + " and " + schedule.getShiftEnd() +
                    ". Selected time (" + appointmentTime.format(TIME_FORMATTER) + ") is outside this shift."
            );
        }
    }

    private void validateTimeFormat(String timeStr) {
        try {
            LocalTime.parse(timeStr, TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Time must be in 24-hour format HH:mm (e.g. 09:00 or 20:00)");
        }
    }
}
