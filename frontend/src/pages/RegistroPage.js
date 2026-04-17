import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegistroPage({ onGoLogin }) {
  const { registrar } = useAuth();
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmar: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha) { setErro('Nome, e-mail e senha são obrigatórios.'); return; }
    if (form.senha.length < 6) { setErro('Senha deve ter ao menos 6 caracteres.'); return; }
    if (form.senha !== form.confirmar) { setErro('As senhas não coincidem.'); return; }
    setLoading(true); setErro('');
    try {
      await registrar(form.nome, form.email.trim().toLowerCase(), form.senha, form.telefone);
    } catch (err) {
      setErro(err?.response?.data?.detail || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <div className="auth-page">
      <div className="auth-card slide-up" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">💊</div>
          <h1><span>Agenda</span>Med</h1>
          <p>Crie sua conta gratuita</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field"><label>Nome completo *</label><input placeholder="Seu nome" autoFocus {...f('nome')} /></div>
          <div className="field"><label>E-mail *</label><input type="email" placeholder="seu@email.com" {...f('email')} /></div>
          <div className="field"><label>Telefone</label><input placeholder="(00) 00000-0000" {...f('telefone')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field"><label>Senha *</label><input type="password" placeholder="Mín. 6 caracteres" {...f('senha')} /></div>
            <div className="field"><label>Confirmar *</label><input type="password" placeholder="Repita" {...f('confirmar')} /></div>
          </div>

          {erro && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>⚠ {erro}</p>}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <span className="spinner" /> : 'Criar minha conta'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem conta? <a onClick={onGoLogin}>Fazer login</a>
        </div>
      </div>
    </div>
  );
}
