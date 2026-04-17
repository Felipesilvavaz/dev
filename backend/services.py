# services.py - AgendaMed
from models import Session, Usuario, Medicamento, Compromisso, AnotacaoMedica, Notificacao
from auth import hash_senha, verificar_senha, criar_token
from datetime import datetime
from fastapi import HTTPException, status


# ─── USUARIO ────────────────────────────────────────────────────────────────

class UsuarioService:

    def registrar(self, nome: str, email: str, senha: str, telefone: str = None):
        session = Session()
        try:
            existente = session.query(Usuario).filter(Usuario.email == email).first()
            if existente:
                raise HTTPException(status_code=400, detail="Email já cadastrado")
            usuario = Usuario(
                nome=nome,
                email=email,
                senha=hash_senha(senha),
                telefone=telefone
            )
            session.add(usuario)
            session.commit()
            session.refresh(usuario)
            token = criar_token({"sub": usuario.id})
            return {"token": token, "usuario": _usuario_dict(usuario)}
        finally:
            session.close()

    def login(self, email: str, senha: str):
        session = Session()
        try:
            usuario = session.query(Usuario).filter(Usuario.email == email).first()
            if not usuario or not verificar_senha(senha, usuario.senha):
                raise HTTPException(status_code=401, detail="Email ou senha inválidos")
            token = criar_token({"sub": usuario.id})
            return {"token": token, "usuario": _usuario_dict(usuario)}
        finally:
            session.close()

    def obter(self, usuario_id: str):
        session = Session()
        try:
            u = session.query(Usuario).filter(Usuario.id == usuario_id).first()
            if not u:
                raise HTTPException(status_code=404, detail="Usuário não encontrado")
            return _usuario_dict(u)
        finally:
            session.close()


def _usuario_dict(u):
    return {"id": u.id, "nome": u.nome, "email": u.email, "telefone": u.telefone}


# ─── MEDICAMENTO ─────────────────────────────────────────────────────────────

class MedicamentoService:

    def criar(self, usuario_id, nome, dosagem, via, observacoes, horarios, frequencia, data_inicio, data_fim):
        session = Session()
        try:
            med = Medicamento(
                usuario_id=usuario_id, nome=nome, dosagem=dosagem,
                via=via, observacoes=observacoes, horarios=horarios,
                frequencia=frequencia, data_inicio=data_inicio, data_fim=data_fim
            )
            session.add(med)
            session.commit()
            session.refresh(med)
            return _med_dict(med)
        finally:
            session.close()

    def listar(self, usuario_id):
        session = Session()
        try:
            meds = session.query(Medicamento).filter(
                Medicamento.usuario_id == usuario_id
            ).order_by(Medicamento.criado_em.desc()).all()
            return [_med_dict(m) for m in meds]
        finally:
            session.close()

    def obter(self, med_id, usuario_id):
        session = Session()
        try:
            med = session.query(Medicamento).filter(
                Medicamento.id == med_id, Medicamento.usuario_id == usuario_id
            ).first()
            if not med:
                raise HTTPException(status_code=404, detail="Medicamento não encontrado")
            return _med_dict(med)
        finally:
            session.close()

    def atualizar(self, med_id, usuario_id, dados: dict):
        session = Session()
        try:
            med = session.query(Medicamento).filter(
                Medicamento.id == med_id, Medicamento.usuario_id == usuario_id
            ).first()
            if not med:
                raise HTTPException(status_code=404, detail="Medicamento não encontrado")
            for k, v in dados.items():
                if v is not None and hasattr(med, k):
                    setattr(med, k, v)
            session.commit()
            session.refresh(med)
            return _med_dict(med)
        finally:
            session.close()

    def excluir(self, med_id, usuario_id):
        session = Session()
        try:
            med = session.query(Medicamento).filter(
                Medicamento.id == med_id, Medicamento.usuario_id == usuario_id
            ).first()
            if not med:
                raise HTTPException(status_code=404, detail="Medicamento não encontrado")
            session.delete(med)
            session.commit()
            return {"ok": True}
        finally:
            session.close()


def _med_dict(m):
    return {
        "id": m.id, "nome": m.nome, "dosagem": m.dosagem, "via": m.via,
        "observacoes": m.observacoes, "horarios": m.horarios,
        "frequencia": m.frequencia,
        "data_inicio": str(m.data_inicio) if m.data_inicio else None,
        "data_fim": str(m.data_fim) if m.data_fim else None,
        "criado_em": str(m.criado_em) if m.criado_em else None
    }


# ─── COMPROMISSO ─────────────────────────────────────────────────────────────

class CompromissoService:

    def criar(self, usuario_id, tipo, titulo, data_hora, local, obs):
        session = Session()
        try:
            comp = Compromisso(
                usuario_id=usuario_id, tipo=tipo, titulo=titulo,
                data_hora=data_hora, local=local, obs=obs
            )
            session.add(comp)
            session.commit()
            session.refresh(comp)
            return _comp_dict(comp)
        finally:
            session.close()

    def listar(self, usuario_id, tipo=None):
        session = Session()
        try:
            q = session.query(Compromisso).filter(Compromisso.usuario_id == usuario_id)
            if tipo:
                q = q.filter(Compromisso.tipo == tipo)
            comps = q.order_by(Compromisso.data_hora.asc()).all()
            return [_comp_dict(c) for c in comps]
        finally:
            session.close()

    def obter(self, comp_id, usuario_id):
        session = Session()
        try:
            comp = session.query(Compromisso).filter(
                Compromisso.id == comp_id, Compromisso.usuario_id == usuario_id
            ).first()
            if not comp:
                raise HTTPException(status_code=404, detail="Compromisso não encontrado")
            return _comp_dict(comp)
        finally:
            session.close()

    def atualizar(self, comp_id, usuario_id, dados: dict):
        session = Session()
        try:
            comp = session.query(Compromisso).filter(
                Compromisso.id == comp_id, Compromisso.usuario_id == usuario_id
            ).first()
            if not comp:
                raise HTTPException(status_code=404, detail="Compromisso não encontrado")
            for k, v in dados.items():
                if v is not None and hasattr(comp, k):
                    setattr(comp, k, v)
            session.commit()
            session.refresh(comp)
            return _comp_dict(comp)
        finally:
            session.close()

    def excluir(self, comp_id, usuario_id):
        session = Session()
        try:
            comp = session.query(Compromisso).filter(
                Compromisso.id == comp_id, Compromisso.usuario_id == usuario_id
            ).first()
            if not comp:
                raise HTTPException(status_code=404, detail="Compromisso não encontrado")
            session.delete(comp)
            session.commit()
            return {"ok": True}
        finally:
            session.close()


def _comp_dict(c):
    return {
        "id": c.id, "tipo": c.tipo, "titulo": c.titulo,
        "data_hora": str(c.data_hora) if c.data_hora else None,
        "local": c.local, "obs": c.obs,
        "criado_em": str(c.criado_em) if c.criado_em else None
    }


# ─── ANOTACAO ────────────────────────────────────────────────────────────────

class AnotacaoService:

    def criar(self, usuario_id, texto):
        session = Session()
        try:
            anot = AnotacaoMedica(usuario_id=usuario_id, texto=texto)
            session.add(anot)
            session.commit()
            session.refresh(anot)
            return _anot_dict(anot)
        finally:
            session.close()

    def listar(self, usuario_id):
        session = Session()
        try:
            anots = session.query(AnotacaoMedica).filter(
                AnotacaoMedica.usuario_id == usuario_id
            ).order_by(AnotacaoMedica.criado_em.desc()).all()
            return [_anot_dict(a) for a in anots]
        finally:
            session.close()

    def atualizar(self, anot_id, usuario_id, texto):
        session = Session()
        try:
            anot = session.query(AnotacaoMedica).filter(
                AnotacaoMedica.id == anot_id, AnotacaoMedica.usuario_id == usuario_id
            ).first()
            if not anot:
                raise HTTPException(status_code=404, detail="Anotação não encontrada")
            anot.texto = texto
            session.commit()
            session.refresh(anot)
            return _anot_dict(anot)
        finally:
            session.close()

    def excluir(self, anot_id, usuario_id):
        session = Session()
        try:
            anot = session.query(AnotacaoMedica).filter(
                AnotacaoMedica.id == anot_id, AnotacaoMedica.usuario_id == usuario_id
            ).first()
            if not anot:
                raise HTTPException(status_code=404, detail="Anotação não encontrada")
            session.delete(anot)
            session.commit()
            return {"ok": True}
        finally:
            session.close()


def _anot_dict(a):
    return {
        "id": a.id, "texto": a.texto,
        "criado_em": str(a.criado_em) if a.criado_em else None
    }


# ─── NOTIFICACAO ──────────────────────────────────────────────────────────────

class NotificacaoService:

    def listar(self, usuario_id):
        session = Session()
        try:
            notifs = session.query(Notificacao).filter(
                Notificacao.usuario_id == usuario_id
            ).order_by(Notificacao.data_hora.asc()).all()
            return [_notif_dict(n) for n in notifs]
        finally:
            session.close()


def _notif_dict(n):
    return {
        "id": n.id, "titulo": n.titulo, "mensagem": n.mensagem,
        "data_hora": str(n.data_hora) if n.data_hora else None,
        "status": n.status, "origem_tipo": n.origem_tipo
    }
