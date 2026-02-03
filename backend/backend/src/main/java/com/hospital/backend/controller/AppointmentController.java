package com.hospital.backend.controller;
import com.hospital.backend.model.Appointment;
import com.hospital.backend.repository.AppointmentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    private final AppointmentRepository repository;

    public AppointmentController(AppointmentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return repository.save(appointment);
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return repository.findAll();
    }
}
