import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctorLogin } from "../services/doctorService";
import "../styles/form.css";

function DoctorLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const doctor = await doctorLogin(username, password);
      localStorage.setItem("doctorUser", JSON.stringify(doctor));
      navigate("/doctor-dashboard");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Invalid doctor credentials ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <form className="appointment-form" onSubmit={handleLogin}>
        <h2>Doctor Portal Login</h2>
        <p style={{ textAlign: "center", color: "#718096", marginTop: "-10px", marginBottom: "20px" }}>
          V.R. Hospital 24/7 Shift Management
        </p>

        {errorMsg && (
          <div style={{ padding: "10px", background: "#fed7d7", color: "#9b2c2c", borderRadius: "6px", marginBottom: "15px", fontSize: "14px" }}>
            {errorMsg}
          </div>
        )}

        <div className="form-group">
          <label>Doctor Username</label>
          <input
            placeholder="e.g. dr.vijayaragavan, dr.kumar, dr.john"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="submit-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login to Doctor Dashboard"}
        </button>
      </form>
    </div>
  );
}

export default DoctorLogin;
