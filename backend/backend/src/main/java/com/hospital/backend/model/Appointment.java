package com.hospital.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    private String patientName;
    private String email;
    private String phone;
    private String doctor;
    private LocalDateTime appointmentDate;
    private String reason;

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

    public String getId() {
        return id;
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
}
