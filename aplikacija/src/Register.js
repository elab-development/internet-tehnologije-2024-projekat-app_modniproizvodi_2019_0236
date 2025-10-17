import React, { useState } from "react";
import "./ContactForm.css";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      alert("Lozinka i potvrda lozinke nisu iste.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/register", {
        name,
        username,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      // nakon uspešne registracije vodi na login
      alert("Uspešna registracija. Prijavite se.");
      navigate("/login");

      // reset forme (opciono)
      setName(""); setUsername(""); setEmail("");
      setPassword(""); setPasswordConfirmation("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
        "Registracija neuspešna.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-section">
      <div className="form-container">
        <h2>Registracija</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Ime i prezime" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Korisničko ime" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email adresa" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Lozinka (min 8, mix slova/brojevi)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Potvrdi lozinku" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? "Kreiram..." : "Registruj se"}</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
