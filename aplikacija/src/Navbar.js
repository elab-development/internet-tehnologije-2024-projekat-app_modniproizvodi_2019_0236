import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import api, { clearAuthToken } from './api';

function Navbar({ currentUser, logoutUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout'); // token je već u headeru
    } catch (e) {
      // ako token istekne/401, svejedno čistimo stanje
      // console.warn(e);
    }
    // očisti localStorage i axios header
    localStorage.removeItem('currentUser');
    clearAuthToken();

    // očisti App state ako je prosleđen handler
    if (typeof logoutUser === 'function') logoutUser();

    navigate('/');
  };

  return (
    <nav className="navbar">
      <h2 className="logo">Modna Oaza</h2>
      <ul className="nav-links">
        <li><Link to="/">Početna</Link></li>
        <li><Link to="/contact">Kontakt</Link></li>
        {currentUser ? (
          <>
            <li><Link to="/proizvodi">Proizvodi</Link></li>
            <li><Link to="/korpa">Korpa</Link></li>
            <li><button className="logout-btn" onClick={handleLogout}>Odjavi se</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Prijava</Link></li>
            <li><Link to="/register">Registracija</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
