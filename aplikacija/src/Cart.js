import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import "./Cart.css";
import api from "./api";

export default function Cart({ cart, incQty, decQty, removeItem, clearCart }) {
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState(null); // { type: 'ok'|'err', text: string }

  // Ulogovani korisnik iz localStorage
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const totalPrice = cart.reduce((t, it) => t + Number(it.price) * it.quantity, 0);

  const fmtMoney = (n) =>
    new Intl.NumberFormat("sr-RS", { style: "currency", currency: "EUR", minimumFractionDigits: 2 })
      .format(Number(n || 0));

  const createOrderPayload = () => {
    return {
      customer_name:  user?.name || user?.username || "Kupac",
      customer_email: user?.email || "kupac@example.com",
      customer_phone: user?.phone || null,
      items: cart.map((it) => ({
        product_id: it.id,
        quantity: it.quantity,
      })),
    };
  };

  const handleOrder = async () => {
    if (!cart.length || submitting) return;

    setSubmitting(true);
    setNote(null);

    try {
      // 1) Kreiraj narudžbinu u bazi
      const payload = createOrderPayload();
      const r = await api.post("/orders", payload);
      const order = r?.data?.data || r?.data || r;

      setNote({ type: "ok", text: `Narudžbina #${order.id} je uspešno kreirana.` });

      // 2) Generiši PDF (koristimo snapshot-ovane stavke sa backenda ako postoje)
      generatePdf(order);

      // 3) Očisti korpu
      clearCart();
      localStorage.removeItem("cart");
    } catch (e) {
      const msg = e?.response?.data?.message || "Došlo je do greške pri kreiranju narudžbine.";
      setNote({ type: "err", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- PDF ---------- */
  const generatePdf = (order) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const M = 14;
    let y = M;

    const brand = "Shop & Co"; // po želji čitaj iz localStorage npr. localStorage.getItem('brand')
    const orderNo = `#${order.id}`;
    const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString();

    // Header traka
    doc.setFillColor(255, 91, 123);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Potvrda o narudžbini", 105, 18, { align: "center" });

    // Naslov i datum
    y = 34;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(brand, M, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Datum: ${dateStr}`, 210 - M, y, { align: "right" });
    y += 6;

    // Info kartice
    drawCard(doc, M, y, 100, 18, [
      ["Broj narudžbine:", orderNo],
      ["Prodavac:", brand],
    ]);
    drawCard(doc, 210 - M - 100, y, 100, 18, [
      ["Kupac:", order.customer_name || user?.name || user?.username || "Kupac"],
      ["Email:", order.customer_email || user?.email || "—"],
    ]);
    y += 24;

    // Header tabele
    y = ensurePage(doc, y, 30);
    const col = { product: M, qty: 120, price: 145, total: 175 };
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(M, y, 210 - M * 2, 10, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Proizvod", col.product + 2, y + 7);
    doc.text("Količina", col.qty, y + 7);
    doc.text("Cena", col.price, y + 7);
    doc.text("Ukupno", col.total, y + 7);
    y += 12;

    // Redovi
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const items = Array.isArray(order.items) && order.items.length
      ? order.items
      : cart.map((it) => ({
          name: it.name,
          price: Number(it.price),
          quantity: it.quantity,
          line_total: Number(it.price) * it.quantity,
        }));

    let rowIndex = 0;
    items.forEach((it) => {
      const nameLines = doc.splitTextToSize(it.name || "", 210 - M * 2 - 60);
      const lineHeight = 6;
      const rowHeight = Math.max(lineHeight, nameLines.length * lineHeight);

      y = ensurePage(doc, y, rowHeight + 2);

      if (rowIndex % 2 === 0) {
        doc.setFillColor(252, 252, 252);
        doc.rect(M, y - 1.5, 210 - M * 2, rowHeight + 3, "F");
      }

      doc.text(nameLines, col.product + 2, y + 4);
      const midY = y + rowHeight / 2 + 2;

      const price = Number(it.price);
      const qty = Number(it.quantity);
      const lineTotal = it.line_total != null ? Number(it.line_total) : price * qty;

      doc.text(String(qty), col.qty, midY, { baseline: "middle" });
      doc.text(fmtMoney(price), col.price, midY, { baseline: "middle" });
      doc.text(fmtMoney(lineTotal), col.total, midY, { baseline: "middle" });

      y += rowHeight + 2;
      rowIndex++;
    });

    // Rezime
    y = ensurePage(doc, y, 36);
    const subTotal = items.reduce(
      (s, it) => s + (it.line_total != null ? Number(it.line_total) : Number(it.price) * Number(it.quantity)),
      0
    );
    const taxRate = 0.2;
    const tax = subTotal * taxRate;
    const grand = order.total_price != null ? Number(order.total_price) : subTotal + tax;

    const bx = 210 - M - 70;
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(bx, y, 70, 30, 2, 2);
    doc.setFontSize(10);

    doc.text("Međuzbir:", bx + 6, y + 9);
    doc.text(fmtMoney(subTotal), bx + 64, y + 9, { align: "right" });
    doc.text(`PDV (${Math.round(taxRate * 100)}%):`, bx + 6, y + 18);
    doc.text(fmtMoney(tax), bx + 64, y + 18, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("ZA UPLATU:", bx + 6, y + 27);
    doc.text(fmtMoney(grand), bx + 64, y + 27, { align: "right" });

    // Footer
    y += 38;
    y = ensurePage(doc, y, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(
      "Hvala na kupovini! Ova potvrda je generisana automatski i važi kao informativni račun.",
      M,
      y,
      { maxWidth: 210 - M * 2 }
    );

    doc.save(`potvrda-${order.id}.pdf`);
  };

  return (
    <div className="cart">
      <h2>Vaša Korpa</h2>

      {note && (
        <div className={`note ${note.type === "ok" ? "note--ok" : "note--err"}`}>
          {note.text}
        </div>
      )}

      {cart.length === 0 ? (
        <p>Vaša korpa je trenutno prazna.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Proizvod</th>
                <th>Cena</th>
                <th>Količina</th>
                <th>Ukupno</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td className="prod-cell">
                    <span className="prod-name" title={item.name}>{item.name}</span>
                  </td>
                  <td>{Number(item.price).toFixed(2)} €</td>
                  <td>
                    <div className="qty">
                      <button onClick={() => decQty(item.id)} aria-label="Smanji">−</button>
                      <input readOnly value={item.quantity} />
                      <button onClick={() => incQty(item.id)} aria-label="Povećaj">+</button>
                    </div>
                  </td>
                  <td>{(Number(item.price) * item.quantity).toFixed(2)} €</td>
                  <td>
                    <button className="link danger" onClick={() => removeItem(item.id)}>Ukloni</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total">
            <h3>Ukupno: {fmtMoney(totalPrice)}</h3>
            <div className="cart-actions">
              <button className="secondary" onClick={clearCart} disabled={submitting}>Isprazni</button>
              <button
                className={`checkout-btn ${submitting ? "is-loading" : ""}`}
                onClick={handleOrder}
                disabled={submitting}
              >
                {submitting ? "Kreiram narudžbinu…" : "Naruči"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- helpers za PDF ---------- */
function ensurePage(doc, y, needed) {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed <= pageH - 14) return y;
  doc.addPage();
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, 210, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(10);
  doc.text("Potvrda o narudžbini (nastavak)", 105, 8, { align: "center" });
  doc.setTextColor(40, 40, 40);
  return 18;
}

function drawCard(doc, x, y, w, h, rows) {
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(x, y, w, h, 2, 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  let cy = y + 7;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");  doc.text(k, x + 6, cy);
    doc.setFont("helvetica", "normal"); doc.text(String(v), x + w - 6, cy, { align: "right" });
    cy += 6;
  });
}
