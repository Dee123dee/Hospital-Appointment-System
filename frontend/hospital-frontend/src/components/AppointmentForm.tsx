import {
  createAppointment,
  getDoctorAvailableHours,
  getSlotsForHour,
  getNotificationsByReference,
  type AvailableHour,
  type TimeSlot,
  type NotificationItem,
} from "../services/appointmentService";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/form.css";

const AppointmentForm = () => {
  const location = useLocation();

  const isFromDiseasePage = Boolean(location.state?.reason);

  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    doctor: "",
    appointmentDate: "",
    reason: "",
  });

  // Progressive slot selection state
  const [selectedDate, setSelectedDate] = useState("");
  const [availableHours, setAvailableHours] = useState<AvailableHour[]>([]);
  const [selectedHour, setSelectedHour] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotTime, setSelectedSlotTime] = useState("");
  const [loadingHours, setLoadingHours] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hoursError, setHoursError] = useState("");

  const [successInfo, setSuccessInfo] = useState<{
    reference: string;
    patientName: string;
    doctor: string;
    date: string;
    email: string;
    phone: string;
  } | null>(null);

  const [notifList, setNotifList] = useState<NotificationItem[]>([]);
  const [showNotifPreview, setShowNotifPreview] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Minimum selectable date is today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];

  /* ===== Auto-fill ONLY if coming from Disease page ===== */
  useEffect(() => {
    if (location.state) {
      setFormData(prev => ({
        ...prev,
        doctor: location.state?.doctor ?? "",
        reason: location.state?.reason ?? "",
      }));
    }
  }, [location.state]);

  /* ===== Fetch Hours when Doctor & Date change ===== */
  useEffect(() => {
    setSelectedHour("");
    setSelectedSlotTime("");
    setSlots([]);
    setFormData(prev => ({ ...prev, appointmentDate: "" }));
    setHoursError("");

    if (!formData.doctor || !selectedDate) {
      setAvailableHours([]);
      return;
    }

    const fetchHours = async () => {
      setLoadingHours(true);
      try {
        const hours = await getDoctorAvailableHours(formData.doctor, selectedDate);
        setAvailableHours(hours);
        if (hours.length === 0) {
          setHoursError("No working hours available for this doctor on the selected date.");
        }
      } catch (err) {
        console.error("Failed to fetch available hours", err);
        setHoursError("Could not load working hours. Please try again.");
      } finally {
        setLoadingHours(false);
      }
    };

    fetchHours();
  }, [formData.doctor, selectedDate]);

  /* ===== Fetch 6 10-minute slots when Hour is selected ===== */
  useEffect(() => {
    setSelectedSlotTime("");
    setFormData(prev => ({ ...prev, appointmentDate: "" }));

    if (!formData.doctor || !selectedDate || !selectedHour) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const result = await getSlotsForHour(
          formData.doctor,
          selectedDate,
          Number(selectedHour)
        );
        setSlots(result);
      } catch (err) {
        console.error("Failed to fetch slots", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [formData.doctor, selectedDate, selectedHour]);

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlotTime(slot.time);
    // Format full ISO-like string: YYYY-MM-DDTHH:MM:00
    const fullDateTime = `${selectedDate}T${slot.time}:00`;
    setFormData(prev => ({
      ...prev,
      appointmentDate: fullDateTime,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      alert("Phone number must be 10 digits");
      return;
    }

    if (!formData.appointmentDate) {
      alert("Please select an available appointment time slot.");
      return;
    }

    if (new Date(formData.appointmentDate) <= new Date()) {
      alert("Appointment date must be in the future");
      return;
    }

    try {
      const created = await createAppointment(formData);
      const bookedRef = created.bookingReference || "VRH-BOOKED";
      setSuccessInfo({
        reference: bookedRef,
        patientName: created.patientName,
        doctor: created.doctor,
        date: created.appointmentDate,
        email: formData.email,
        phone: formData.phone,
      });

      // Reset form
      setFormData({
        patientName: "",
        email: "",
        phone: "",
        doctor: "",
        appointmentDate: "",
        reason: "",
      });
      setSelectedDate("");
      setSelectedHour("");
      setSelectedSlotTime("");
      setSlots([]);
      setShowNotifPreview(false);
    } catch (error: any) {
      console.error(error);
      const message =
        error.response?.data?.message || "Failed to book appointment ❌";
      alert(message);
    }
  };

  const handleLoadNotifs = async () => {
    if (!successInfo?.reference) return;
    setLoadingNotifs(true);
    try {
      const notifs = await getNotificationsByReference(successInfo.reference);
      setNotifList(notifs);
      setShowNotifPreview(true);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  return (
    <div className="form-page">
      {successInfo ? (
        <div
          className="appointment-form"
          style={{ textAlign: "center", padding: "30px", maxWidth: "600px" }}
        >
          <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
          <h2 style={{ color: "#22543d" }}>Appointment Booked!</h2>
          <p style={{ color: "#4a5568", marginBottom: "16px" }}>
            Your appointment has been confirmed. Please save your Reference ID.
          </p>

          <div
            style={{
              background: "#ebf8ff",
              border: "2px dashed #3182ce",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#2b6cb0", fontWeight: 600 }}>
              BOOKING REFERENCE ID
            </span>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2b6cb0", margin: "6px 0" }}>
              {successInfo.reference}
            </div>
            <small style={{ color: "#718096" }}>
              Use this Reference ID or your Phone Number in <strong>My Appointments</strong> to track or cancel.
            </small>
          </div>

          {/* Live Notification Delivery Status Pills */}
          <div
            style={{
              background: "#f0fff4",
              border: "1px solid #9ae6b4",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 600, color: "#22543d", marginBottom: "6px", fontSize: "14px" }}>
              🚀 Automated Notifications Dispatched:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#276749" }}>
                <span>📧</span>
                <span><strong>Confirmation Email:</strong> Dispatched to <code>{successInfo.email}</code></span>
                <span style={{ marginLeft: "auto", background: "#38a169", color: "#fff", fontSize: "11px", padding: "2px 6px", borderRadius: "4px" }}>SENT</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#276749" }}>
                <span>📱</span>
                <span><strong>Confirmation SMS:</strong> Dispatched to <code>{successInfo.phone}</code></span>
                <span style={{ marginLeft: "auto", background: "#38a169", color: "#fff", fontSize: "11px", padding: "2px 6px", borderRadius: "4px" }}>SENT</span>
              </div>
            </div>

            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <button
                type="button"
                onClick={handleLoadNotifs}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#2b6cb0",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {loadingNotifs ? "Loading preview..." : showNotifPreview ? "Refresh Messages" : "📬 Preview Dispatched Messages"}
              </button>
            </div>
          </div>

          {/* Expandable Notification Messages Preview */}
          {showNotifPreview && (
            <div
              style={{
                textAlign: "left",
                background: "#f7fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "14px",
                marginBottom: "16px",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <strong style={{ color: "#2d3748" }}>Dispatched Messages Log</strong>
                <button
                  type="button"
                  onClick={() => setShowNotifPreview(false)}
                  style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", fontSize: "12px" }}
                >
                  ✕ Close
                </button>
              </div>

              {notifList.length === 0 ? (
                <p style={{ color: "#718096" }}>No messages recorded yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {notifList.map((n, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" }}>
                        <span style={{ fontWeight: "bold", color: n.channel === "EMAIL" ? "#3182ce" : "#d69e2e" }}>
                          {n.channel === "EMAIL" ? "📧 EMAIL" : "📱 SMS"} → {n.channel === "EMAIL" ? n.recipientEmail : n.recipientPhone}
                        </span>
                        <span style={{ color: "#a0aec0" }}>
                          {new Date(n.sentAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, color: "#4a5568", marginBottom: "4px" }}>
                        {n.subject}
                      </div>
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                          background: "#edf2f7",
                          padding: "8px",
                          borderRadius: "4px",
                          color: "#2d3748",
                          margin: 0,
                          fontSize: "12px",
                        }}
                      >
                        {n.message}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ textAlign: "left", background: "#f7fafc", padding: "15px", borderRadius: "8px", marginBottom: "20px", fontSize: "15px" }}>
            <p><strong>Patient:</strong> {successInfo.patientName}</p>
            <p><strong>Doctor:</strong> {successInfo.doctor}</p>
            <p><strong>Date & Time:</strong> {new Date(successInfo.date).toLocaleString()}</p>
          </div>

          <button
            className="submit-btn"
            onClick={() => setSuccessInfo(null)}
          >
            Book Another Appointment
          </button>
        </div>
      ) : (
      <form className="appointment-form" onSubmit={handleSubmit}>
        <h2>Book an Appointment</h2>

        <div className="form-group">
          <label>Patient Name</label>
          <input
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength={10}
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div className="form-group">
          <label>Doctor</label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            disabled={isFromDiseasePage}
            required
          >
            <option value="">Select Doctor</option>
            <option value="Dr. Kumar">Dr. Kumar (General Medicine - Day Shift 09:00 - 17:00)</option>
            <option value="Dr. Priya">Dr. Priya (Pediatrics - Afternoon Shift 14:00 - 22:00)</option>
            <option value="Dr. John">Dr. John (Emergency Care - Night Shift 22:00 - 06:00)</option>
            <option value="Dr. T. Vijayaragavan">Dr. T. Vijayaragavan (General Surgery - 24/7 Available)</option>
          </select>
        </div>

        {/* ===== STEP 1: DATE & HOUR SELECTION ===== */}
        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            name="appointmentDateOnly"
            value={selectedDate}
            min={todayStr}
            onChange={e => setSelectedDate(e.target.value)}
            required
          />
        </div>

        {formData.doctor && selectedDate && (
          <div className="form-group">
            <label>Step 1: Choose Hour (Doctor Working Hours)</label>
            {loadingHours ? (
              <div className="slot-loading">Checking doctor availability...</div>
            ) : hoursError ? (
              <div className="slot-warning">{hoursError}</div>
            ) : (
              <select
                value={selectedHour}
                onChange={e => setSelectedHour(e.target.value)}
                required
              >
                <option value="">-- Choose an Hour --</option>
                {availableHours.map(h => (
                  <option key={h.hour} value={h.hour}>
                    {h.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* ===== STEP 2: 10-MINUTE TIME SLOTS ===== */}
        {selectedHour && (
          <div className="form-group">
            <label>Step 2: Choose 10-Minute Slot ({availableHours.find(h => h.hour === selectedHour)?.label})</label>
            {loadingSlots ? (
              <div className="slot-loading">Loading 10-minute slots...</div>
            ) : (
              <div className="slots-grid">
                {slots.map(slot => {
                  const isSelected = selectedSlotTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      className={`slot-pill ${
                        isSelected
                          ? "selected"
                          : slot.available
                          ? "available"
                          : "unavailable"
                      }`}
                      onClick={() => handleSlotSelect(slot)}
                      title={slot.reason}
                    >
                      <span className="slot-time">{slot.label}</span>
                      <span className="slot-status">
                        {isSelected
                          ? "✓ Selected"
                          : slot.available
                          ? "Available"
                          : slot.reason}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedSlotTime && (
              <div className="slot-confirmed-note">
                Selected: <strong>{selectedDate}</strong> at <strong>{slots.find(s => s.time === selectedSlotTime)?.label}</strong>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Reason</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            readOnly={isFromDiseasePage}
            placeholder={
              isFromDiseasePage
                ? "Auto-filled from selected disease"
                : "Enter reason for appointment"
            }
            required
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={!formData.appointmentDate}
        >
          Confirm Appointment
        </button>
      </form>
      )}
    </div>
  );
};

export default AppointmentForm;

