import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // SIMPLE DEMO AUTH (enough for project)
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      navigate("/admin");
    } else {
      alert("Invalid admin credentials ❌");
    }
  };

  return (
    <div className="form-page">
      <form className="appointment-form" onSubmit={handleLogin}>
        <h2>Admin Login</h2>

        <div className="form-group">
          <label>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="submit-btn">Login</button>
      </form>
    </div>
  );
}

export default AdminLogin;
