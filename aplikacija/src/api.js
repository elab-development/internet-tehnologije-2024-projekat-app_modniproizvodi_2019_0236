import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// učitaj token ako postoji
const t = localStorage.getItem("token");
if (t) api.defaults.headers.common.Authorization = `Bearer ${t}`;

// helperi
export function setAuthToken(token) {
  localStorage.setItem("token", token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
export function clearAuthToken() {
  localStorage.removeItem("token");
  delete api.defaults.headers.common.Authorization;
}

export default api;
