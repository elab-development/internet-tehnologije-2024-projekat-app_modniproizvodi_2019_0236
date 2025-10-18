import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";
import "./admin-products.css"; // koristimo postojeći stil

const statusOptions = [
  { value: "", label: "Svi statusi" },
  { value: "pending", label: "Na čekanju" },
  { value: "paid", label: "Plaćeno" },
  { value: "cancelled", label: "Otkazano" },
];

const statusBadgeClass = (s) => {
  if (!s) return "badge";
  if (s === "paid") return "badge ok";
  if (s === "cancelled") return "badge danger";
  return "badge warn"; // pending
};

const fmtMoney = (n) => (Number(n || 0)).toFixed(2) + " RSD";
const fmtDate = (s) => {
  try { return new Date(s).toLocaleString(); } catch { return s ?? "—"; }
};

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();

  // init from URL
  const initPage = parseInt(searchParams.get("page") || "1", 10) || 1;
  const initPer = parseInt(searchParams.get("per_page") || "15", 10) || 15;

  // filters
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [perPage, setPerPage] = useState(initPer);
  const [page, setPage] = useState(initPage);

  // data
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [savingId, setSavingId] = useState(null);

  // sync URL
  useEffect(() => {
    const next = { page: String(page), per_page: String(perPage) };
    if (q) next.q = q;
    if (status) next.status = status;
    setSearchParams(next, { replace: true });
  }, [q, status, page, perPage, setSearchParams]);

  const params = useMemo(() => {
    const p = { page, per_page: perPage };
    if (q) p.q = q;               // pretraga po imenu/email/telefonu/ID
    if (status) p.status = status;
    return p;
  }, [q, status, page, perPage]);

  // load orders
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true); setErr("");
      try {
        const r = await api.get("/orders", { params, signal: ctrl.signal });
        const body = r?.data ?? r;
        setItems(Array.isArray(body?.data) ? body.data : []);
        setMeta(body?.meta ?? null);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          setErr("Greška pri učitavanju porudžbina.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [params]);

  const clearFilters = () => {
    setQ("");
    setStatus("");
    setPerPage(15);
    setPage(1);
  };

  const gotoPage = (p) => {
    if (!meta) return;
    const n = Number(p);
    if (Number.isFinite(n) && n >= 1 && n <= meta.last_page) setPage(n);
  };

  const removeOrder = async (row) => {
    if (!window.confirm(`Obrisati porudžbinu #${row.id}?`)) return;
    try {
      await api.delete(`/orders/${row.id}`);
      // refresh
      const r = await api.get("/orders", { params });
      const body = r?.data ?? r;
      setItems(Array.isArray(body?.data) ? body.data : []);
      setMeta(body?.meta ?? null);
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri brisanju.");
    }
  };

  const updateStatus = async (row, newStatus) => {
    try {
      setSavingId(row.id);
      await api.patch(`/orders/${row.id}/status`, { status: newStatus });
      // optimističko ažuriranje
      setItems((prev) => prev.map(o => o.id === row.id ? { ...o, status: newStatus } : o));
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri promeni statusa.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="ap admin-page">
      <header className="ap__head">
        <h2>Porudžbine</h2>
        <div className="ap__head__meta">
          {meta ? <span>Ukupno: {meta.total}</span> : null}
        </div>
      </header>

      <section className="ap__filters">
        <input
          className="ap__input"
          placeholder="Pretraga (kupac, email, telefon ili ID)"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <select
          className="ap__input"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

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
              <th>ID</th>
              <th>Datum</th>
              <th>Kupac</th>
              <th>Stavke</th>
              <th className="ta-right">Ukupno</th>
              <th>Status</th>
              <th className="ta-center">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={8} className="ap__empty">Nema porudžbina.</td></tr>
            ) : items.map((o, i) => {
              const idx = (meta?.from ?? 1) + i;
              const itemsCount = Array.isArray(o.items) ? o.items.reduce((n, it) => n + (it.quantity || 0), 0) : 0;
              const preview = Array.isArray(o.items)
                ? o.items.slice(0, 2).map(it => `${it.name} × ${it.quantity}`).join(", ")
                : "";
              const extra = Array.isArray(o.items) && o.items.length > 2 ? ` +${o.items.length - 2}` : "";
              return (
                <tr key={o.id}>
                  <td>{idx}</td>
                  <td>#{o.id}</td>
                  <td>{fmtDate(o.created_at)}</td>
                  <td>
                    <div>{o.customer_name || "—"}</div>
                    <div className="ap-sub">
                      {(o.customer_email || "—")}{o.customer_phone ? ` · ${o.customer_phone}` : ""}
                    </div>
                  </td>
                  <td>
                    <div>{preview}{extra}</div>
                    <div className="ap-sub">{itemsCount} kom.</div>
                  </td>
                  <td className="ta-right">{fmtMoney(o.total_price)}</td>
                  <td>
                    <span className={statusBadgeClass(o.status)}>{o.status || "—"}</span>
                  </td>
                  <td className="ta-center">
                    {/* ako kasnije dodaš detaljnu stranu: <Link className="btn btn--tiny" to={`/admin/orders/${o.id}`}>Detalji</Link>{" "} */}
                    <select
                      className="ap__input ap__input--tiny"
                      value={o.status || "pending"}
                      disabled={savingId === o.id}
                      onChange={(e) => updateStatus(o, e.target.value)}
                      style={{ minWidth: 130 }}
                    >
                      {statusOptions.filter(x => x.value).map(x => (
                        <option key={x.value} value={x.value}>{x.label}</option>
                      ))}
                    </select>{" "}
                    <button
                      className="btn btn--tiny btn--danger"
                      disabled={savingId === o.id}
                      onClick={() => removeOrder(o)}
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              );
            })}
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
