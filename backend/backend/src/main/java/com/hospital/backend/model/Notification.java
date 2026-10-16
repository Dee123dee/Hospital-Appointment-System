package com.hospital.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "appointment_id")
    private String appointmentId;

    @Column(name = "booking_reference")
    private String bookingReference;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    // "EMAIL" or "SMS"
    @Column(name = "channel", length = 20)
    private String channel;

    // "BOOKING_CONFIRMATION", "CANCELLATION", "STATUS_UPDATE"
    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "subject")
    private String subject;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    // "SENT" or "SIMULATED"
    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;
}
