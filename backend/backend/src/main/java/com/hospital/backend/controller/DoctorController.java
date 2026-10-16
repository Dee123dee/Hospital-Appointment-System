package com.hospital.backend.controller;

import com.hospital.backend.model.Appointment;
import com.hospital.backend.model.DoctorSchedule;
import com.hospital.backend.service.AppointmentService;
import com.hospital.backend.service.DoctorScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    private final DoctorScheduleService doctorScheduleService;
    private final AppointmentService appointmentService;

    public DoctorController(DoctorScheduleService doctorScheduleService,
                            AppointmentService appointmentService) {
        this.doctorScheduleService = doctorScheduleService;
        this.appointmentService = appointmentService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        DoctorSchedule doctor = doctorScheduleService.login(username, password);

        // Scrub password in response
        doctor.setPassword(null);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/schedules")
    public List<DoctorSchedule> getAllSchedules() {
        List<DoctorSchedule> list = doctorScheduleService.getAllSchedules();
        list.forEach(d -> d.setPassword(null));
        return list;
    }

    @GetMapping("/{doctorName}/schedule")
    public ResponseEntity<DoctorSchedule> getDoctorSchedule(@PathVariable String doctorName) {
        DoctorSchedule schedule = doctorScheduleService.getScheduleByDoctorName(doctorName);
        if (schedule == null) {
            return ResponseEntity.notFound().build();
        }
        schedule.setPassword(null);
        return ResponseEntity.ok(schedule);
    }

    @PutMapping("/{id}/schedule")
    public ResponseEntity<DoctorSchedule> updateSchedule(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        boolean available = Boolean.parseBoolean(String.valueOf(body.get("available")));
        String shiftStart = String.valueOf(body.get("shiftStart"));
        String shiftEnd = String.valueOf(body.get("shiftEnd"));

        DoctorSchedule updated = doctorScheduleService.updateSchedule(id, available, shiftStart, shiftEnd);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{doctorName}/appointments")
    public List<Appointment> getDoctorAppointments(@PathVariable String doctorName) {
        return appointmentService.getAppointmentsByDoctor(doctorName);
    }
}
