import React, { useEffect, useMemo, useState } from "react";
import "./ProductList.css";
import api from "./api"; // tvoj axios instance

const FX_ENDPOINT = "https://open.er-api.com/v6/latest/EUR"; // besplatan, bez ključa
const FX_CACHE_KEY = "fx_EUR_cache_v1";
const FX_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const CURRENCY_OPTIONS = ["EUR", "RSD", "USD", "GBP", "CHF"];

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

  // podaci proizvoda
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState("");

  // FX
  const [rates, setRates] = useState({ EUR: 1 });
  const [fxLoading, setFxLoading] = useState(false);
  const [fxErr, setFxErr] = useState("");
  const [fxUpdatedAt, setFxUpdatedAt] = useState("");
  const [currency, setCurrency] = useState(() => localStorage.getItem("currency") || "EUR");

  // params za proizvode
  const params = useMemo(() => {
    const p = { page, per_page: perPage, only_active: onlyActive ? 1 : 0 };
    if (q) p.q = q;
    if (priceMin) p.price_min = priceMin;
    if (priceMax) p.price_max = priceMax;
    if (sort) p.sort = sort;
    return p;
  }, [page, perPage, q, priceMin, priceMax, sort, onlyActive]);

  // učitaj proizvode
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await api.get("/products", { params, signal: ctrl.signal });
        const body = r?.data ?? r;
        setProducts(Array.isArray(body?.data) ? body.data : []);
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

  // učitaj FX (sa kešom 12h)
  useEffect(() => {
    const fromCache = (() => {
      try {
        const raw = localStorage.getItem(FX_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts > FX_TTL_MS) return null;
        return parsed.data;
      } catch {
        return null;
      }
    })();

    if (fromCache?.rates) {
      setRates({ EUR: 1, ...fromCache.rates });
      setFxUpdatedAt(fromCache.time_last_update_utc || "");
      return;
    }

    const ctrl = new AbortController();
    (async () => {
      setFxLoading(true);
      setFxErr("");
      try {
        const r = await fetch(FX_ENDPOINT, { signal: ctrl.signal });
        const json = await r.json();
        if (json?.result !== "success" || !json?.rates) {
          throw new Error("FX API error");
        }
        setRates({ EUR: 1, ...json.rates });
        setFxUpdatedAt(json.time_last_update_utc || "");
        localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: json }));
      } catch (e) {
        if (e.name !== "AbortError") {
          setFxErr("Nije moguće učitati kursnu listu. Cene su prikazane u EUR.");
        }
      } finally {
        setFxLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, []);

  // persist izabrana valuta
  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const resetFilters = () => {
    setQ("");
    setPriceMin("");
    setPriceMax("");
    setSort("");
    setPage(1);
  };

  const canPrev = meta?.current_page > 1;
  const canNext = meta && meta.current_page < meta.last_page;

  const imageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/600x400?text=No+Image";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/storage")) return img;
    return `/storage/${img}`;
  };

  // format i konverzija
  const fmt = (n, cur) =>
    new Intl.NumberFormat(cur === "RSD" ? "sr-RS" : undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 2,
    }).format(Number(n || 0));

  const convert = (amountEUR, cur) => {
    if (!amountEUR || !cur || !rates) return Number(amountEUR || 0);
    if (cur === "EUR") return Number(amountEUR);
    const rate = rates[cur];
    if (!rate || typeof rate !== "number") return Number(amountEUR);
    return Number(amountEUR) * rate;
  };

  // filtriraj listu valuta na opcije koje zaista postoje u rates
  const currencyOptions = CURRENCY_OPTIONS.filter((c) => c === "EUR" || rates[c]);

  return (
    <div className="product-list">
      <div className="pl-head">
        <h2>Naši proizvodi</h2>

        <div className="fx-box">
          <label className="fx-lbl">Valuta</label>
          <select
            className="fx-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencyOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {fxLoading && <span className="fx-note">Učitavam kurseve…</span>}
          {!fxLoading && fxErr && <span className="fx-note fx-err">{fxErr}</span>}
          {!fxLoading && !fxErr && fxUpdatedAt && (
            <span className="fx-note">Ažurirano: {fxUpdatedAt.replace(" UTC", "")}</span>
          )}
        </div>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Pretraži proizvode..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <input
          type="number" min="0" step="0.01"
          placeholder="Min cena (EUR)"
          value={priceMin}
          onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
        />
        <input
          type="number" min="0" step="0.01"
          placeholder="Max cena (EUR)"
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
        {products.map((p) => {
          const eurPrice = Number(p.price);
          const showPrice = convert(eurPrice, currency);
          return (
            <div className="product-card" key={p.id}>
              <img src={imageUrl(p.image_url || p.image)} alt={p.name} />
              <h3 title={p.name}>{p.name}</h3>
              {p.category?.name && <span className="badge">{p.category.name}</span>}
              {p.description && <p className="desc">{p.description}</p>}
              <p className="price">
                {fmt(showPrice, currency)}
                {currency !== "EUR" && (
                  <small className="price-eur"> ({fmt(eurPrice, "EUR")})</small>
                )}
              </p>
              <button className="buy-btn" onClick={() => addToCart(p)}>Dodaj u korpu</button>
            </div>
          );
        })}
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
