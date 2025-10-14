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
const products = [
  {
    id: 1,
    name: 'Svečana haljina',
    description: 'Elegantna crna haljina za posebne prilike.',
    price: '120.00',
    image: 'https://www.fashion-luna.com/files/thumbs/files/images/slike_proizvoda/thumbs_800/8843996_800_1200px.jpg',  
  },
  {
    id: 2,
    name: 'Kožna jakna',
    description: 'Moderna kožna jakna od prave kože.',
    price: '250.00',
    image: 'https://c.cdnmp.net/722917884/p/l/9/kozna-jakna-muska-faretti-west-1638~1599.jpg',
  },
  {
    id: 3,
    name: 'Farmerke',
    description: 'Udobne i moderne farmerke slim fit kroja.',
    price: '80.00',
    image: 'https://media.yamahabarel.com/2024/06/Zenske-moto-farmerke-OA-Super-Stretch-Indigo-regular-1.jpg',
  },
  {
    id: 4,
    name: 'Sportske patike',
    description: 'Lagane patike idealne za trčanje i trening.',
    price: '95.00',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLBb9f-6-njJpnq0SRWEUkRwkzV3uf25EEXWw0Yk_VtTP5cN3m57D175oR0J28KqgcBJE&usqp=CAU',
  },
  {
    id: 5,
    name: 'Sunčane naočare',
    description: 'Stilske sunčane naočare sa UV zaštitom.',
    price: '60.00',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSdvyPTryEmj19Wr0pTe9uhZzf817t-f4zHX8qZqUOfVM_p51_UhNyV6F02S_sG8dKiXA&usqp=CAU',
  },
];

function App() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
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
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  const addMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const addUser = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const loginUser = (username, password) => {
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      setCurrentUser(user);
      return true;
    } else {
      return false;
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Proveravamo da li proizvod već postoji u korpi
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        // Ako postoji, povećavamo količinu
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Ako ne postoji, dodajemo proizvod sa količinom 1
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
          <Route
            path="/contact"
            element={<ContactForm addMessage={addMessage} />}
          />
          <Route
            path="/login"
            element={<Login loginUser={loginUser} />}
          />
          <Route
            path="/register"
            element={<Register addUser={addUser} />}
          />
           <Route
            path="/proizvodi"
            element={<ProductList products={products} addToCart={addToCart} />}
          />
          <Route
            path="/korpa"
            element={<Cart cart={cart} setCart={setCart} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
