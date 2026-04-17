// services/api.js - AgendaMed Web
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

// Injeta token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@agendamed_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login em 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('@agendamed_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────
export const registrar = d  => api.post('/auth/registro', d).then(r => r.data);
export const login     = d  => api.post('/auth/login', d).then(r => r.data);
export const me        = () => api.get('/auth/me').then(r => r.data);

// ── Medicamentos ────────────────────────────────────────
export const listarMedicamentos   = ()       => api.get('/medicamentos').then(r => r.data);
export const criarMedicamento     = d        => api.post('/medicamentos', d).then(r => r.data);
export const atualizarMedicamento = (id, d)  => api.put(`/medicamentos/${id}`, d).then(r => r.data);
export const excluirMedicamento   = id       => api.delete(`/medicamentos/${id}`).then(r => r.data);

// ── Compromissos ────────────────────────────────────────
export const listarCompromissos   = tipo     => api.get('/compromissos', { params: { tipo } }).then(r => r.data);
export const criarCompromisso     = d        => api.post('/compromissos', d).then(r => r.data);
export const atualizarCompromisso = (id, d)  => api.put(`/compromissos/${id}`, d).then(r => r.data);
export const excluirCompromisso   = id       => api.delete(`/compromissos/${id}`).then(r => r.data);

// ── Anotações ───────────────────────────────────────────
export const listarAnotacoes   = ()       => api.get('/anotacoes').then(r => r.data);
export const criarAnotacao     = d        => api.post('/anotacoes', d).then(r => r.data);
export const atualizarAnotacao = (id, d)  => api.put(`/anotacoes/${id}`, d).then(r => r.data);
export const excluirAnotacao   = id       => api.delete(`/anotacoes/${id}`).then(r => r.data);

export default api;
