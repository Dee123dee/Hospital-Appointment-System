package com.hospital.backend.repository;

import com.hospital.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    List<Appointment> findByDoctorAndStatusNotAndAppointmentDateBetween(String doctor, String status, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByDoctorAndAppointmentDateBetween(String doctor, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByDoctor(String doctor);

    List<Appointment> findByPhone(String phone);

    Optional<Appointment> findByBookingReference(String bookingReference);

    Optional<Appointment> findByReferenceId(String referenceId);

    boolean existsByReferenceId(String referenceId);

    boolean existsByBookingReference(String bookingReference);
}
