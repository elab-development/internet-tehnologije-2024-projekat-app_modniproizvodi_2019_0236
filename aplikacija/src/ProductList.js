import React, { useEffect, useMemo, useState } from "react";
import "./ProductList.css";
import api from "./api"; // tvoj axios instance

export default function ProductList({ addToCart }) {
  // filteri
  const [q, setQ] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState(""); // "price_asc" | "price_desc"
  const [onlyActive] = useState(true);

  // paginacija
  const [page, setPage] = useState(1);
  const perPage = 12;

  // podaci
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState("");

  const params = useMemo(() => {
    const p = { page, per_page: perPage, only_active: onlyActive ? 1 : 0 };
    if (q) p.q = q;
    if (priceMin) p.price_min = priceMin;
    if (priceMax) p.price_max = priceMax;
    if (sort) p.sort = sort;
    return p;
  }, [page, perPage, q, priceMin, priceMax, sort, onlyActive]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true); setErr("");
      try {
        const r = await api.get("/products", { params, signal: ctrl.signal });
        const body = r?.data ?? r;
        setProducts(Array.isArray(body?.data) ? body.data : []);
        setMeta(body?.meta ?? null);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") setErr("Greška pri učitavanju proizvoda.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [params]);

  const resetFilters = () => {
    setQ(""); setPriceMin(""); setPriceMax(""); setSort(""); setPage(1);
  };

  const canPrev = meta?.current_page > 1;
  const canNext = meta && meta.current_page < meta.last_page;

  const imageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/600x400?text=No+Image";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/storage")) return img;
    return `/storage/${img}`;
  };

  return (
    <div className="product-list">
      <h2>Naši proizvodi</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Pretraži proizvode..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <input
          type="number" min="0" step="0.01"
          placeholder="Min cena"
          value={priceMin}
          onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
        />
        <input
          type="number" min="0" step="0.01"
          placeholder="Max cena"
          value={priceMax}
          onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
        />
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          <option value="">Sortiraj</option>
          <option value="price_asc">Cena: od najniže</option>
          <option value="price_desc">Cena: od najviše</option>
        </select>
        <button type="button" onClick={resetFilters}>Resetuj filtere</button>
      </div>

      {loading && <p>Učitavanje...</p>}
      {error && <p className="error">{error}</p>}

      <div className="product-grid">
        {products.map((p) => (
          <div className="product-card" key={p.id}>
            <img src={imageUrl(p.image_url || p.image)} alt={p.name} />
            <h3 title={p.name}>{p.name}</h3>
            {p.category?.name && <span className="badge">{p.category.name}</span>}
            {p.description && <p className="desc">{p.description}</p>}
            <p className="price">{Number(p.price).toFixed(2)} €</p>
            <button className="buy-btn" onClick={() => addToCart(p)}>Dodaj u korpu</button>
          </div>
        ))}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <button disabled={!canPrev} onClick={() => canPrev && setPage(page - 1)}>‹ Prethodna</button>
          <span>Strana {meta.current_page} / {meta.last_page}</span>
          <button disabled={!canNext} onClick={() => canNext && setPage(page + 1)}>Sledeća ›</button>
        </div>
      )}
    </div>
  );
}
