import React, { useState } from 'react';
import './ProductList.css';

function ProductList({ products, addToCart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');

  // Filtriranje proizvoda na osnovu unetog termina pretrage
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sortiranje proizvoda na osnovu izabrane opcije
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-asc') {
      return parseFloat(a.price) - parseFloat(b.price);
    } else if (sortOption === 'price-desc') {
      return parseFloat(b.price) - parseFloat(a.price);
    } else {
      return 0;
    }
  });

  return (
    <div className="product-list">
      <h2>Naši Proizvodi</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Pretraži proizvode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="">Sortiraj</option>
          <option value="price-asc">Cena: od najniže</option>
          <option value="price-desc">Cena: od najviše</option>
        </select>
      </div>

      <div className="product-grid">
        {sortedProducts.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">{product.price} €</p>
            <button className="buy-btn" onClick={() => addToCart(product)}>
              Dodaj u korpu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
