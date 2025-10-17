import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import "./AdminMessages.css";

export default function AdminMessages() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [q, setQ] = useState("");
  const [processed, setProcessed] = useState(""); // "", "1", "0"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null); // za modal detalja

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("per_page", perPage);
    p.set("page", page);
    if (q) p.set("q", q);
    if (processed !== "") p.set("processed", processed);
    return p.toString();
  }, [perPage, page, q, processed]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/contact-messages?${params}`);
      const payload = res.data;
      setItems(payload.data ?? payload);
      setMeta(payload.meta ?? null);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri učitavanju poruka.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const toggleProcessed = async (msg) => {
    try {
      await api.patch(`/contact-messages/${msg.id}/process`, {
        processed: !msg.processed,
      });
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri promeni statusa.");
    }
  };

  const removeMsg = async (msg) => {
    if (!window.confirm("Obrisati poruku?")) return;
    try {
      await api.delete(`/contact-messages/${msg.id}`);
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || "Greška pri brisanju.");
    }
  };

  const canPrev = meta?.current_page > 1;
  const canNext = meta && meta.current_page < meta.last_page;

  return (
    <div className="admin-messages-section">
      <div className="admin-overlay" />
      <div className="admin-box">
        <div className="admin-header">
          <h2>Kontakt poruke</h2>
          <div className="filters">
            <input
              type="text"
              placeholder="Pretraga (ime, email, poruka)"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
            <select
              value={processed}
              onChange={(e) => {
                setPage(1);
                setProcessed(e.target.value);
              }}
            >
              <option value="">Sve</option>
              <option value="0">Neobrađene</option>
              <option value="1">Obrađene</option>
            </select>
            <button className="clear-btn" onClick={() => {
              setQ("");
              setProcessed("");
              setPage(1);
            }}>
              Reset
            </button>
          </div>
        </div>

        {loading && <p className="hint">Učitavanje…</p>}
        {error && <p className="error">{error}</p>}

        <div className="table">
          <div className="thead">
            <div>ID</div>
            <div>Ime</div>
            <div>Email</div>
            <div>Poruka</div>
            <div>Status</div>
            <div>Akcije</div>
          </div>
          <div className="tbody">
            {items.map((m) => (
              <div className="trow" key={m.id}>
                <div>#{m.id}</div>
                <div title={m.name}>{m.name}</div>
                <div title={m.email}>{m.email}</div>
                <div className="msg-cell" title={m.message}>
                  {m.message?.slice(0, 60) || ""}{m.message?.length > 60 ? "…" : ""}
                </div>
                <div>
                  <span className={`badge ${m.processed ? "ok" : "pending"}`}>
                    {m.processed ? "Obrađena" : "Neobrađena"}
                  </span>
                </div>
                <div className="actions">
                  <button className="secondary" onClick={() => setSelected(m)}>
                    Detalji
                  </button>
                  <button className="primary" onClick={() => toggleProcessed(m)}>
                    {m.processed ? "Označi neobrađ." : "Označi obrađ."}
                  </button>
                  <button className="danger" onClick={() => removeMsg(m)}>
                    Obriši
                  </button>
                </div>
              </div>
            ))}
            {!loading && items.length === 0 && (
              <div className="empty">Nema poruka za prikaz.</div>
            )}
          </div>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="pagination">
            <button disabled={!canPrev} onClick={() => canPrev && setPage(page - 1)}>
              ‹ Prethodna
            </button>
            <span>Strana {meta.current_page} / {meta.last_page}</span>
            <button disabled={!canNext} onClick={() => canNext && setPage(page + 1)}>
              Sledeća ›
            </button>
          </div>
        )}
      </div>

      {/* Modal detalja */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Poruka #{selected.id}</h3>
            <div className="kv">
              <strong>Ime:</strong> <span>{selected.name}</span>
            </div>
            <div className="kv">
              <strong>Email:</strong> <span>{selected.email}</span>
            </div>
            <div className="kv">
              <strong>Status:</strong>{" "}
              <span className={`badge ${selected.processed ? "ok" : "pending"}`}>
                {selected.processed ? "Obrađena" : "Neobrađena"}
              </span>
            </div>
            <div className="kv">
              <strong>Kreirano:</strong>{" "}
              <span>{selected.created_at ?? "—"}</span>
            </div>
            <div className="kv">
              <strong>Obrađeno:</strong>{" "}
              <span>{selected.processed_at ?? "—"}</span>
            </div>

            <div className="message-full">
              <strong>Poruka</strong>
              <p>{selected.message}</p>
            </div>

            <div className="modal-actions">
              <button className="primary" onClick={() => toggleProcessed(selected)}>
                {selected.processed ? "Označi neobrađ." : "Označi obrađ."}
              </button>
              <button className="danger" onClick={() => { removeMsg(selected); setSelected(null); }}>
                Obriši
              </button>
              <button onClick={() => setSelected(null)}>Zatvori</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
