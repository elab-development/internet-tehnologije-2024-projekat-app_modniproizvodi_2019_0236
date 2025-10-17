import React, { useEffect, useState } from "react";
import api from "../api";
import "./admin-dashboard.css";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
} from "recharts";

const fmtMoney = (n) =>
  new Intl.NumberFormat("sr-RS", { style: "currency", currency: "EUR", minimumFractionDigits: 2 })
    .format(Number(n || 0));

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true); setErr("");
      try {
        const r = await api.get("/admin/overview", { signal: ctrl.signal });
        setData(r?.data ?? r);
      } catch (e) {
        setErr(e?.response?.data?.message || "Ne mogu da učitam metrike.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const ordersChart = data?.charts?.orders_by_month ?? [];
  const catsChart   = data?.charts?.products_by_category ?? [];
  const totals      = data?.totals ?? {};

  return (
    <main className="adm admin-dashboard">
      <header className="adm__head">
        <h2>Admin pregled</h2>
      </header>

      {err && <div className="note note--err">{err}</div>}
      {loading && <div className="note">Učitavanje…</div>}

      {data && (
        <>
          {/* Counters */}
          <section className="adm__grid-4">
            <CounterCard title="Korisnici" value={totals.users} />
            <CounterCard title="Proizvodi" value={totals.products} />
            <CounterCard title="Kategorije" value={totals.categories} />
            <CounterCard title="Narudžbine" value={totals.orders} />
          </section>

          {/* Charts */}
          <section className="adm__charts">
            <div className="adm__chart card">
              <h3>Narudžbine i prihod (posl. 12 meseci)</h3>
              <OrdersRevenueChart rows={ordersChart} />
            </div>

            <div className="adm__chart card">
              <h3>Proizvodi po kategorijama (Top 10)</h3>
              <CategoryBarChart rows={catsChart} />
            </div>
          </section>

          <section className="adm__total">
            <div className="card">
              <div className="adm__row">
                <div>
                  <h4>Ukupan prihod</h4>
                  <p className="adm__big">{fmtMoney(totals.revenue)}</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function CounterCard({ title, value }) {
  return (
    <div className="card counter">
      <div className="counter__value">{value ?? 0}</div>
      <div className="counter__title">{title}</div>
    </div>
  );
}

/* ---------- Chart 1: Recharts (narudžbine + prihod) ---------- */
function OrdersRevenueChart({ rows }) {
  if (!rows?.length) return <p className="muted">Nema podataka.</p>;

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer>
        <ComposedChart data={rows} margin={{ top: 8, right: 20, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#4b5563", fontSize: 12 }} />
          {/* Leva osa: broj narudžbina */}
          <YAxis
            yAxisId="left"
            allowDecimals={false}
            tick={{ fill: "#4b5563", fontSize: 12 }}
          />
          {/* Desna osa: prihod */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#4b5563", fontSize: 12 }}
            tickFormatter={(v) => fmtMoney(v).replace("€", "")}
          />

          <Tooltip
            contentStyle={{ borderRadius: 10, borderColor: "#e5e7eb" }}
            formatter={(value, name) =>
              name === "revenue" ? [fmtMoney(value), "Prihod"] : [value, "Narudžbine"]
            }
            labelStyle={{ color: "#111827" }}
          />
          <Legend wrapperStyle={{ paddingTop: 6 }} />

          <Bar
            yAxisId="left"
            dataKey="count"
            name="Narudžbine"
            fill="#cfe6ff"
            stroke="#bfdbfe"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            name="Prihod"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- Chart 2: Recharts (kategorije — horizontal bars) ---------- */
function CategoryBarChart({ rows }) {
  if (!rows?.length) return <p className="muted">Nema podataka.</p>;

  return (
    <div style={{ width: "100%", height: Math.max(220, rows.length * 38) }}>
      <ResponsiveContainer>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 8, right: 20, bottom: 8, left: 8 }}
        >
          <CartesianGrid stroke="#eef2f7" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#4b5563", fontSize: 12 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: "#4b5563", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ borderRadius: 10, borderColor: "#e5e7eb" }}
            formatter={(value) => [value, "Proizvoda"]}
            labelStyle={{ color: "#111827" }}
          />
          <Bar dataKey="count" name="Proizvoda" fill="#e5e7eb" radius={[6, 6, 6, 6]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
