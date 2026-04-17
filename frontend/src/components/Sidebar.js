import React from 'react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { id: 'home',         icon: '🏠', label: 'Início' },
  { id: 'medicamentos', icon: '💊', label: 'Medicamentos' },
  { id: 'consultas',    icon: '🏥', label: 'Consultas' },
  { id: 'exames',       icon: '🔬', label: 'Exames' },
  { id: 'anotacoes',    icon: '📝', label: 'Anotações' },
];

export default function Sidebar({ page, setPage, counts }) {
  const { usuario, logout } = useAuth();
  const initials = usuario?.nome?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💊</div>
        <div className="sidebar-logo-text"><span>Agenda</span>Med</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {nav.map(item => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {counts?.[item.id] > 0 && (
              <span className="nav-badge">{counts[item.id]}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-card">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario?.nome}
            </div>
            <div className="user-email" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario?.email}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout} title="Sair" style={{ padding: '4px 8px', minWidth: 0 }}>
            ↩
          </button>
        </div>
      </div>
    </aside>
  );
}
