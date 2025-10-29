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
import Breadcrumbs from "./Breadcrumbs";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";

//dodajemo ovaj kod kako bismo resili problem
/*
-moze da se pristupi stranicama ako nisi ulogovan ako se ukuca u URL npr. localhost:3000/proizvodi ili 
 cak admin stranicama npr localhost:3000/admin/orders ako si neulogovan ili obican korisnik
*/
import { Navigate } from "react-router-dom";

// samo ulogovan korisnik
const RequireAuth = ({ user, children }) =>
  user ? children : <Navigate to="/login" replace />;

// samo admin
const RequireAdmin = ({ user, children }) =>
  String(user?.role || "").toLowerCase() === "admin" ? children : <Navigate to="/login" replace />;



function App() {
  // poruke / korisnik 
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
        <Breadcrumbs />
          <Routes>
            {/* javno */}
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<ContactForm addMessage={addMessage} />} />
            <Route path="/login" element={<Login onAuth={(u) => setCurrentUser(u)} />} />
            <Route path="/register" element={<Register />} />

            {/* shop – SAMO ulogovani */}
            <Route
              path="/proizvodi"
              element={
                <RequireAuth user={currentUser}>
                  <ProductList addToCart={addToCart} />
                </RequireAuth>
              }
            />
            <Route
              path="/korpa"
              element={
                <RequireAuth user={currentUser}>
                  <Cart
                    cart={cart}
                    setCart={setCart}
                    incQty={incQty}
                    decQty={decQty}
                    removeItem={removeItem}
                    clearCart={clearCart}
                  />
                </RequireAuth>
              }
            />

            {/* admin – SAMO admin */}
            <Route
              path="/admin"
              element={
                <RequireAdmin user={currentUser}>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/poruke"
              element={
                <RequireAdmin user={currentUser}>
                  <AdminMessages />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <RequireAdmin user={currentUser}>
                  <AdminOrders />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products"
              element={
                <RequireAdmin user={currentUser}>
                  <AdminProducts />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <RequireAdmin user={currentUser}>
                  <AdminProductForm />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <RequireAdmin user={currentUser}>
                  <AdminProductForm />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products/:id"
              element={
                <RequireAdmin user={currentUser}>
                  <AdminProductDetail />
                </RequireAdmin>
              }
            />
          </Routes>

    </BrowserRouter>
  );
}

export default App;
