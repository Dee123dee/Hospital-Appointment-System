package com.hospital.backend.service;

import com.hospital.backend.model.DoctorSchedule;
import com.hospital.backend.repository.DoctorScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DoctorScheduleServiceTest {

    @Mock
    private DoctorScheduleRepository doctorScheduleRepository;

    private DoctorScheduleService doctorScheduleService;

    @BeforeEach
    void setUp() {
        doctorScheduleService = new DoctorScheduleService(doctorScheduleRepository);
    }

    @Test
    void shouldAllowBookingWithinStandardDayShift() {
        DoctorSchedule schedule = new DoctorSchedule("Dr. T. Vijayaragavan", "dr.v", "pass",
                "Surgery", true, "08:00", "20:00");
        when(doctorScheduleRepository.findByDoctorName("Dr. T. Vijayaragavan")).thenReturn(Optional.of(schedule));

        LocalDateTime bookingTime = LocalDateTime.now().plusDays(1).withHour(14).withMinute(30);
        assertDoesNotThrow(() ->
                doctorScheduleService.validateDoctorAvailability("Dr. T. Vijayaragavan", bookingTime)
        );
    }

    @Test
    void shouldThrowWhenBookingOutsideStandardDayShift() {
        DoctorSchedule schedule = new DoctorSchedule("Dr. T. Vijayaragavan", "dr.v", "pass",
                "Surgery", true, "08:00", "20:00");
        when(doctorScheduleRepository.findByDoctorName("Dr. T. Vijayaragavan")).thenReturn(Optional.of(schedule));

        // 21:00 is outside 08:00-20:00
        LocalDateTime bookingTime = LocalDateTime.now().plusDays(1).withHour(21).withMinute(0);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                doctorScheduleService.validateDoctorAvailability("Dr. T. Vijayaragavan", bookingTime)
        );
        assertTrue(ex.getMessage().contains("outside this shift"));
    }

    @Test
    void shouldSupportOvernightShiftSpanningMidnight() {
        // Night shift 22:00 to 06:00
        DoctorSchedule schedule = new DoctorSchedule("Dr. John", "dr.john", "pass",
                "Night Care", true, "22:00", "06:00");
        when(doctorScheduleRepository.findByDoctorName("Dr. John")).thenReturn(Optional.of(schedule));

        // 23:30 should be allowed
        LocalDateTime lateNight = LocalDateTime.now().plusDays(1).withHour(23).withMinute(30);
        assertDoesNotThrow(() ->
                doctorScheduleService.validateDoctorAvailability("Dr. John", lateNight)
        );

        // 03:30 AM should be allowed
        LocalDateTime earlyMorning = LocalDateTime.now().plusDays(1).withHour(3).withMinute(30);
        assertDoesNotThrow(() ->
                doctorScheduleService.validateDoctorAvailability("Dr. John", earlyMorning)
        );

        // 12:00 PM noon should be rejected
        LocalDateTime noon = LocalDateTime.now().plusDays(1).withHour(12).withMinute(0);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                doctorScheduleService.validateDoctorAvailability("Dr. John", noon)
        );
        assertTrue(ex.getMessage().contains("outside this shift"));
    }

    @Test
    void shouldRejectWhenDoctorIsOffDuty() {
        DoctorSchedule schedule = new DoctorSchedule("Dr. Kumar", "dr.kumar", "pass",
                "General", false, "09:00", "17:00"); // off duty!
        when(doctorScheduleRepository.findByDoctorName("Dr. Kumar")).thenReturn(Optional.of(schedule));

        LocalDateTime bookingTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                doctorScheduleService.validateDoctorAvailability("Dr. Kumar", bookingTime)
        );
        assertTrue(ex.getMessage().contains("currently off-duty"));
    }
}
