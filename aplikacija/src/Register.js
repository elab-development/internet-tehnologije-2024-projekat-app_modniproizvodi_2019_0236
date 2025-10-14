 
import React, { useState } from 'react';
import './ContactForm.css';  
import { useNavigate } from 'react-router-dom';

function Register({ addUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  let navigate= useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { username, password, email };
    addUser(newUser);
    // Resetiranje forme
    setUsername('');
    setPassword('');
    setEmail('');
    navigate("/login")
  };

  return (
    <div className="contact-form-section">
      <div className="form-container">
        <h2>Registracija</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Korisničko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email adresa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Registriraj se</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
