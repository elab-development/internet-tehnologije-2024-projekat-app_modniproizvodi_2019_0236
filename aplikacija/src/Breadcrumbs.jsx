import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

const LABELS = {
  "": "Početna",
  contact: "Kontakt",
  login: "Prijava",
  register: "Registracija",
  proizvodi: "Proizvodi",
  korpa: "Korpa",
  admin: "Admin",
  poruke: "Poruke",
  products: "Proizvodi",
  new: "Novi",
  edit: "Izmena",
};

function prettify(seg) {
 
  const s = decodeURIComponent(seg);
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function segmentLabel(seg, i, parts) {
  if (LABELS.hasOwnProperty(seg)) return LABELS[seg];

 
  if (/^\d+$/.test(seg)) {
    if (parts[i - 1] === "products") return `#${seg}`;
    return `#${seg}`;
  }

  return prettify(seg);
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();

  // napravi segmente
  const parts = pathname.split("/").filter(Boolean); // npr: ["admin","products","123","edit"]

  // Ako si na /, prikaži samo "Početna"
  const crumbs = parts.length === 0 ? [""] : parts;

  return (
    <nav className="bc">
      <ol className="bc__list">
        {/* Home crumb */}
        <li className="bc__item">
          {parts.length ? (
            <Link to="/" className="bc__link">{LABELS[""]}</Link>
          ) : (
            <span className="bc__cur">{LABELS[""]}</span>
          )}
        </li>

        {crumbs.map((seg, i) => {
          // preskoči prazno (početnu) jer je gore dodata
          if (!seg) return null;

          const href = "/" + parts.slice(0, i + 1).join("/");
          const isLast = i === parts.length - 1;
          const label = segmentLabel(seg, i, parts);

          return (
            <li key={href} className="bc__item">
              <span className="bc__sep">›</span>
              {isLast ? (
                <span className="bc__cur">{label}</span>
              ) : (
                <Link to={href} className="bc__link">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
