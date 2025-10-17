import React, { useState } from "react";
import "./ContactForm.css";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "./api";

function Login({ onAuth }) {
  const [identifier, setIdentifier] = useState("Test");
  const [password, setPassword] = useState("TestTest123");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/login", { identifier, password });

      // token + user
      setAuthToken(data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      if (typeof onAuth === "function") onAuth(data.user);

      const role = (data.user?.role || "").toLowerCase();
      navigate(role === "admin" ? "/admin" : "/proizvodi");

      setIdentifier("");
      setPassword("");
    } catch (err) {
      alert(err?.response?.data?.message || "Neuspešna prijava.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-section">
      <div className="form-container">
        <h2>Prijava</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email ili korisničko ime"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Prijava..." : "Prijava"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
