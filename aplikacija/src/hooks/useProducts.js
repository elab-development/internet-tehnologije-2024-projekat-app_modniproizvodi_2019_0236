 
import { useEffect, useMemo, useState } from "react";
import api from "../api";

/**
 * useProducts — učitava proizvode sa bekenda uz paginaciju i filtere.
 * options: { perPage, onlyActive, initialFilters }
 */
export default function useProducts(options = {}) {
  const {
    perPage = 12,
    onlyActive = true,
    initialFilters = {}, // { q, category_id, price_min, price_max, sort }
  } = options;

  const [filters, setFilters] = useState({
    q: "",
    category_id: "",
    price_min: "",
    price_max: "",
    sort: "",            // "price_asc" | "price_desc" | ""
    ...initialFilters,
  });

  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);     // products
  const [meta, setMeta] = useState(null);   // laravel meta (current_page, last_page, total, per_page...)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("per_page", perPage);
    p.set("page", page);
    if (onlyActive) p.set("only_active", "1");
    if (filters.q) p.set("q", filters.q);
    if (filters.category_id) p.set("category_id", filters.category_id);
    if (filters.price_min) p.set("price_min", filters.price_min);
    if (filters.price_max) p.set("price_max", filters.price_max);
    if (filters.sort) p.set("sort", filters.sort);
    return p.toString();
  }, [perPage, page, onlyActive, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/products?${params}`);
      // Laravel paginator forma: { data: [...], meta: {...}, links: [...] }
      const payload = res.data;
      const items = Array.isArray(payload?.data) ? payload.data : payload; // fallback ako nije paginirano
      setData(items);
      setMeta(payload?.meta || null);
    } catch (e) {
      setError(e?.response?.data?.message || "Greška pri učitavanju proizvoda.");
    } finally {
      setLoading(false);
    }
  };

  // refetch na promenu params
  useEffect(() => {
    fetchProducts();
 
  }, [params]);

  // helperi
  const setFilter = (name, value) => {
    setPage(1); // reset na prvu stranu kad menjaš filtere
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({
      q: "",
      category_id: "",
      price_min: "",
      price_max: "",
      sort: "",
      ...initialFilters,
    });
  };

  return {
    products: data,
    meta,                 // { current_page, last_page, total, per_page }
    page,
    setPage,
    filters,
    setFilter,
    resetFilters,
    loading,
    error,
    refetch: fetchProducts,
  };
}
