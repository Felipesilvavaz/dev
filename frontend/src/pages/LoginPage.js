import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onGoRegister }) {
  const { login } = useAuth();
  const [form, setForm]     = useState({ email: '', senha: '' });
  const [erro, setErro]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.senha) { setErro('Preencha todos os campos.'); return; }
    setLoading(true); setErro('');
    try {
      await login(form.email.trim().toLowerCase(), form.senha);
    } catch (err) {
      setErro(err?.response?.data?.detail || 'Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">💊</div>
          <h1><span>Agenda</span>Med</h1>
          <p>Seus cuidados de saúde em dia</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>E-mail</label>
            <input
              type="email" placeholder="seu@email.com" autoFocus
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                value={form.senha}
                onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {erro && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>⚠ {erro}</p>}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <span className="spinner" /> : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          Não tem conta? <a onClick={onGoRegister}>Criar conta gratuita</a>
        </div>
      </div>
    </div>
  );
}
