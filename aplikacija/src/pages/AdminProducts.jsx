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

  // ucitaj kategorije
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
    const p = { page, per_page: perPage };
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
        // KEY FIX: Laravel paginate polja su na root-u
        setMeta(body?.meta ?? body ?? null);
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

  
  // Trenutna stranica.
  // Ako backend vrati objekat meta sa poljem current_page, uzmi to.
  // Ako ne (meta je null/undefined), podrazumevaj da smo na 1. strani.
  const curPage = meta?.current_page ?? 1;

  // Ukupan broj stranica (lastPage).
  // Preferiramo vrednost koju backend direktno daje (last_page).
  // Ako je nema, pokušamo da je izračunamo iz total/per_page (npr. 78 ukupno, po 12 na strani -> 7 strana).
  // Ako ni to nemamo, bar vrati 1 (tj. tretiraj kao da nema više strana).
  const lastPage =
    meta?.last_page ??
    (meta?.total && meta?.per_page ? Math.ceil(meta.total / meta.per_page) : 1);

  // Da li postoji PRETHODNA strana?
  // Backend kod Laravel paginate često vraća prev_page_url. Ako postoji, sigurno ima "prethodna".
  // Ako nema prev_page_url, onda bar proverimo da li je current > 1.
  // (Ako si na stranici 1, nemaš gde unazad.)
  const hasPrev = !!(meta?.prev_page_url || (curPage > 1));

  // Da li postoji SLEDEĆA strana?
  // Ako backend da next_page_url — super, ima sledeće.
  // Ako ne, ali znamo lastPage, onda proverimo da li je current < lastPage.
  // (Ako si već na poslednjoj strani, nemaš gde napred.)
  const hasNext = !!(meta?.next_page_url || (lastPage ? curPage < lastPage : false));


  const gotoPage = (p) => {
    if (!meta) return;
    const n = Number(p);
    if (!lastPage || Number.isNaN(lastPage)) {
      if (Number.isFinite(n) && n >= 1) setPage(n);
      return;
    }
    if (Number.isFinite(n) && n >= 1 && n <= lastPage) setPage(n);
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
      // KEY FIX i ovde:
      setMeta(body?.meta ?? body ?? null);
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri brisanju.");
    }
  };

  // === helper za numeričke stranice sa "…"
  // Ideja: uvek prikažemo 1 i last, oko current prikažemo mali prozor (spread),
  // a između delova ubacujemo "…" da ne renderujemo 100+ dugmića.
  const makePages = (current, last, spread = 2) => {
    // Ako nema više strana (last <= 1), nema smisla praviti listu — vrati samo [1].
    if (!last || last <= 1) return [1];

    const out = [];

    // Mini helper: gurni vrednost u niz samo ako nije ista kao poslednja,
    // da ne dobijemo duplikate tipa "..., ..., 10".
    const push = (v) => {
      if (out[out.length - 1] !== v) out.push(v);
    };

    // 1) Uvek prikaži prvu stranu (1).
    push(1);

    // 2) Računaj početak "prozorčića" oko current-a.
    // Ne želimo da padnemo ispod 2 (jer 1 smo već ubacili).
    const start = Math.max(2, current - spread);

    // 3) Ako između "1" i "start" ima rupa (npr. 1 ... 5),
    // ubaci "…" da naznači preskok.
    if (start > 2) push("...");

    // 4) Ubaci brojeve od start do desne granice prozora,
    // ali ne diramo poslednju stranu (last) — nju dodajemo kasnije.
    for (let p = start; p <= Math.min(last - 1, current + spread); p++) {
      push(p);
    }

    // 5) Ako ima rupa između desne ivice prozora i poslednje strane (last),
    // ubaci "…" (npr. ... 15 last).
    if (current + spread < last - 1) push("...");

    // 6) Na kraju uvek prikaži poslednju stranu (last),
    // ali samo ako je > 1 (što već znamo iz prvog return-a).
    if (last > 1) push(last);

    return out;
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

      {meta && (lastPage > 1 || hasPrev || hasNext) && (
        <div className="ap__pag">
          {lastPage > 1 && (
            <button
              className="btn btn--tiny"
              disabled={curPage <= 1}
              onClick={() => gotoPage(1)}
            >
              « Prva
            </button>
          )}

          <button
            className="btn btn--tiny"
            disabled={!hasPrev}
            onClick={() => gotoPage(curPage - 1)}
          >
            ← Prethodna
          </button>

          {lastPage > 1 && makePages(curPage, lastPage, 2).map((p, idx) =>
            p === "..."
              ? <span key={`gap-${idx}`} className="ap__gap">…</span>
              : (
                <button
                  key={p}
                  className={`btn btn--tiny ${p === curPage ? "is-active" : ""}`}
                  disabled={p === curPage}
                  onClick={() => gotoPage(p)}
                >
                  {p}
                </button>
              )
          )}

          <button
            className="btn btn--tiny"
            disabled={!hasNext}
            onClick={() => gotoPage(curPage + 1)}
          >
            Sledeća →
          </button>

          {lastPage > 1 && (
            <button
              className="btn btn--tiny"
              disabled={curPage >= lastPage}
              onClick={() => gotoPage(lastPage)}
            >
              Poslednja »
            </button>
          )}
        </div>
      )}
    </main>
  );
}
