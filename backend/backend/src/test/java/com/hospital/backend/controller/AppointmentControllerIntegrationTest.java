package com.hospital.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.backend.model.Appointment;
import com.hospital.backend.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AppointmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @BeforeEach
    void cleanUp() {
        appointmentRepository.deleteAll();
    }

    private Appointment createSampleAppointment(String doctor, LocalDateTime time) {
        Appointment appointment = new Appointment();
        appointment.setPatientName("Alice Smith");
        appointment.setEmail("alice@example.com");
        appointment.setPhone("9876543210");
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(time);
        appointment.setReason("Consultation");
        return appointment;
    }

    @Test
    void shouldCreateAppointmentSuccessfully() throws Exception {
        LocalDateTime time = LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0).withNano(0);
        Appointment appointment = createSampleAppointment("Dr. T. Vijayaragavan", time);

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientName").value("Alice Smith"))
                .andExpect(jsonPath("$.doctor").value("Dr. T. Vijayaragavan"));
    }

    @Test
    void shouldReturn409ConflictWhenSlotIsWithinTenMinutes() throws Exception {
        LocalDateTime time2pm = LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0).withNano(0);

        // First appointment at 14:00
        Appointment first = createSampleAppointment("Dr. T. Vijayaragavan", time2pm);
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isOk());

        // Second appointment at 14:05 (within 10 minutes) -> should fail with 409
        Appointment second = createSampleAppointment("Dr. T. Vijayaragavan", time2pm.plusMinutes(5));
        second.setPatientName("Bob Johnson");
        second.setEmail("bob@example.com");

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value(containsString("already booked")));
    }

    @Test
    void shouldAllowBookingAtExactTenMinuteInterval() throws Exception {
        LocalDateTime time2pm = LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0).withNano(0);

        // First appointment at 14:00
        Appointment first = createSampleAppointment("Dr. T. Vijayaragavan", time2pm);
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isOk());

        // Second appointment at 14:10 (10 minutes interval) -> should succeed
        Appointment second = createSampleAppointment("Dr. T. Vijayaragavan", time2pm.plusMinutes(10));
        second.setPatientName("Charlie Brown");
        second.setEmail("charlie@example.com");

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientName").value("Charlie Brown"));
    }

    @Test
    void shouldAllowBookingExactSameSlotWhenPriorAppointmentCancelled() throws Exception {
        LocalDateTime time = LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0).withNano(0);

        // Book first appointment
        Appointment first = createSampleAppointment("Dr. T. Vijayaragavan", time);
        String response = mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Appointment savedFirst = objectMapper.readValue(response, Appointment.class);

        // Cancel first appointment
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/appointments/" + savedFirst.getId() + "/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        // Now book the exact same slot with another patient -> must succeed!
        Appointment replacement = createSampleAppointment("Dr. T. Vijayaragavan", time);
        replacement.setPatientName("Replacement Patient");
        replacement.setEmail("replacement@example.com");

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(replacement)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientName").value("Replacement Patient"))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }
}
