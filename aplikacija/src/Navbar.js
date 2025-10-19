import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ currentUser, logoutUser, cartCount = 0 }) {
  const { pathname } = useLocation();
  const role = String(currentUser?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const isLoggedUser = !!currentUser && !isAdmin; // ulogovan ali nije admin
  const isGuest = !currentUser;

  return (
    <header className="nav-wrap">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="brand">Shop</Link>

          {/* Neulogovan: samo Kontakt */}
          {isGuest && (
            <Link
              to="/contact"
              className={pathname.startsWith("/contact") ? "active" : ""}
            >
              Kontakt
            </Link>
          )}

          {/* Ulogovan korisnik (ne-admin): Proizvodi */}
          {isLoggedUser && (
            <Link
              to="/proizvodi"
              className={pathname.startsWith("/proizvodi") ? "active" : ""}
            >
              Proizvodi
            </Link>
          )}

          {/* Admin: samo admin rute */}
          {isAdmin && (
            <>
              <Link to="/admin" className={pathname === "/admin" ? "active" : ""}>
                Admin
              </Link>
              <Link
                to="/admin/products"
                className={pathname.startsWith("/admin/products") ? "active" : ""}
              >
                Proizvodi (A)
              </Link>
              <Link
                to="/admin/poruke"
                className={pathname.startsWith("/admin/poruke") ? "active" : ""}
              >
                Poruke (A)
              </Link>
              <Link
                to="/admin/orders"
                className={pathname.startsWith("/admin/orders") ? "active" : ""}
              >
                Orders (A)
              </Link>
            </>
          )}
        </div>

        <div className="nav-right">
          {/* Ulogovan korisnik (ne-admin): Korpa + pozdrav + Odjava */}
          {isLoggedUser && (
            <>
              <span className="hello">
                Zdravo, {currentUser.name || "korisnik"}
              </span>
              <Link
                to="/korpa"
                className={`cart-link ${pathname.startsWith("/korpa") ? "active" : ""}`}
                aria-label="Korpa"
              >
                🛒
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <button className="link-btn" onClick={logoutUser}>Odjava</button>
            </>
          )}

          {/* Admin: pozdrav + badge + Odjava (nema korpe / javnih ruta) */}
          {isAdmin && (
            <>
              <span className="hello">
                Zdravo, {currentUser.name || "admin"} <span className="role-badge">admin</span>
              </span>
              <button className="link-btn" onClick={logoutUser}>Odjava</button>
            </>
          )}

          {/* Neulogovan: nema login/register po zahtevu (samo Kontakt u levom delu) */}
        </div>
      </nav>
      <div className="nav-spacer" />
    </header>
  );
}
