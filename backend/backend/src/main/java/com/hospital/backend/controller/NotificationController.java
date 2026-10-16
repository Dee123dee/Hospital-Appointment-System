package com.hospital.backend.controller;

import com.hospital.backend.model.Notification;
import com.hospital.backend.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/appointment/{appointmentId}")
    public List<Notification> getNotificationsByAppointment(@PathVariable String appointmentId) {
        return notificationService.getNotificationsByAppointment(appointmentId);
    }

    @GetMapping("/reference/{reference}")
    public List<Notification> getNotificationsByReference(@PathVariable String reference) {
        return notificationService.getNotificationsByReference(reference.trim().toUpperCase());
    }

    @GetMapping("/phone/{phone}")
    public List<Notification> getNotificationsByPhone(@PathVariable String phone) {
        return notificationService.getNotificationsByPhone(phone.trim());
    }

    @GetMapping("/recent")
    public List<Notification> getRecentNotifications() {
        return notificationService.getRecentNotifications();
    }
}
