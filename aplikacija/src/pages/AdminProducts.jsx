import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
 
import "./admin-products.css";
import api from "../api";

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // init iz URL-a
  const initPage = parseInt(searchParams.get("page") || "1", 10) || 1;
  const initPer = parseInt(searchParams.get("per_page") || "12", 10) || 12;

  // filteri
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("category_id") || "");
  const [onlyActive, setOnlyActive] = useState(searchParams.get("only_active") === "1");
  const [priceMin, setPriceMin] = useState(searchParams.get("price_min") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("price_max") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [perPage, setPerPage] = useState(initPer);
  const [page, setPage] = useState(initPage);

  // podaci
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [cats, setCats] = useState([]);

  // ucitaj kategorije (pretpostavka: /api/categories vraća [{id,name}...])
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/categories");
        const body = r?.data ?? r;
        setCats(body?.data ?? body ?? []);
      } catch {
        setCats([]);
      }
    })();
  }, []);

  // sync URL
  useEffect(() => {
    const next = { page: String(page), per_page: String(perPage) };
    if (q) next.q = q;
    if (categoryId) next.category_id = categoryId;
    if (onlyActive) next.only_active = "1";
    if (priceMin) next.price_min = priceMin;
    if (priceMax) next.price_max = priceMax;
    if (sort) next.sort = sort;
    setSearchParams(next, { replace: true });
  }, [q, categoryId, onlyActive, priceMin, priceMax, sort, page, perPage, setSearchParams]);

  const params = useMemo(() => {
    const p = {
      page, per_page: perPage,
    };
    if (q) p.q = q;
    if (categoryId) p.category_id = categoryId;
    if (onlyActive) p.only_active = 1;
    if (priceMin) p.price_min = priceMin;
    if (priceMax) p.price_max = priceMax;
    if (sort) p.sort = sort; // price_asc | price_desc
    return p;
  }, [q, categoryId, onlyActive, priceMin, priceMax, sort, page, perPage]);

  // ucitaj proizvode
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true); setErr("");
      try {
        const r = await api.get("/products", { params, signal: ctrl.signal });
        const body = r?.data ?? r;
        setItems(Array.isArray(body?.data) ? body.data : []);
        setMeta(body?.meta ?? null);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          setErr("Greška pri učitavanju proizvoda.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [params]);

  const clearFilters = () => {
    setQ("");
    setCategoryId("");
    setOnlyActive(false);
    setPriceMin("");
    setPriceMax("");
    setSort("");
    setPerPage(12);
    setPage(1);
  };

  const gotoPage = (p) => {
    if (!meta) return;
    const n = Number(p);
    if (Number.isFinite(n) && n >= 1 && n <= meta.last_page) setPage(n);
  };

  const resolveImg = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `/storage/${path}`;
  };

  const removeItem = async (row) => {
    if (!window.confirm(`Obrisati proizvod "${row.name}"?`)) return;
    try {
      await api.delete(`/products/${row.id}`);
      // osveži
      const r = await api.get("/products", { params });
      const body = r?.data ?? r;
      setItems(Array.isArray(body?.data) ? body.data : []);
      setMeta(body?.meta ?? null);
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri brisanju.");
    }
  };

  return (
    <main className="ap admin-page">
      <header className="ap__head">
        <h2>Proizvodi</h2>
        <button className="btn btn--primary" onClick={() => navigate("/admin/products/new")}>
          + Novi proizvod
        </button>
      </header>

      <section className="ap__filters">
        <input
          className="ap__input"
          placeholder="Pretraga (naziv, opis, SKU)"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <select
          className="ap__input"
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
        >
          <option value="">Sve kategorije</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input
          className="ap__input"
          type="number" min="0" step="0.01"
          placeholder="Cena od"
          value={priceMin}
          onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
        />
        <input
          className="ap__input"
          type="number" min="0" step="0.01"
          placeholder="Cena do"
          value={priceMax}
          onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
        />
        <select
          className="ap__input"
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
        >
          <option value="">Bez sortiranja</option>
          <option value="price_asc">Cena rastuće</option>
          <option value="price_desc">Cena opadajuće</option>
        </select>

        <label className="ap__check">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => { setOnlyActive(e.target.checked); setPage(1); }}
          />
          Samo aktivni
        </label>

        <div className="ap__spacer" />
        <button className="btn" onClick={clearFilters}>Reset</button>
      </section>

      {loading && <div className="note">Učitavanje…</div>}
      {err && <div className="note">{err}</div>}

      <div className="ap__tablewrap">
        <table className="ap-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Slika</th>
              <th>Naziv</th>
              <th>Kategorija</th>
              <th className="ta-right">Cena</th>
              <th className="ta-right">Zaliha</th>
              <th>SKU</th>
              <th>Status</th>
              <th className="ta-center">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={9} className="ap__empty">Nema proizvoda.</td></tr>
            ) : items.map((p, i) => (
              <tr key={p.id}>
                <td>{(meta?.from ?? 1) + i}</td>
                <td>
                  {p.image_url ? (
                    <img className="ap-thumb" src={resolveImg(p.image_url)} alt={p.name} />
                  ) : <div className="ap-thumb ap-thumb--empty">—</div>}
                </td>
                <td>
                  <Link className="link" to={`/admin/products/${p.id}`}>{p.name}</Link>
                  <div className="ap-sub">{p.description?.slice(0, 80)}{p.description?.length > 80 ? "…" : ""}</div>
                </td>
                <td>{p.category?.name ?? "—"}</td>
                <td className="ta-right">{Number(p.price).toFixed(2)} RSD</td>
                <td className="ta-right">{p.stock ?? 0}</td>
                <td>{p.sku ?? "—"}</td>
                <td>
                  <span className={`badge ${p.is_active ? "ok" : "muted"}`}>
                    {p.is_active ? "Aktivan" : "Sakriven"}
                  </span>
                </td>
                <td className="ta-center">
                  <Link className="btn btn--tiny" to={`/admin/products/${p.id}/edit`}>Izmeni</Link>{" "}
                  <button className="btn btn--tiny btn--danger" onClick={() => removeItem(p)}>Obriši</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="ap__pag">
          <button className="btn btn--tiny"
            disabled={meta.current_page <= 1}
            onClick={() => gotoPage(meta.current_page - 1)}
          >← Prethodna</button>
          <span>Strana {meta.current_page} / {meta.last_page}</span>
          <button className="btn btn--tiny"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => gotoPage(meta.current_page + 1)}
          >Sledeća →</button>
        </div>
      )}
    </main>
  );
}
