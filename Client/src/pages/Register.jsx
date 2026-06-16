import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("Customer");
  const [loading, setLoading] = useState(false);
  const { showNotification, API_BASE } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, usertype })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("Account registered! Please login.");
        navigate("/login");
      } else {
        showNotification(data.message || "Registration failed", "error");
      }
    } catch (err) {
      showNotification("Server error, please try again", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle} className="animate-fade-in">
      <div className="card" style={cardStyle}>
        <h2 style={titleStyle}>Register</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              required
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              required
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              placeholder="Choose password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>User type</label>
            <select
              value={usertype}
              onChange={(e) => setUsertype(e.target.value)}
              style={selectStyle}
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={buttonStyle}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={footerTextStyle}>
          Already registered? <Link to="/login" style={linkStyle}>Login</Link>
        </p>
      </div>
    </div>
  );
}

// Styling (matches Login screen)
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh",
  padding: "40px 20px"
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "40px 32px",
  boxShadow: "var(--shadow-lg)",
  borderRadius: "var(--radius-lg)"
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "32px",
  fontSize: "2rem",
  fontWeight: "800",
  letterSpacing: "-0.5px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const labelStyle = {
  fontWeight: "600",
  fontSize: "0.85rem",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  transition: "var(--transition)",
  fontSize: "0.95rem"
};

const selectStyle = {
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--light-border)",
  outline: "none",
  background: "#fff",
  fontSize: "0.95rem"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  fontSize: "1rem"
};

const footerTextStyle = {
  textAlign: "center",
  marginTop: "24px",
  fontSize: "0.9rem",
  color: "var(--text-muted)"
};

const linkStyle = {
  color: "var(--primary)",
  fontWeight: "600"
};
