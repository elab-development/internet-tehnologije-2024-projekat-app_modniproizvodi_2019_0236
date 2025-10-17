import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
 
import "./admin-products.css";
import api from "../api";

const resolveImageUrl = (p) => !p ? "" : (p.startsWith("http") ? p : `/storage/${p}`);

export default function AdminProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true); setErr("");
      try {
        const r = await api.get(`/products/${id}`, { signal: ctrl.signal });
        const body = r?.data ?? r;
        setP(body);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          setErr("Greška pri učitavanju.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  return (
    <main className="ap admin-page">
      <Link to="/admin/products" className="ap__back">← Nazad</Link>
      <h2 className="ap__title">Detalj proizvoda</h2>
      {loading && <div className="note">Učitavanje…</div>}
      {err && <div className="note">{err}</div>}
      {!loading && !err && p && (
        <section className="ap-card">
          <div className="ap-card__gallery">
            {p.image ? (
              <img src={resolveImageUrl(p.image)} alt={p.name} />
            ) : (
              <div className="ap-thumb ap-thumb--empty ap-thumb--lg">Bez slike</div>
            )}
          </div>
          <div className="ap-card__info">
            <h3>{p.name}</h3>
            <div className="ap-meta">
              <span className="badge">{p.category?.name ?? "—"}</span>
              <span className={`badge ${p.is_active ? "ok" : "muted"}`}>
                {p.is_active ? "Aktivan" : "Sakriven"}
              </span>
              <span className="badge">SKU: {p.sku ?? "—"}</span>
            </div>
            <p className="ap-desc">{p.description || "—"}</p>
            <div className="ap-stats">
              <div><strong>Cena:</strong> {Number(p.price).toFixed(2)} RSD</div>
              <div><strong>Zaliha:</strong> {p.stock ?? 0}</div>
            </div>
            <div className="ap__formActions">
              <Link className="btn" to={`/admin/products/${p.id}/edit`}>Izmeni</Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
