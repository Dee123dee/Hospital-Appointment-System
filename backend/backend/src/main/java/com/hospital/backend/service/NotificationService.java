package com.hospital.backend.service;

import com.hospital.backend.model.Appointment;
import com.hospital.backend.model.Notification;
import com.hospital.backend.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${hospital.mail.from:no-reply@vrhospital.com}")
    private String mailFrom;

    @Value("${hospital.mail.enabled:true}")
    private boolean mailEnabled;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository,
                               @Autowired(required = false) JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    public NotificationService(NotificationRepository notificationRepository) {
        this(notificationRepository, null);
    }

    public void sendBookingConfirmation(Appointment appointment) {
        if (appointment == null) return;

        String formattedDate = formatDateTime(appointment.getAppointmentDate());
        String ref = appointment.getBookingReference() != null ? appointment.getBookingReference() : "N/A";
        String patient = appointment.getPatientName() != null ? appointment.getPatientName() : "Patient";
        String doctor = appointment.getDoctor() != null ? appointment.getDoctor() : "Doctor";

        // 1. Dispatch Email Notification
        String emailSubject = "Appointment Confirmed - " + ref + " | V.R. Hospital";
        String emailBody = "Dear " + patient + ",\n\n"
                + "Your appointment has been successfully booked at V.R. 24/7 Multi-Speciality Hospital.\n\n"
                + "📋 APPOINTMENT DETAILS:\n"
                + "-----------------------------------------\n"
                + "• Booking Reference: " + ref + "\n"
                + "• Doctor: " + doctor + "\n"
                + "• Date & Time: " + formattedDate + "\n"
                + "• Reason: " + (appointment.getReason() != null ? appointment.getReason() : "General Consultation") + "\n"
                + "• Status: CONFIRMED\n"
                + "-----------------------------------------\n\n"
                + "📍 HOSPITAL ADDRESS:\n"
                + "V.R. Hospital, Health City Campus, Ring Road.\n"
                + "24/7 Emergency & Helpdesk: +91 98765 43210 / 044-23456789\n\n"
                + "💡 PATIENT NOTE:\n"
                + "Please arrive 10 minutes before your scheduled slot. You can track or cancel your appointment at any time using your Booking Reference or Phone number on our website.\n\n"
                + "Thank you for choosing V.R. Hospital.";

        saveAndLogNotification(
                appointment.getId(),
                ref,
                appointment.getEmail(),
                appointment.getPhone(),
                "EMAIL",
                "BOOKING_CONFIRMATION",
                emailSubject,
                emailBody
        );

        // 2. Dispatch SMS Notification
        String smsMessage = "V.R. Hospital: Dear " + patient + ", your appointment with " + doctor
                + " on " + formattedDate + " is CONFIRMED. Ref ID: " + ref
                + ". Arrive 10 mins prior. Helpline: 044-23456789";

        saveAndLogNotification(
                appointment.getId(),
                ref,
                appointment.getEmail(),
                appointment.getPhone(),
                "SMS",
                "BOOKING_CONFIRMATION",
                "Booking SMS Alert",
                smsMessage
        );
    }

    public void sendCancellationNotification(Appointment appointment) {
        if (appointment == null) return;

        String formattedDate = formatDateTime(appointment.getAppointmentDate());
        String ref = appointment.getBookingReference() != null ? appointment.getBookingReference() : "N/A";
        String patient = appointment.getPatientName() != null ? appointment.getPatientName() : "Patient";
        String doctor = appointment.getDoctor() != null ? appointment.getDoctor() : "Doctor";

        // 1. Email
        String emailSubject = "Appointment Cancelled - " + ref + " | V.R. Hospital";
        String emailBody = "Dear " + patient + ",\n\n"
                + "This confirms that your appointment with " + doctor + " scheduled for "
                + formattedDate + " (Ref: " + ref + ") has been CANCELLED.\n\n"
                + "The time slot has been released back into the hospital system. If you would like to reschedule or book another slot, please visit our online booking portal anytime 24/7.\n\n"
                + "V.R. Hospital Helpdesk: +91 98765 43210";

        saveAndLogNotification(
                appointment.getId(),
                ref,
                appointment.getEmail(),
                appointment.getPhone(),
                "EMAIL",
                "CANCELLATION",
                emailSubject,
                emailBody
        );

        // 2. SMS
        String smsMessage = "V.R. Hospital: Dear " + patient + ", your appointment Ref " + ref
                + " with " + doctor + " on " + formattedDate + " has been CANCELLED. Slot released. Helpline: 044-23456789";

        saveAndLogNotification(
                appointment.getId(),
                ref,
                appointment.getEmail(),
                appointment.getPhone(),
                "SMS",
                "CANCELLATION",
                "Cancellation SMS Alert",
                smsMessage
        );
    }

    public void sendStatusUpdateNotification(Appointment appointment, String newStatus) {
        if (appointment == null) return;

        String formattedDate = formatDateTime(appointment.getAppointmentDate());
        String ref = appointment.getBookingReference() != null ? appointment.getBookingReference() : "N/A";
        String patient = appointment.getPatientName() != null ? appointment.getPatientName() : "Patient";
        String doctor = appointment.getDoctor() != null ? appointment.getDoctor() : "Doctor";

        String emailSubject = "Appointment Status Updated: " + newStatus + " (" + ref + ") | V.R. Hospital";
        String emailBody = "Dear " + patient + ",\n\n"
                + "The status of your appointment with " + doctor + " on " + formattedDate
                + " (Ref: " + ref + ") has been updated to: " + newStatus + ".\n\n"
                + "For any questions, please contact V.R. Hospital Support at +91 98765 43210.";

        saveAndLogNotification(
                appointment.getId(),
                ref,
                appointment.getEmail(),
                appointment.getPhone(),
                "EMAIL",
                "STATUS_UPDATE",
                emailSubject,
                emailBody
        );

        String smsMessage = "V.R. Hospital: Dear " + patient + ", your appointment Ref " + ref
                + " status is now " + newStatus + ". For support, call 044-23456789.";

        saveAndLogNotification(
                appointment.getId(),
                ref,
                appointment.getEmail(),
                appointment.getPhone(),
                "SMS",
                "STATUS_UPDATE",
                "Status Update SMS",
                smsMessage
        );
    }

    public List<Notification> getNotificationsByAppointment(String appointmentId) {
        return notificationRepository.findByAppointmentIdOrderBySentAtDesc(appointmentId);
    }

    public List<Notification> getNotificationsByReference(String bookingReference) {
        return notificationRepository.findByBookingReferenceOrderBySentAtDesc(bookingReference);
    }

    public List<Notification> getNotificationsByPhone(String phone) {
        return notificationRepository.findByRecipientPhoneOrderBySentAtDesc(phone);
    }

    public List<Notification> getRecentNotifications() {
        return notificationRepository.findTop50ByOrderBySentAtDesc();
    }

    private void saveAndLogNotification(String appointmentId,
                                        String bookingReference,
                                        String recipientEmail,
                                        String recipientPhone,
                                        String channel,
                                        String type,
                                        String subject,
                                        String message) {
        Notification notification = new Notification();
        notification.setAppointmentId(appointmentId);
        notification.setBookingReference(bookingReference);
        notification.setRecipientEmail(recipientEmail);
        notification.setRecipientPhone(recipientPhone);
        notification.setChannel(channel);
        notification.setType(type);
        notification.setSubject(subject);
        notification.setMessage(message);
        notification.setSentAt(LocalDateTime.now());

        String status = "SENT";

        if ("EMAIL".equalsIgnoreCase(channel)) {
            status = dispatchEmail(recipientEmail, bookingReference, subject, message);
        } else {
            // SMS channel (logged / simulated)
            log.info("DISPATCHED [{}] to [{}] (Ref: {}): {}",
                    channel,
                    recipientPhone,
                    bookingReference,
                    subject);
        }

        notification.setStatus(status);

        try {
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to persist notification: {}", e.getMessage(), e);
        }
    }

    private String dispatchEmail(String recipientEmail, String bookingReference, String subject, String message) {
        if (!mailEnabled) {
            log.info("EMAIL DISABLED: Notification skipped for [{}] (Ref: {}): {}", recipientEmail, bookingReference, subject);
            return "SKIPPED";
        }

        boolean hasCredentials = mailUsername != null && !mailUsername.trim().isEmpty();
        if (mailSender == null || !hasCredentials) {
            log.info("DISPATCHED [EMAIL - SIMULATED] to [{}] (Ref: {}): {} [To send real emails to inboxes, set MAIL_USERNAME and MAIL_PASSWORD in application.properties]",
                    recipientEmail, bookingReference, subject);
            return "SENT";
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            String fromAddress = (mailFrom != null && !mailFrom.trim().isEmpty()) ? mailFrom : mailUsername;
            mailMessage.setFrom(fromAddress);
            mailMessage.setTo(recipientEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);

            mailSender.send(mailMessage);
            log.info("DISPATCHED [EMAIL - REAL SMTP] to [{}] (Ref: {}): {}", recipientEmail, bookingReference, subject);
            return "SENT";
        } catch (Exception e) {
            log.error("FAILED to send real email to [{}] (Ref: {}): {}. Make sure your email and App Password are valid in application.properties or environment.",
                    recipientEmail, bookingReference, e.getMessage());
            return "FAILED";
        }
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        try {
            return dateTime.format(DISPLAY_FORMATTER);
        } catch (Exception e) {
            return dateTime.toString();
        }
    }
}
