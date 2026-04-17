import React, { useEffect, useState, useCallback } from 'react';
import { listarMedicamentos, criarMedicamento, atualizarMedicamento, excluirMedicamento } from '../services/api';
import Modal from '../components/Modal';

const VIAS = ['Oral', 'Intravenosa (IV)', 'Intramuscular (IM)', 'Subcutânea (SC)', 'Tópica', 'Inalatória'];
const FREQS = ['1x ao dia', '2x ao dia (12h)', '3x ao dia (8h)', '4x ao dia (6h)', 'A cada 48h', 'Conforme necessário'];

const VAZIO = { nome: '', dosagem: '', via: '', observacoes: '', horarios: '', frequencia: '', data_inicio: '', data_fim: '' };

export default function MedicamentosPage({ toast }) {
  const [lista, setLista]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm]         = useState(VAZIO);
  const [busca, setBusca]       = useState('');

  const carregar = useCallback(async () => {
    try { setLista(await listarMedicamentos()); }
    catch { toast('Erro ao carregar medicamentos.', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirModal(item = null) {
    setEditando(item);
    setForm(item ? { nome: item.nome||'', dosagem: item.dosagem||'', via: item.via||'', observacoes: item.observacoes||'', horarios: item.horarios||'', frequencia: item.frequencia||'', data_inicio: item.data_inicio||'', data_fim: item.data_fim||'' } : VAZIO);
    setModal(true);
  }

  const f = k => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  async function salvar(e) {
    e.preventDefault();
    if (!form.nome.trim()) { toast('Informe o nome do medicamento.', 'error'); return; }
    setSalvando(true);
    try {
      const dados = { ...form, data_inicio: form.data_inicio || null, data_fim: form.data_fim || null };
      if (editando) { await atualizarMedicamento(editando.id, dados); toast('Medicamento atualizado!'); }
      else { await criarMedicamento(dados); toast('Medicamento cadastrado!'); }
      setModal(false); carregar();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Erro ao salvar.', 'error');
    } finally { setSalvando(false); }
  }

  async function excluir(id) {
    if (!window.confirm('Excluir este medicamento?')) return;
    try { await excluirMedicamento(id); toast('Medicamento excluído.'); carregar(); }
    catch { toast('Erro ao excluir.', 'error'); }
  }

  const filtrados = lista.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()));
  const hoje = new Date();
  const ativo = m => !m.data_fim || new Date(m.data_fim) >= hoje;

  return (
    <div className="fade-in">
      <div className="table-wrapper">
        <div className="table-header">
          <span className="table-title">💊 Medicamentos</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)}
              style={{ height: 36, padding: '0 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', width: 200 }}
            />
            <button className="btn btn-primary" onClick={() => abrirModal()}>+ Adicionar</button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" style={{ color: 'var(--green)', width: 28, height: 28 }} /></div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <p>{busca ? 'Nenhum medicamento encontrado.' : 'Nenhum medicamento cadastrado.'}</p>
            {!busca && <button className="btn btn-primary" onClick={() => abrirModal()}>+ Adicionar primeiro</button>}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Medicamento</th><th>Dosagem</th><th>Via</th>
                <th>Horários</th><th>Frequência</th><th>Período</th>
                <th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.nome}</div>
                    {m.observacoes && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>💬 {m.observacoes.slice(0, 50)}{m.observacoes.length > 50 ? '…' : ''}</div>}
                  </td>
                  <td>{m.dosagem || '—'}</td>
                  <td>{m.via || '—'}</td>
                  <td>{m.horarios ? <span className="badge badge-green">{m.horarios}</span> : '—'}</td>
                  <td>{m.frequencia || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {m.data_inicio && <div>Início: {m.data_inicio}</div>}
                    {m.data_fim    && <div>Fim: {m.data_fim}</div>}
                    {!m.data_inicio && !m.data_fim && '—'}
                  </td>
                  <td>
                    <span className={`badge ${ativo(m) ? 'badge-green' : 'badge-gray'}`}>
                      {ativo(m) ? 'Ativo' : 'Encerrado'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => abrirModal(m)}>✏️ Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => excluir(m.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={editando ? 'Editar medicamento' : 'Novo medicamento'} onClose={() => setModal(false)}>
          <form onSubmit={salvar}>
            <div className="field"><label>Nome do medicamento *</label><input placeholder="Ex: Dipirona 500mg" autoFocus {...f('nome')} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field"><label>Dosagem</label><input placeholder="Ex: 500mg" {...f('dosagem')} /></div>
              <div className="field"><label>Horários</label><input placeholder="Ex: 08:00, 20:00" {...f('horarios')} /></div>
            </div>

            <div className="field">
              <label>Via de administração</label>
              <div className="chips" style={{ marginTop: 4 }}>
                {VIAS.map(v => (
                  <button key={v} type="button" className={`chip ${form.via === v ? 'active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, via: v }))}>{v}</button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Frequência</label>
              <div className="chips" style={{ marginTop: 4 }}>
                {FREQS.map(v => (
                  <button key={v} type="button" className={`chip ${form.frequencia === v ? 'active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, frequencia: v }))}>{v}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field"><label>Data de início</label><input type="date" {...f('data_inicio')} /></div>
              <div className="field"><label>Data de término</label><input type="date" {...f('data_fim')} /></div>
            </div>

            <div className="field"><label>Observações</label><textarea placeholder="Instruções especiais, reações adversas..." {...f('observacoes')} /></div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? <span className="spinner" /> : editando ? 'Salvar alterações' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
