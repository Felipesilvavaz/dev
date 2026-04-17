import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useToast } from './hooks/useToast';
import ToastContainer from './components/Toast';
import Sidebar from './components/Sidebar';
import LoginPage      from './pages/LoginPage';
import RegistroPage   from './pages/RegistroPage';
import HomePage       from './pages/HomePage';
import MedicamentosPage  from './pages/MedicamentosPage';
import CompromissosPage  from './pages/CompromissosPage';
import AnotacoesPage     from './pages/AnotacoesPage';
import { listarMedicamentos, listarCompromissos, listarAnotacoes } from './services/api';

const PAGE_TITLES = {
  home: 'Início',
  medicamentos: 'Medicamentos',
  consultas: 'Consultas',
  exames: 'Exames',
  anotacoes: 'Anotações',
};

function AppInner() {
  const { usuario, carregando } = useAuth();
  const { toasts, toast } = useToast();
  const [page, setPage]   = useState('home');
  const [authPage, setAuthPage] = useState('login');
  const [counts, setCounts] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Carrega contagens para os badges da sidebar
  useEffect(() => {
    if (!usuario) return;
    Promise.all([listarMedicamentos(), listarCompromissos(), listarAnotacoes()])
      .then(([meds, comps, anots]) => {
        const hoje = new Date();
        setCounts({
          medicamentos: meds.filter(m => !m.data_fim || new Date(m.data_fim) >= hoje).length,
          consultas:    comps.filter(c => c.tipo === 'CONSULTA' && c.data_hora && new Date(c.data_hora) >= hoje).length,
          exames:       comps.filter(c => c.tipo === 'EXAME'    && c.data_hora && new Date(c.data_hora) >= hoje).length,
          anotacoes:    anots.length,
        });
      }).catch(() => {});
  }, [usuario, page]);

  if (carregando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg)' }}>
        <div style={{ fontSize: 56 }}>💊</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>
          <span style={{ color: 'var(--green)' }}>Agenda</span>Med
        </div>
        <span className="spinner" style={{ color: 'var(--green)', width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  if (!usuario) {
    return (
      <>
        <ToastContainer toasts={toasts} />
        {authPage === 'login'
          ? <LoginPage onGoRegister={() => setAuthPage('registro')} />
          : <RegistroPage onGoLogin={() => setAuthPage('login')} />
        }
      </>
    );
  }

  function renderPage() {
    const props = { toast };
    switch (page) {
      case 'home':         return <HomePage setPage={setPage} />;
      case 'medicamentos': return <MedicamentosPage {...props} />;
      case 'consultas':    return <CompromissosPage tipo="CONSULTA" {...props} />;
      case 'exames':       return <CompromissosPage tipo="EXAME"    {...props} />;
      case 'anotacoes':    return <AnotacoesPage    {...props} />;
      default:             return <HomePage setPage={setPage} />;
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="app-layout">
        <div className={sidebarOpen ? 'sidebar open' : ''} style={{ position: 'fixed', zIndex: 100 }}>
          <Sidebar page={page} setPage={p => { setPage(p); setSidebarOpen(false); }} counts={counts} />
        </div>

        <main className="main-content">
          <header className="page-header">
            {/* Botão hamburguer só no mobile */}
            <button
              className="btn btn-ghost btn-sm"
              style={{ display: 'none' }}
              id="sidebar-toggle"
              onClick={() => setSidebarOpen(v => !v)}
            >
              ☰
            </button>
            <h1>{PAGE_TITLES[page]}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </header>

          <div className="page-body">
            {renderPage()}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #sidebar-toggle { display: flex !important; }
          .sidebar { transform: translateX(-100%); transition: transform .25s; }
          .sidebar.open { transform: translateX(0) !important; box-shadow: var(--shadow-lg); }
        }
      `}</style>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
