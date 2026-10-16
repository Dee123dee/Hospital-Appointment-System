package com.hospital.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "doctor_schedules")
public class DoctorSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "specialty")
    private String specialty;

    @Column(name = "available", nullable = false)
    private boolean available = true;

    // 24-hour format string, e.g. "09:00" or "20:00"
    @Column(name = "shift_start", nullable = false, length = 10)
    private String shiftStart = "09:00";

    // 24-hour format string, e.g. "17:00" or "04:00" (overnight support)
    @Column(name = "shift_end", nullable = false, length = 10)
    private String shiftEnd = "17:00";

    public DoctorSchedule() {
    }

    public DoctorSchedule(String doctorName, String username, String password, String specialty,
                          boolean available, String shiftStart, String shiftEnd) {
        this.doctorName = doctorName;
        this.username = username;
        this.password = password;
        this.specialty = specialty;
        this.available = available;
        this.shiftStart = shiftStart;
        this.shiftEnd = shiftEnd;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getShiftStart() {
        return shiftStart;
    }

    public void setShiftStart(String shiftStart) {
        this.shiftStart = shiftStart;
    }

    public String getShiftEnd() {
        return shiftEnd;
    }

    public void setShiftEnd(String shiftEnd) {
        this.shiftEnd = shiftEnd;
    }
}
