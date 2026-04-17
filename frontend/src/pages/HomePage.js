import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarMedicamentos, listarCompromissos, listarAnotacoes } from '../services/api';

export default function HomePage({ setPage }) {
  const { usuario } = useAuth();
  const [dados, setDados]   = useState({ meds: [], comps: [], anots: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listarMedicamentos(), listarCompromissos(), listarAnotacoes()])
      .then(([meds, comps, anots]) => setDados({ meds, comps, anots }))
      .finally(() => setLoading(false));
  }, []);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const hoje = new Date();

  const medsAtivos = dados.meds.filter(m => !m.data_fim || new Date(m.data_fim) >= hoje);
  const proximos = dados.comps.filter(c => c.data_hora && new Date(c.data_hora) >= hoje)
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora)).slice(0, 5);
  const consultas = dados.comps.filter(c => c.tipo === 'CONSULTA');
  const exames    = dados.comps.filter(c => c.tipo === 'EXAME');

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, color: 'var(--green)' }} /></div>;

  return (
    <div className="fade-in">
      {/* Saudação */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>
          {saudacao}, <span style={{ color: 'var(--green)' }}>{usuario?.nome?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="💊" label="Medicamentos ativos" value={medsAtivos.length} color="green" onClick={() => setPage('medicamentos')} />
        <StatCard icon="🏥" label="Consultas" value={consultas.length} color="blue" onClick={() => setPage('consultas')} />
        <StatCard icon="🔬" label="Exames" value={exames.length} color="purple" onClick={() => setPage('exames')} />
        <StatCard icon="📝" label="Anotações" value={dados.anots.length} color="amber" onClick={() => setPage('anotacoes')} />
      </div>

      <div className="section-grid">
        {/* Próximos compromissos */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p className="section-title">📅 Próximos compromissos</p>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('consultas')}>Ver todos →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proximos.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', padding: '30px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <p>Nenhum compromisso futuro</p>
              </div>
            ) : proximos.map(c => {
              const dt = new Date(c.data_hora);
              const isCons = c.tipo === 'CONSULTA';
              return (
                <div key={c.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: isCons ? 'var(--blue-light)' : 'var(--purple-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                  }}>
                    {isCons ? '🏥' : '🔬'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{c.titulo}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      📅 {dt.toLocaleDateString('pt-BR')} às {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {c.local && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>📍 {c.local}</div>}
                  </div>
                  <span className={`badge ${isCons ? 'badge-blue' : 'badge-purple'}`}>{c.tipo}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Medicamentos em uso */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p className="section-title">💊 Medicamentos em uso</p>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('medicamentos')}>Ver todos →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {medsAtivos.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-3)', padding: '30px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
                <p>Nenhum medicamento ativo</p>
              </div>
            ) : medsAtivos.slice(0, 5).map(m => (
              <div key={m.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    {[m.dosagem, m.frequencia].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {m.horarios && <span className="badge badge-green">⏰ {m.horarios}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acesso rápido */}
      <div style={{ marginTop: 28 }}>
        <p className="section-title">⚡ Acesso rápido</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { icon: '💊', label: 'Add medicamento', page: 'medicamentos', color: 'var(--green)' },
            { icon: '🏥', label: 'Nova consulta',   page: 'consultas',    color: 'var(--blue)' },
            { icon: '🔬', label: 'Novo exame',       page: 'exames',       color: 'var(--purple)' },
            { icon: '📝', label: 'Nova anotação',    page: 'anotacoes',    color: 'var(--amber)' },
          ].map(b => (
            <button key={b.page} onClick={() => setPage(b.page)}
              className="btn btn-secondary"
              style={{ gap: 8, borderColor: b.color + '60', color: b.color, background: b.color + '10' }}
            >
              {b.icon} {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div className={`stat-card ${color}`} style={{ cursor: 'pointer' }} onClick={onClick}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
