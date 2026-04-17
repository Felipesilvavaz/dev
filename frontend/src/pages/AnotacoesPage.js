import React, { useEffect, useState, useCallback } from 'react';
import { listarAnotacoes, criarAnotacao, atualizarAnotacao, excluirAnotacao } from '../services/api';
import Modal from '../components/Modal';

export default function AnotacoesPage({ toast }) {
  const [lista, setLista]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [texto, setTexto]       = useState('');
  const [busca, setBusca]       = useState('');

  const carregar = useCallback(async () => {
    try { setLista(await listarAnotacoes()); }
    catch { toast('Erro ao carregar anotações.', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirModal(item = null) {
    setEditando(item);
    setTexto(item?.texto || '');
    setModal(true);
  }

  async function salvar(e) {
    e.preventDefault();
    if (!texto.trim()) { toast('Digite o texto da anotação.', 'error'); return; }
    setSalvando(true);
    try {
      if (editando) { await atualizarAnotacao(editando.id, { texto: texto.trim() }); toast('Anotação atualizada!'); }
      else { await criarAnotacao({ texto: texto.trim() }); toast('Anotação criada!'); }
      setModal(false); carregar();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Erro ao salvar.', 'error');
    } finally { setSalvando(false); }
  }

  async function excluir(id) {
    if (!window.confirm('Excluir esta anotação?')) return;
    try { await excluirAnotacao(id); toast('Anotação excluída.'); carregar(); }
    catch { toast('Erro ao excluir.', 'error'); }
  }

  const filtradas = lista.filter(a => a.texto.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="table-wrapper">
        <div className="table-header">
          <span className="table-title">📝 Anotações Médicas</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)}
              style={{ height: 36, padding: '0 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', width: 200 }}
            />
            <button className="btn btn-primary" style={{ background: 'var(--amber)', color: '#fff' }} onClick={() => abrirModal()}>+ Nova anotação</button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <span className="spinner" style={{ color: 'var(--amber)', width: 28, height: 28 }} />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>{busca ? 'Nenhuma anotação encontrada.' : 'Nenhuma anotação registrada.'}</p>
            {!busca && <button className="btn btn-primary" style={{ background: 'var(--amber)' }} onClick={() => abrirModal()}>+ Criar primeira anotação</button>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtradas.map((a, i) => {
              const dt = new Date(a.criado_em);
              return (
                <div key={a.id} style={{
                  padding: '18px 20px', borderBottom: i < filtradas.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'background .1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: 'var(--amber-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0
                  }}>📝</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text)', marginBottom: 6 }}>{a.texto}</p>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      🕐 {dt.toLocaleDateString('pt-BR')} às {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => abrirModal(a)}>✏️ Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => excluir(a.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editando ? 'Editar anotação' : 'Nova anotação'} onClose={() => setModal(false)} width={560}>
          <form onSubmit={salvar}>
            <div className="field">
              <label>Anotação médica</label>
              <textarea
                autoFocus
                placeholder="Ex: Médico recomendou evitar sal. Tomar medicamento em jejum. Alergia a penicilina..."
                value={texto}
                onChange={e => setTexto(e.target.value)}
                style={{ minHeight: 150 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ background: 'var(--amber)' }} disabled={salvando}>
                {salvando ? <span className="spinner" /> : editando ? 'Salvar' : 'Criar anotação'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
