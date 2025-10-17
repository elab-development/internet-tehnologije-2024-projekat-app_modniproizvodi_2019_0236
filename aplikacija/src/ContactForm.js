import React, { useState } from "react";
 
import "./ContactForm.css";
import api from "./api";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    try {
      await api.post("/contact-messages", { name, email, message });
      setStatus("Vaša poruka je uspešno poslata. Hvala!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus(
        err?.response?.data?.message || "Došlo je do greške pri slanju poruke."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-section">
      <div className="form-container">
        <h2>Kontaktirajte nas</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Vaše ime"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Vaša email adresa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <textarea
            placeholder="Vaša poruka"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Slanje..." : "Pošalji"}
          </button>
        </form>

        {status && <p className="form-status">{status}</p>}
      </div>
    </div>
  );
}
