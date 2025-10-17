import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import HomePage from "./HomePage";
import ContactForm from "./ContactForm";
import Login from "./Login";
import Register from "./Register";

import ProductList from "./ProductList";
import Cart from "./Cart";

import AdminMessages from "./pages/AdminMessages";
import AdminProducts from "./pages/AdminProducts";
import AdminProductForm from "./pages/AdminProductForm";
import AdminProductDetail from "./pages/AdminProductDetail";

function App() {
  // poruke / korisnik (ostavljeno kao kod kod tebe)
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem("messages") || "[]"));
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem("currentUser") || "null"));

  useEffect(() => localStorage.setItem("messages", JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem("currentUser", JSON.stringify(currentUser)), [currentUser]);

  const addMessage = (m) => setMessages((prev) => [...prev, m]);
  const logoutUser = () => setCurrentUser(null);

  // === KORPA (localStorage) ===
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  const normalize = (p) => ({
    id: p.id,
    name: p.name,
    // backend može slati image_url (pun URL) ili image (relativno) – čuvamo bilo šta
    image: p.image_url || p.image || "",
    price: Number(p.price || 0),
    quantity: 1,
  });

  const addToCart = (product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === product.id);
      if (ex) return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, normalize(product)];
    });
  };
  const incQty = (id) => setCart((p) => p.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));
  const decQty = (id) => setCart((p) => p.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i)));
  const removeItem = (id) => setCart((p) => p.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);

  return (
    <BrowserRouter>
      <Navbar currentUser={currentUser} logoutUser={logoutUser} cartCount={cartCount} />
      <Routes>
        {/* javno */}
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactForm addMessage={addMessage} />} />
        <Route path="/login" element={<Login onAuth={(u) => setCurrentUser(u)} />} />
        <Route path="/register" element={<Register />} />

        {/* shop */}
        <Route path="/proizvodi" element={<ProductList addToCart={addToCart} />} />
        <Route
          path="/korpa"
          element={
            <Cart
              cart={cart}
              setCart={setCart}
              incQty={incQty}
              decQty={decQty}
              removeItem={removeItem}
              clearCart={clearCart}
            />
          }
        />

        {/* admin */}
        <Route path="/admin/poruke" element={<AdminMessages />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProductForm />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
        <Route path="/admin/products/:id" element={<AdminProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
