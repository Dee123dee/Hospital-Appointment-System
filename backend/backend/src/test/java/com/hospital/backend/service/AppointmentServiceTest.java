package com.hospital.backend.service;

import com.hospital.backend.model.Appointment;
import com.hospital.backend.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorScheduleService doctorScheduleService;

    @Mock
    private NotificationService notificationService;

    private AppointmentService appointmentService;

    @BeforeEach
    void setUp() {
        appointmentService = new AppointmentService(appointmentRepository, doctorScheduleService, notificationService);
    }

    private Appointment createValidAppointment(String doctor, LocalDateTime time) {
        Appointment appointment = new Appointment();
        appointment.setPatientName("John Doe");
        appointment.setEmail("john.doe@example.com");
        appointment.setPhone("9876543210");
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(time);
        appointment.setReason("General Checkup");
        return appointment;
    }

    @Test
    void shouldSuccessfullyBookAppointmentWhenNoConflict() {
        LocalDateTime time = LocalDateTime.now().plusDays(1).withHour(14).withMinute(0).withSecond(0).withNano(0);
        Appointment appointment = createValidAppointment("Dr. T. Vijayaragavan", time);

        when(appointmentRepository.findByDoctorAndStatusNotAndAppointmentDateBetween(eq("Dr. T. Vijayaragavan"), eq("CANCELLED"), any(), any()))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        Appointment saved = appointmentService.createAppointment(appointment);
        assertNotNull(saved);
        assertEquals("CONFIRMED", saved.getStatus());
        assertNotNull(saved.getBookingReference());
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void shouldThrowConflictWhenDoctorBookedAtSameTime() {
        LocalDateTime time = LocalDateTime.now().plusDays(1).withHour(14).withMinute(0).withSecond(0).withNano(0);
        Appointment appointment = createValidAppointment("Dr. T. Vijayaragavan", time);

        Appointment existing = createValidAppointment("Dr. T. Vijayaragavan", time);
        existing.setPatientName("Another Patient");

        when(appointmentRepository.findByDoctorAndStatusNotAndAppointmentDateBetween(eq("Dr. T. Vijayaragavan"), eq("CANCELLED"), any(), any()))
                .thenReturn(List.of(existing));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                appointmentService.createAppointment(appointment)
        );

        assertTrue(ex.getMessage().contains("already booked for this time slot"));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void shouldAllowBookingAtTenMinutesInterval() {
        LocalDateTime time2pm = LocalDateTime.now().plusDays(1).withHour(14).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime time210pm = time2pm.plusMinutes(10);

        Appointment appointment210 = createValidAppointment("Dr. T. Vijayaragavan", time210pm);

        when(appointmentRepository.findByDoctorAndStatusNotAndAppointmentDateBetween(eq("Dr. T. Vijayaragavan"), eq("CANCELLED"), any(), any()))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.save(appointment210)).thenReturn(appointment210);

        Appointment saved = appointmentService.createAppointment(appointment210);
        assertNotNull(saved);
        verify(appointmentRepository, times(1)).save(appointment210);
    }

    @Test
    void shouldCancelAppointmentAndSetStatusCancelled() {
        Appointment appointment = createValidAppointment("Dr. T. Vijayaragavan", LocalDateTime.now().plusDays(1));
        appointment.setStatus("CONFIRMED");

        when(appointmentRepository.findById("123")).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        Appointment cancelled = appointmentService.cancelAppointment("123");
        assertEquals("CANCELLED", cancelled.getStatus());
        verify(appointmentRepository, times(1)).save(appointment);
    }
}
