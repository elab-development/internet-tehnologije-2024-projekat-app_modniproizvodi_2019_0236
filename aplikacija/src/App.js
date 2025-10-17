import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import ContactForm from './ContactForm';
import Navbar from './Navbar';
import Login from './Login';
import Register from './Register';
import ProductList from './ProductList';
import Cart from './Cart';
import AdminMessages from './pages/AdminMessages';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import AdminProductDetail from './pages/AdminProductDetail';

 
function App() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addMessage = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const logoutUser = () => {
    setCurrentUser(null); // Navbar već briše token i currentUser iz localStorage
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === product.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar currentUser={currentUser} logoutUser={logoutUser} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactForm addMessage={addMessage} />} />
          <Route path="/login" element={<Login onAuth={(u) => setCurrentUser(u)} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/proizvodi" element={<ProductList  addToCart={addToCart} />} />
          <Route path="/korpa" element={<Cart cart={cart} setCart={setCart} />} />



            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
            <Route path="/admin/products/:id" element={<AdminProductDetail />} />
          <Route path="/admin/poruke" element={<AdminMessages />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
