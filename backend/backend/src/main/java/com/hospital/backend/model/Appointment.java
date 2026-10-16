package com.hospital.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @NotBlank(message = "Patient name is required")
    @Size(min = 2, max = 100, message = "Patient name must be between 2 and 100 characters")
    @Column(name = "patient_name", nullable = false, length = 100)
    private String patientName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(name = "email", nullable = false)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be a valid 10-digit number")
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @NotBlank(message = "Doctor is required")
    @Column(name = "doctor", nullable = false)
    private String doctor;

    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "CONFIRMED"; // CONFIRMED, COMPLETED, CANCELLED

    @Column(name = "booking_reference", length = 30)
    private String bookingReference;

    @Column(name = "reference_id", nullable = false, unique = true, length = 30)
    private String referenceId;

    public Appointment() {
    }

    public Appointment(String patientName, String email, String phone,
                       String doctor, LocalDateTime appointmentDate, String reason) {
        this.patientName = patientName;
        this.email = email;
        this.phone = phone;
        this.doctor = doctor;
        this.appointmentDate = appointmentDate;
        this.reason = reason;
    }

    @PrePersist
    @PreUpdate
    public void ensureReferenceId() {
        if (this.bookingReference != null && (this.referenceId == null || this.referenceId.trim().isEmpty())) {
            this.referenceId = this.bookingReference;
        } else if (this.referenceId != null && (this.bookingReference == null || this.bookingReference.trim().isEmpty())) {
            this.bookingReference = this.referenceId;
        } else if (this.referenceId == null && this.bookingReference == null) {
            String generated = String.format("VRH-%05d", new java.util.Random().nextInt(100000));
            this.referenceId = generated;
            this.bookingReference = generated;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDoctor() {
        return doctor;
    }

    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDateTime appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
        if (this.referenceId == null || this.referenceId.trim().isEmpty()) {
            this.referenceId = bookingReference;
        }
    }

    public String getReferenceId() {
        return referenceId != null ? referenceId : bookingReference;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
        if (this.bookingReference == null || this.bookingReference.trim().isEmpty()) {
            this.bookingReference = referenceId;
        }
    }
}
