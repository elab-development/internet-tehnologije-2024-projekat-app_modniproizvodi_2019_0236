import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ currentUser, logoutUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
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
            <li><Link to="/korpa">Korpa </Link></li> 

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
