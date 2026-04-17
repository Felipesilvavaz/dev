import React, { useEffect, useState, useCallback } from 'react';
import { listarCompromissos, criarCompromisso, atualizarCompromisso, excluirCompromisso } from '../services/api';
import Modal from '../components/Modal';

const VAZIO = { titulo: '', data_hora: '', local: '', obs: '' };

export default function CompromissosPage({ tipo, toast }) {
  const isConsulta = tipo === 'CONSULTA';
  const [lista, setLista]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm]         = useState(VAZIO);
  const [filtro, setFiltro]     = useState('todos');

  const carregar = useCallback(async () => {
    try { setLista(await listarCompromissos(tipo)); }
    catch { toast('Erro ao carregar.', 'error'); }
    finally { setLoading(false); }
  }, [tipo]);

  useEffect(() => { setLoading(true); carregar(); }, [carregar]);

  function abrirModal(item = null) {
    setEditando(item);
    setForm(item ? {
      titulo: item.titulo || '', obs: item.obs || '', local: item.local || '',
      data_hora: item.data_hora ? item.data_hora.slice(0, 16) : '',
    } : VAZIO);
    setModal(true);
  }

  const f = k => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  async function salvar(e) {
    e.preventDefault();
    if (!form.titulo.trim()) { toast('Informe o título.', 'error'); return; }
    setSalvando(true);
    try {
      const dados = { tipo, titulo: form.titulo, local: form.local, obs: form.obs, data_hora: form.data_hora || null };
      if (editando) { await atualizarCompromisso(editando.id, dados); toast(`${isConsulta ? 'Consulta' : 'Exame'} atualizado!`); }
      else { await criarCompromisso(dados); toast(`${isConsulta ? 'Consulta' : 'Exame'} cadastrado!`); }
      setModal(false); carregar();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Erro ao salvar.', 'error');
    } finally { setSalvando(false); }
  }

  async function excluir(id) {
    if (!window.confirm(`Excluir ${isConsulta ? 'esta consulta' : 'este exame'}?`)) return;
    try { await excluirCompromisso(id); toast('Excluído.'); carregar(); }
    catch { toast('Erro ao excluir.', 'error'); }
  }

  const hoje = new Date();
  const filtrados = lista.filter(c => {
    if (filtro === 'futuros') return c.data_hora && new Date(c.data_hora) >= hoje;
    if (filtro === 'passados') return c.data_hora && new Date(c.data_hora) < hoje;
    return true;
  });

  const cor      = isConsulta ? 'var(--blue)'   : 'var(--purple)';
  const corLight = isConsulta ? 'var(--blue-light)' : 'var(--purple-light)';
  const badgeClass = isConsulta ? 'badge-blue' : 'badge-purple';

  return (
    <div className="fade-in">
      <div className="table-wrapper">
        <div className="table-header">
          <span className="table-title">{isConsulta ? '🏥 Consultas' : '🔬 Exames'}</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select value={filtro} onChange={e => setFiltro(e.target.value)}
              style={{ height: 36, padding: '0 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'white', cursor: 'pointer' }}>
              <option value="todos">Todos</option>
              <option value="futuros">Futuros</option>
              <option value="passados">Realizados</option>
            </select>
            <button className="btn btn-primary" style={{ background: cor }} onClick={() => abrirModal()}>
              + {isConsulta ? 'Consulta' : 'Exame'}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" style={{ color: cor, width: 28, height: 28 }} /></div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{isConsulta ? '🏥' : '🔬'}</div>
            <p>Nenhum {isConsulta ? 'consulta' : 'exame'} {filtro !== 'todos' ? `(${filtro})` : 'cadastrado'}.</p>
            <button className="btn btn-primary" style={{ background: cor }} onClick={() => abrirModal()}>
              + {isConsulta ? 'Nova consulta' : 'Novo exame'}
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{isConsulta ? 'Médico / Especialidade' : 'Tipo de exame'}</th>
                <th>Data e hora</th>
                <th>{isConsulta ? 'Clínica / Endereço' : 'Laboratório'}</th>
                <th>Observações</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => {
                const dt = c.data_hora ? new Date(c.data_hora) : null;
                const passado = dt && dt < hoje;
                return (
                  <tr key={c.id} style={{ opacity: passado ? 0.7 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: corLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                          {isConsulta ? '🏥' : '🔬'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.titulo}</div>
                          <span className={`badge ${badgeClass}`} style={{ fontSize: 11, marginTop: 2 }}>{c.tipo}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {dt ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{dt.toLocaleDateString('pt-BR')}</div>
                          <div style={{ color: 'var(--text-2)' }}>{dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{c.local || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 180 }}>
                      {c.obs ? c.obs.slice(0, 60) + (c.obs.length > 60 ? '…' : '') : '—'}
                    </td>
                    <td>
                      <span className={`badge ${passado ? 'badge-gray' : 'badge-green'}`}>
                        {passado ? 'Realizado' : 'Agendado'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => abrirModal(c)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => excluir(c.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={`${editando ? 'Editar' : isConsulta ? 'Nova' : 'Novo'} ${isConsulta ? 'consulta' : 'exame'}`} onClose={() => setModal(false)}>
          <form onSubmit={salvar}>
            <div className="field">
              <label>{isConsulta ? 'Médico / Especialidade *' : 'Tipo de exame *'}</label>
              <input autoFocus placeholder={isConsulta ? 'Ex: Dr. João - Cardiologista' : 'Ex: Hemograma completo'} {...f('titulo')} />
            </div>
            <div className="field">
              <label>Data e hora</label>
              <input type="datetime-local" {...f('data_hora')} />
            </div>
            <div className="field">
              <label>{isConsulta ? 'Endereço da clínica' : 'Laboratório / Clínica'}</label>
              <input placeholder="Rua, número, cidade" {...f('local')} />
            </div>
            <div className="field">
              <label>Observações</label>
              <textarea placeholder={isConsulta ? 'Levar exames anteriores, em jejum...' : 'Instruções de preparo...'} {...f('obs')} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ background: cor }} disabled={salvando}>
                {salvando ? <span className="spinner" /> : editando ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
