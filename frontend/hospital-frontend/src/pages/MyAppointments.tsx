import { useState } from "react";
import {
  lookupAppointments,
  cancelAppointment,
  getNotificationsByReference,
  type Appointment,
  type NotificationItem,
} from "../services/appointmentService";
import "../styles/form.css";
import "../styles/doctor.css";

function MyAppointments() {
  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [selectedApptForNotifs, setSelectedApptForNotifs] = useState<Appointment | null>(null);
  const [notifModalList, setNotifModalList] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const handleViewNotifs = async (appt: Appointment) => {
    setSelectedApptForNotifs(appt);
    setLoadingNotifs(true);
    setNotifModalList([]);
    try {
      const ref = appt.bookingReference || appt.id || "";
      const list = await getNotificationsByReference(ref);
      setNotifModalList(list);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setActionMessage("");

    try {
      const data = await lookupAppointments(query.trim());
      setAppointments(data);
      if (data.length === 0) {
        setErrorMsg("No appointments found for the provided Phone Number or Reference ID.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to search appointments. Please verify the details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string, ref?: string) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel appointment ${ref || id}? This will free up the time slot.`
    );
    if (!confirmCancel) return;

    try {
      await cancelAppointment(id);
      setActionMessage(`✅ Appointment ${ref || ""} was cancelled successfully. The time slot is now freed.`);
      // Refresh list
      const data = await lookupAppointments(query.trim());
      setAppointments(data);
    } catch (err: any) {
      console.error(err);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = status || "CONFIRMED";
    if (s === "CONFIRMED") {
      return <span className="doctor-badge badge-active">CONFIRMED</span>;
    }
    if (s === "COMPLETED") {
      return (
        <span
          className="doctor-badge"
          style={{ backgroundColor: "#bee3f8", color: "#2b6cb0" }}
        >
          COMPLETED
        </span>
      );
    }
    return <span className="doctor-badge badge-inactive">CANCELLED</span>;
  };

  return (
    <div className="form-page" style={{ maxWidth: "800px", margin: "30px auto", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#1a365d", marginBottom: "8px" }}>Track & Manage Appointments</h1>
        <p style={{ color: "#718096" }}>
          Look up your scheduled visits using your <strong>10-digit Phone Number</strong> or <strong>Booking Reference ID</strong>.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px",
          background: "#ffffff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <input
          type="text"
          placeholder="Enter 10-digit Phone or Booking ID (e.g. VRH-12345)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          required
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #cbd5e0",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
          style={{ width: "auto", padding: "12px 24px", marginTop: 0 }}
        >
          {loading ? "Searching..." : "Find Bookings"}
        </button>
      </form>

      {actionMessage && (
        <div
          style={{
            padding: "14px",
            background: "#c6f6d5",
            color: "#22543d",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: 500,
          }}
        >
          {actionMessage}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: "14px",
            background: "#fed7d7",
            color: "#9b2c2c",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Results List */}
      {appointments && appointments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {appointments.map(appt => (
            <div
              key={appt.id}
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                  gap: "10px",
                }}
              >
                <div>
                  <span
                    style={{
                      background: "#edf2f7",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#4a5568",
                    }}
                  >
                    REF: {appt.bookingReference || appt.id}
                  </span>
                  <span style={{ marginLeft: "10px" }}>{getStatusBadge(appt.status)}</span>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={() => handleViewNotifs(appt)}
                    style={{
                      backgroundColor: "#ebf8ff",
                      color: "#2b6cb0",
                      border: "1px solid #bee3f8",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    📬 Notifications
                  </button>

                  {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                    <button
                      onClick={() => handleCancel(appt.id!, appt.bookingReference)}
                      style={{
                        backgroundColor: "#fff",
                        color: "#e53e3e",
                        border: "1px solid #e53e3e",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  color: "#2d3748",
                  fontSize: "15px",
                }}
              >
                <div>
                  <strong>Doctor:</strong> {appt.doctor}
                </div>
                <div>
                  <strong>Date & Time:</strong>{" "}
                  {appt.appointmentDate
                    ? new Date(appt.appointmentDate).toLocaleString()
                    : "-"}
                </div>
                <div>
                  <strong>Patient:</strong> {appt.patientName}
                </div>
                <div>
                  <strong>Reason:</strong> {appt.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications Modal */}
      {selectedApptForNotifs && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setSelectedApptForNotifs(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, color: "#1a365d" }}>
                📬 Dispatched Notifications
              </h3>
              <button
                onClick={() => setSelectedApptForNotifs(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#718096",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "14px", color: "#4a5568", marginBottom: "16px" }}>
              Tracking alerts sent for <strong>Ref: {selectedApptForNotifs.bookingReference || selectedApptForNotifs.id}</strong> (Patient: {selectedApptForNotifs.patientName})
            </div>

            {loadingNotifs ? (
              <p style={{ textAlign: "center", color: "#718096" }}>Loading notification messages...</p>
            ) : notifModalList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", background: "#f7fafc", borderRadius: "8px" }}>
                <p style={{ margin: 0, color: "#718096" }}>No notifications logged for this reference yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {notifModalList.map((notif, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "12px",
                      background: notif.type === "CANCELLATION" ? "#fff5f5" : "#f7fafc",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "bold", fontSize: "13px", color: notif.channel === "EMAIL" ? "#3182ce" : "#d69e2e" }}>
                        {notif.channel === "EMAIL" ? "📧 EMAIL" : "📱 SMS"} → {notif.channel === "EMAIL" ? notif.recipientEmail : notif.recipientPhone}
                      </span>
                      <span style={{ fontSize: "12px", color: "#a0aec0" }}>
                        {new Date(notif.sentAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: notif.type === "CANCELLATION" ? "#c53030" : "#2d3748", marginBottom: "6px" }}>
                      {notif.subject}
                    </div>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        fontFamily: "inherit",
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        padding: "10px",
                        borderRadius: "6px",
                        margin: 0,
                        fontSize: "12px",
                        color: "#2d3748",
                      }}
                    >
                      {notif.message}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAppointments;
