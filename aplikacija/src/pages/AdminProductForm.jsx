import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
 
import "./admin-products.css";
import api from "../api";

const resolveImageUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `/storage/${path}`;
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [cats, setCats] = useState([]);

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    is_active: true,
    sku: "",
    stock: "",
  });

  const [existingImage, setExistingImage] = useState(""); // string (putanja/URL sa backenda)
  const [removeImage, setRemoveImage] = useState(false);  // flag za brisanje postojeće slike
  const [file, setFile] = useState(null);                 // novi upload
  const [preview, setPreview] = useState("");             // blob URL
  const fileInputRef = useRef();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [fv, setFv] = useState({}); // 422 errors

  // kategorije
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/categories");
        const body = r?.data ?? r;
        setCats(body?.data ?? body ?? []);
      } catch { setCats([]); }
    })();
  }, []);

  // ako je edit – učitaj podatke
  useEffect(() => {
    if (!isEdit) return;
    const ctrl = new AbortController();
    (async () => {
      setLoading(true); setErr("");
      try {
        const r = await api.get(`/products/${id}`, { signal: ctrl.signal });
        const p = (r?.data ?? r);
        setForm({
          category_id: p.category_id ?? "",
          name: p.name ?? "",
          description: p.description ?? "",
          price: p.price ?? "",
          is_active: !!p.is_active,
          sku: p.sku ?? "",
          stock: p.stock ?? "",
        });
        setExistingImage(p.image ?? "");
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          setErr("Ne mogu da učitam proizvod.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [isEdit, id]);

  // preview iz file-a
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setFv((x) => ({ ...x, [name]: undefined }));
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setRemoveImage(false); // ako stavljamo novu, briše se stara automatski na bekendu
    }
  };

  const onChooseFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setRemoveImage(false);
    }
  };

  const clearImage = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr(""); setFv({});
    try {
      // uvek šaljemo multipart (lakše za file + boolean)
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "is_active") fd.append(k, v ? "1" : "0");
        else if (v !== null && v !== undefined) fd.append(k, v === "" ? "" : String(v));
      });
      if (file) fd.append("image", file);
      if (!file && removeImage) fd.append("remove_image", "1");

      if (isEdit) {
        fd.append("_method", "PUT"); // Laravel: file upload + PUT
        await api.post(`/products/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/products`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/admin/products", { replace: true });
    } catch (e2) {
      const data = e2?.response?.data;
      if (e2?.response?.status === 422 && data?.errors) {
        setFv(data.errors);
      } else {
        setErr(data?.message || "Greška pri snimanju.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ap admin-page">
      <Link to="/admin/products" className="ap__back">← Nazad na listu</Link>
      <h2 className="ap__title">{isEdit ? "Izmena proizvoda" : "Novi proizvod"}</h2>

      {err && <div className="note">{err}</div>}

      <form className="ap-form" onSubmit={submit} noValidate>
        <div className="ap-grid">
          <div className="ap-field">
            <label className="ap__lbl">Kategorija</label>
            <select
              className={`ap__input ${fv.category_id ? "is-invalid" : ""}`}
              name="category_id"
              value={form.category_id}
              onChange={onChange}
              required
            >
              <option value="">— izaberi —</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {fv.category_id && <div className="ap__err">{fv.category_id[0]}</div>}
          </div>

          <div className="ap-field">
            <label className="ap__lbl">Naziv</label>
            <input
              className={`ap__input ${fv.name ? "is-invalid" : ""}`}
              name="name" value={form.name} onChange={onChange} required
            />
            {fv.name && <div className="ap__err">{fv.name[0]}</div>}
          </div>

          <div className="ap-field">
            <label className="ap__lbl">Cena (RSD)</label>
            <input
              type="number" min="0" step="0.01"
              className={`ap__input ${fv.price ? "is-invalid" : ""}`}
              name="price" value={form.price} onChange={onChange} required
            />
            {fv.price && <div className="ap__err">{fv.price[0]}</div>}
          </div>

          <div className="ap-field">
            <label className="ap__lbl">Zaliha</label>
            <input
              type="number" min="0"
              className={`ap__input ${fv.stock ? "is-invalid" : ""}`}
              name="stock" value={form.stock} onChange={onChange}
            />
            {fv.stock && <div className="ap__err">{fv.stock[0]}</div>}
          </div>

          <div className="ap-field">
            <label className="ap__lbl">SKU</label>
            <input
              className={`ap__input ${fv.sku ? "is-invalid" : ""}`}
              name="sku" value={form.sku} onChange={onChange}
              placeholder="npr. MO-001"
            />
            {fv.sku && <div className="ap__err">{fv.sku[0]}</div>}
          </div>

          <div className="ap-field ap-field--check">
            <label className="ap__lbl">Aktivan</label>
            <label className="ap__switch">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} />
              <span />
            </label>
          </div>

          <div className="ap-field ap-field--full">
            <label className="ap__lbl">Opis</label>
            <textarea
              className={`ap__input ${fv.description ? "is-invalid" : ""}`}
              name="description" value={form.description} onChange={onChange} rows={5}
              placeholder="Kratak opis proizvoda..."
            />
            {fv.description && <div className="ap__err">{fv.description[0]}</div>}
          </div>

          {/* UPLOAD BLOK */}
          <div className="ap-field ap-field--full">
            <label className="ap__lbl">Slika proizvoda</label>

            {/* Ako već postoji slika i nije izabrana nova */}
            {existingImage && !file && (
              <div className="ap-existing">
                <img src={resolveImageUrl(existingImage)} alt="preview" />
                <div className="ap-existing__meta">
                  <span>Postojeća slika</span>
                  <label className="ap__check">
                    <input
                      type="checkbox"
                      checked={removeImage}
                      onChange={(e) => setRemoveImage(e.target.checked)}
                    />
                    Ukloni sliku
                  </label>
                </div>
              </div>
            )}

            {/* Dropzone / nova slika */}
            <div
              className={`ap-drop ${file ? "has-file" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
            >
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={onChooseFile} />
              {preview ? (
                <>
                  <img className="ap-drop__preview" src={preview} alt="preview" />
                  <div className="ap-drop__actions">
                    <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
                      Promeni...
                    </button>
                    <button type="button" className="btn btn--danger" onClick={clearImage}>
                      Ukloni
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" className="ap-drop__btn" onClick={() => fileInputRef.current?.click()}>
                  Prevuci sliku ovde ili klikni za izbor
                </button>
              )}
            </div>
            {fv.image && <div className="ap__err">{fv.image[0]}</div>}
          </div>
        </div>

        <div className="ap__formActions">
          <button type="button" className="btn" onClick={() => navigate(-1)}>Otkaži</button>
          <button className="btn btn--primary" disabled={loading}>
            {loading ? "Snimam..." : (isEdit ? "Sačuvaj izmene" : "Kreiraj proizvod")}
          </button>
        </div>
      </form>
    </main>
  );
}
