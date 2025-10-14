 

import React, { useState } from 'react';
import './ContactForm.css';

function ContactForm({ addMessage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMessage = { name, email, message };
    addMessage(newMessage);
 
    setName('');
    setEmail('');
    setMessage('');
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
          />
          <input
            type="email"
            placeholder="Vaša email adresa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            placeholder="Vaša poruka"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <button type="submit">Pošalji</button>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
