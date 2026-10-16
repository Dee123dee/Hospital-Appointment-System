package com.hospital.backend.service;

import com.hospital.backend.model.Appointment;
import com.hospital.backend.model.Notification;
import com.hospital.backend.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private JavaMailSender mailSender;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository, mailSender);
        ReflectionTestUtils.setField(notificationService, "mailEnabled", true);
        ReflectionTestUtils.setField(notificationService, "mailFrom", "hospital@vrhospital.com");
    }

    private Appointment createTestAppointment() {
        Appointment appointment = new Appointment();
        appointment.setId("app-123");
        appointment.setBookingReference("VRH-99999");
        appointment.setPatientName("John Doe");
        appointment.setEmail("john@example.com");
        appointment.setPhone("9876543210");
        appointment.setDoctor("Dr. Smith");
        appointment.setAppointmentDate(LocalDateTime.of(2026, 9, 20, 10, 30));
        appointment.setReason("Routine Checkup");
        return appointment;
    }

    @Test
    void sendBookingConfirmation_WhenCredentialsPresent_SendsRealMail() {
        ReflectionTestUtils.setField(notificationService, "mailUsername", "admin@vrhospital.com");

        Appointment appointment = createTestAppointment();
        notificationService.sendBookingConfirmation(appointment);

        ArgumentCaptor<SimpleMailMessage> mailCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(mailCaptor.capture());

        SimpleMailMessage sentMail = mailCaptor.getValue();
        assertEquals("john@example.com", sentMail.getTo()[0]);
        assertTrue(sentMail.getSubject().contains("V.R. Hospital"));
        assertTrue(sentMail.getText().contains("V.R. 24/7 Multi-Speciality Hospital"));

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(2)).save(notifCaptor.capture()); // 1 email + 1 SMS

        Notification emailNotif = notifCaptor.getAllValues().stream()
                .filter(n -> "EMAIL".equals(n.getChannel()))
                .findFirst()
                .orElseThrow();
        assertEquals("SENT", emailNotif.getStatus());
    }

    @Test
    void sendBookingConfirmation_WhenMailSenderFails_MarksNotificationAsFailedGracefully() {
        ReflectionTestUtils.setField(notificationService, "mailUsername", "admin@vrhospital.com");
        doThrow(new MailSendException("SMTP connection refused")).when(mailSender).send(any(SimpleMailMessage.class));

        Appointment appointment = createTestAppointment();
        assertDoesNotThrow(() -> notificationService.sendBookingConfirmation(appointment));

        ArgumentCaptor<Notification> notifCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(2)).save(notifCaptor.capture());

        Notification emailNotif = notifCaptor.getAllValues().stream()
                .filter(n -> "EMAIL".equals(n.getChannel()))
                .findFirst()
                .orElseThrow();
        assertEquals("FAILED", emailNotif.getStatus());
    }

    @Test
    void sendBookingConfirmation_WhenCredentialsMissing_SimulatesGracefully() {
        ReflectionTestUtils.setField(notificationService, "mailUsername", "");

        Appointment appointment = createTestAppointment();
        notificationService.sendBookingConfirmation(appointment);

        verify(mailSender, never()).send(any(SimpleMailMessage.class));
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }
}
