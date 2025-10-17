import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ currentUser, logoutUser, cartCount = 0 }) {
  const { pathname } = useLocation();
  return (
    <header className="nav-wrap">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="brand">Shop</Link>
          <Link to="/proizvodi" className={pathname.startsWith("/proizvodi") ? "active" : ""}>Proizvodi</Link>
          <Link to="/contact" className={pathname.startsWith("/contact") ? "active" : ""}>Kontakt</Link>
        </div>

        <div className="nav-right">
          {currentUser ? (
            <>
              <span className="hello">Zdravo, {currentUser.name || "korisnik"}</span>
              <button className="link-btn" onClick={logoutUser}>Odjava</button>
            </>
          ) : (
            <>
              <Link to="/login">Prijava</Link>
              <Link to="/register">Registracija</Link>
            </>
          )}

          <Link to="/korpa" className="cart-link" aria-label="Korpa">
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </nav>
      {/* spacer da sadržaj ne ide ispod navbar-a */}
      <div className="nav-spacer" />
    </header>
  );
}
