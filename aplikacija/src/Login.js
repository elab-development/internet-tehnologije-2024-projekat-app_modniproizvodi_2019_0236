 
import React, { useState } from 'react';
import './ContactForm.css';  
import { useNavigate } from 'react-router-dom';

function Login({ loginUser }) {
  const [username, setUsername] = useState('wildroses12');
  const [password, setPassword] = useState('wildroses12');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = loginUser(username, password);
    if (success) {
      // Resetiranje forme
      setUsername('');
      setPassword('');
      navigate('/proizvodi'); 
    } else {
      alert('Neispravno korisničko ime ili lozinka.');
    }
  };

  return (
    <div className="contact-form-section">
      <div className="form-container">
        <h2>Prijavite se</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Korisničko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Prijava</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
