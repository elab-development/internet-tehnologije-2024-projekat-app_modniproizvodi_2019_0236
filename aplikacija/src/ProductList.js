import React, { useMemo } from "react"; 
import "./ProductList.css";
import useProducts from "./hooks/useProducts";

function ProductList({ addToCart }) {
  // Inicijalno: aktivni proizvodi, 12 po strani
  const {
    products,
    meta,            // { current_page, last_page, total, per_page }
    page,
    setPage,
    filters,
    setFilter,
    resetFilters,
    loading,
    error,
  } = useProducts({
    perPage: 12,
    onlyActive: true,
    initialFilters: {
      q: "",
      category_id: "",
      price_min: "",
      price_max: "",
      sort: "", // "price_asc" | "price_desc"
    },
  });

  // Helper: Laravel public disk slike (npr. "products/xyz.jpg") -> "/storage/products/xyz.jpg"
  const imageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/400x300?text=No+Image";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return `/storage/${img}`; // pretpostavka: php artisan storage:link
  };

  const canPrev = useMemo(() => meta?.current_page > 1, [meta]);
  const canNext = useMemo(() => meta && meta.current_page < meta.last_page, [meta]);

  return (
    <div className="product-list">
      <h2>Naši Proizvodi</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Pretraži proizvode..."
          value={filters.q}
          onChange={(e) => setFilter("q", e.target.value)}
        />

        {/* MIN / MAX cena */}
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Min cena"
          value={filters.price_min}
          onChange={(e) => setFilter("price_min", e.target.value)}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Max cena"
          value={filters.price_max}
          onChange={(e) => setFilter("price_max", e.target.value)}
        />

        {/* Sortiranje — mapirano na backend: price_asc | price_desc */}
        <select
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value)}
        >
          <option value="">Sortiraj</option>
          <option value="price_asc">Cena: od najniže</option>
          <option value="price_desc">Cena: od najviše</option>
        </select>

        <button type="button" onClick={resetFilters}>
          Resetuj filtere
        </button>
      </div>

      {/* State: loading / error */}
      {loading && <p>Učitavanje...</p>}
      {error && <p className="error">{error}</p>}

      {/* Grid proizvoda */}
      <div className="product-grid">
        {products?.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={imageUrl(product.image)} alt={product.name} />
            <h3 title={product.name}>{product.name}</h3>
            {product.category?.name && (
              <span className="badge">{product.category.name}</span>
            )}
            <p className="desc">{product.description}</p>
            <p className="price">
              {Number(product.price).toFixed(2)} €
            </p>
            <button className="buy-btn" onClick={() => addToCart(product)}>
              Dodaj u korpu
            </button>
          </div>
        ))}
      </div>

      {/* Paginacija (ako postoji meta) */}
      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <button
            disabled={!canPrev}
            onClick={() => canPrev && setPage(page - 1)}
          >
            ‹ Prethodna
          </button>

          <span>
            Strana {meta.current_page} / {meta.last_page}
          </span>

          <button
            disabled={!canNext}
            onClick={() => canNext && setPage(page + 1)}
          >
            Sledeća ›
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductList;
