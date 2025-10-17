import React from "react";
import { jsPDF } from "jspdf";
import "./Cart.css";

export default function Cart({ cart, setCart, incQty, decQty, removeItem, clearCart }) {
  const totalPrice = cart.reduce((t, it) => t + Number(it.price) * it.quantity, 0);

  const handleOrder = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Narudzbenica", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Datum: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.setFontSize(14);
    doc.text("Detalji narudzbe:", 14, 40);

    let y = 50;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Proizvod", 14, y);
    doc.text("Količina", 80, y);
    doc.text("Cena", 110, y);
    doc.text("Ukupno", 140, y);
    y += 10; doc.setFont("helvetica", "normal");

    cart.forEach((item) => {
      const lineTotal = (Number(item.price) * item.quantity).toFixed(2);
      doc.text(item.name, 14, y);
      doc.text(String(item.quantity), 80, y);
      doc.text(`${Number(item.price).toFixed(2)} €`, 110, y);
      doc.text(`${lineTotal} €`, 140, y);
      y += 10;
    });

    doc.line(14, y, 200, y); y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Ukupno za naplatu: ${totalPrice.toFixed(2)} €`, 14, y);
    doc.save("narudzbenica.pdf");

    clearCart();
    localStorage.removeItem("cart");
  };

  return (
    <div className="cart">
      <h2>Vaša Korpa</h2>

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
            <h3>Ukupno: {totalPrice.toFixed(2)} €</h3>
            <div className="cart-actions">
              <button className="secondary" onClick={clearCart}>Isprazni</button>
              <button className="checkout-btn" onClick={handleOrder}>Naruči</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
