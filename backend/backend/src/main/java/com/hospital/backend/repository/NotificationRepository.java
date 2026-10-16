package com.hospital.backend.repository;

import com.hospital.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByAppointmentIdOrderBySentAtDesc(String appointmentId);

    List<Notification> findByBookingReferenceOrderBySentAtDesc(String bookingReference);

    List<Notification> findByRecipientPhoneOrderBySentAtDesc(String recipientPhone);

    List<Notification> findTop50ByOrderBySentAtDesc();
}
