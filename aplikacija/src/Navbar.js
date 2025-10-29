import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // + useNavigate
import "./Navbar.css";

export default function Navbar({ currentUser, logoutUser, cartCount = 0 }) {
  const { pathname } = useLocation();
  const navigate = useNavigate(); // init
  const role = String(currentUser?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const isLoggedUser = !!currentUser && !isAdmin;
  const isGuest = !currentUser;

  const handleLogout = () => {
    logoutUser();                         // očisti state (i localStorage kroz useEffect u App)
    navigate("/login", { replace: true }); // redirect na /login + izbaci iz history-ja
  };

  return (
    <header className="nav-wrap">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="brand">Shop</Link>

          {isGuest && (
            <>
              <Link to="/contact" className={pathname.startsWith("/contact") ? "active" : ""}>Kontakt</Link>
              <Link to="/login" className={pathname.startsWith("/login") ? "active" : ""}>Login</Link>
              <Link to="/register" className={pathname.startsWith("/register") ? "active" : ""}>Register</Link>
            </>
          )}

          {isLoggedUser && (
            <Link to="/proizvodi" className={pathname.startsWith("/proizvodi") ? "active" : ""}>Proizvodi</Link>
          )}

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
          {isLoggedUser && (
            <>
              <span className="hello">Zdravo, {currentUser.name || "korisnik"}</span>
              <Link to="/korpa" className={`cart-link ${pathname.startsWith("/korpa") ? "active" : ""}`} aria-label="Korpa">
                🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <button className="link-btn" onClick={handleLogout}>Odjava</button> {/* <- ovde */}
            </>
          )}

          {isAdmin && (
            <>
              <span className="hello">
                Zdravo, {currentUser.name || "admin"} <span className="role-badge">admin</span>
              </span>
              <button className="link-btn" onClick={handleLogout}>Odjava</button> {/* <- ovde */}
            </>
          )}
        </div>
      </nav>
      <div className="nav-spacer" />
    </header>
  );
}
