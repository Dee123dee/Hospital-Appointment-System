package com.hospital.backend.repository;

import com.hospital.backend.model.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, String> {

    Optional<DoctorSchedule> findByUsername(String username);

    Optional<DoctorSchedule> findByDoctorName(String doctorName);
}
