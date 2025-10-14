

import React from 'react';
import { jsPDF } from 'jspdf';
import './Cart.css';

function Cart({ cart, setCart }) {
  const totalPrice = cart.reduce(
    (total, item) => total + parseFloat(item.price) * item.quantity,
    0
  );

  const handleOrder = () => {
    const doc = new jsPDF();

    // Postavljanje dokumenta
    doc.setFontSize(22);
    doc.text('Narudzbenica', 105, 20, null, null, 'center');

    doc.setFontSize(12);
    doc.text(`Datum: ${new Date().toLocaleDateString()}`, 14, 30);

    doc.setFontSize(14);
    doc.text('Detalji narudzbe:', 14, 40);

    // Dodavanje zaglavlja tabele
    let yPosition = 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Proizvod', 14, yPosition);
    doc.text('Kolicina', 80, yPosition);
    doc.text('Cena', 110, yPosition);
    doc.text('Ukupno', 140, yPosition);

    yPosition += 10;
    doc.setFont('helvetica', 'normal');

    // Dodavanje svakog proizvoda
    cart.forEach((item) => {
      doc.text(item.name, 14, yPosition);
      doc.text(`${item.quantity}`, 80, yPosition);
      doc.text(`${item.price} €`, 110, yPosition);
      const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
      doc.text(`${itemTotal} €`, 140, yPosition);
      yPosition += 10;
    });

    // Crtanje linije
    doc.line(14, yPosition, 200, yPosition);
    yPosition += 10;

    // Dodavanje ukupne cene
    doc.setFont('helvetica', 'bold');
    doc.text(`Ukupno za naplatu: ${totalPrice.toFixed(2)} €`, 14, yPosition);

    // Čuvanje PDF-a
    doc.save('narudzbenica.pdf');

    // Resetovanje korpe
    setCart([]);
    localStorage.removeItem('cart');
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
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.price} €</td>
                  <td>{item.quantity}</td>
                  <td>{(parseFloat(item.price) * item.quantity).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total">
            <h3>Ukupno za naplatu: {totalPrice.toFixed(2)} €</h3>
            <button className="checkout-btn" onClick={handleOrder}>Naruči</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
