import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ currentUser, logoutUser, cartCount = 0 }) {
  const { pathname } = useLocation();
  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin";

  return (
    <header className="nav-wrap">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="brand">Shop</Link>
          <Link to="/proizvodi" className={pathname.startsWith("/proizvodi") ? "active" : ""}>Proizvodi</Link>
          <Link to="/contact" className={pathname.startsWith("/contact") ? "active" : ""}>Kontakt</Link>

          {/* ADMIN meni samo za admina */}
          {isAdmin && (
            <>
              <Link to="/admin" className={pathname === "/admin" ? "active" : ""}>Admin</Link>
              <Link to="/admin/products" className={pathname.startsWith("/admin/products") ? "active" : ""}>Proizvodi (A)</Link>
              <Link to="/admin/poruke" className={pathname.startsWith("/admin/poruke") ? "active" : ""}>Poruke (A)</Link>
              <Link to="/admin/orders" className={pathname.startsWith("/admin/orders") ? "active" : ""}>Orders (A)</Link>
            </>
          )}
        </div>

        <div className="nav-right">
          {currentUser ? (
            <>
              <span className="hello">
                Zdravo, {currentUser.name || "korisnik"}
                {isAdmin && <span className="role-badge">admin</span>}
              </span>
              <button className="link-btn" onClick={logoutUser}>Odjava</button>
            </>
          ) : (
            <>
              <Link to="/login" className={pathname.startsWith("/login") ? "active" : ""}>Prijava</Link>
              <Link to="/register" className={pathname.startsWith("/register") ? "active" : ""}>Registracija</Link>
            </>
          )}

          <Link to="/korpa" className={`cart-link ${pathname.startsWith("/korpa") ? "active" : ""}`} aria-label="Korpa">
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </nav>
      <div className="nav-spacer" />
    </header>
  );
}
