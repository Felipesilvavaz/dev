# main.py - AgendaMed API
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from services import UsuarioService, MedicamentoService, CompromissoService, AnotacaoService, NotificacaoService
from auth import obter_usuario_token
from models import criar_tabelas

app = FastAPI(title="AgendaMed API", version="2.0.0", description="API do aplicativo AgendaMed - UniFil")

import os
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

criar_tabelas()


# ─── SCHEMAS ──────────────────────────────────────────────────────────────────

class RegistroSchema(BaseModel):
    nome: str
    email: str
    senha: str
    telefone: Optional[str] = None

class LoginSchema(BaseModel):
    email: str
    senha: str

class MedicamentoSchema(BaseModel):
    nome: str
    dosagem: Optional[str] = None
    via: Optional[str] = None
    observacoes: Optional[str] = None
    horarios: Optional[str] = None
    frequencia: Optional[str] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None

class CompromissoSchema(BaseModel):
    tipo: str
    titulo: str
    data_hora: Optional[datetime] = None
    local: Optional[str] = None
    obs: Optional[str] = None

class AnotacaoSchema(BaseModel):
    texto: str


# ─── AUTH ────────────────────────────────────────────────────────────────────

@app.post("/auth/registro", tags=["Auth"])
def registro(dados: RegistroSchema):
    return UsuarioService().registrar(dados.nome, dados.email, dados.senha, dados.telefone)

@app.post("/auth/login", tags=["Auth"])
def login(dados: LoginSchema):
    return UsuarioService().login(dados.email, dados.senha)

@app.get("/auth/me", tags=["Auth"])
def me(user_id: str = Depends(obter_usuario_token)):
    return UsuarioService().obter(user_id)


# ─── MEDICAMENTOS ─────────────────────────────────────────────────────────────

@app.get("/medicamentos", tags=["Medicamentos"])
def listar_medicamentos(user_id: str = Depends(obter_usuario_token)):
    return MedicamentoService().listar(user_id)

@app.post("/medicamentos", tags=["Medicamentos"])
def criar_medicamento(dados: MedicamentoSchema, user_id: str = Depends(obter_usuario_token)):
    return MedicamentoService().criar(
        user_id, dados.nome, dados.dosagem, dados.via,
        dados.observacoes, dados.horarios, dados.frequencia,
        dados.data_inicio, dados.data_fim
    )

@app.get("/medicamentos/{med_id}", tags=["Medicamentos"])
def obter_medicamento(med_id: str, user_id: str = Depends(obter_usuario_token)):
    return MedicamentoService().obter(med_id, user_id)

@app.put("/medicamentos/{med_id}", tags=["Medicamentos"])
def atualizar_medicamento(med_id: str, dados: MedicamentoSchema, user_id: str = Depends(obter_usuario_token)):
    return MedicamentoService().atualizar(med_id, user_id, dados.dict(exclude_none=True))

@app.delete("/medicamentos/{med_id}", tags=["Medicamentos"])
def excluir_medicamento(med_id: str, user_id: str = Depends(obter_usuario_token)):
    return MedicamentoService().excluir(med_id, user_id)


# ─── COMPROMISSOS (CONSULTAS E EXAMES) ───────────────────────────────────────

@app.get("/compromissos", tags=["Compromissos"])
def listar_compromissos(tipo: Optional[str] = None, user_id: str = Depends(obter_usuario_token)):
    return CompromissoService().listar(user_id, tipo)

@app.post("/compromissos", tags=["Compromissos"])
def criar_compromisso(dados: CompromissoSchema, user_id: str = Depends(obter_usuario_token)):
    return CompromissoService().criar(
        user_id, dados.tipo, dados.titulo, dados.data_hora, dados.local, dados.obs
    )

@app.get("/compromissos/{comp_id}", tags=["Compromissos"])
def obter_compromisso(comp_id: str, user_id: str = Depends(obter_usuario_token)):
    return CompromissoService().obter(comp_id, user_id)

@app.put("/compromissos/{comp_id}", tags=["Compromissos"])
def atualizar_compromisso(comp_id: str, dados: CompromissoSchema, user_id: str = Depends(obter_usuario_token)):
    return CompromissoService().atualizar(comp_id, user_id, dados.dict(exclude_none=True))

@app.delete("/compromissos/{comp_id}", tags=["Compromissos"])
def excluir_compromisso(comp_id: str, user_id: str = Depends(obter_usuario_token)):
    return CompromissoService().excluir(comp_id, user_id)


# ─── ANOTAÇÕES ───────────────────────────────────────────────────────────────

@app.get("/anotacoes", tags=["Anotações"])
def listar_anotacoes(user_id: str = Depends(obter_usuario_token)):
    return AnotacaoService().listar(user_id)

@app.post("/anotacoes", tags=["Anotações"])
def criar_anotacao(dados: AnotacaoSchema, user_id: str = Depends(obter_usuario_token)):
    return AnotacaoService().criar(user_id, dados.texto)

@app.put("/anotacoes/{anot_id}", tags=["Anotações"])
def atualizar_anotacao(anot_id: str, dados: AnotacaoSchema, user_id: str = Depends(obter_usuario_token)):
    return AnotacaoService().atualizar(anot_id, user_id, dados.texto)

@app.delete("/anotacoes/{anot_id}", tags=["Anotações"])
def excluir_anotacao(anot_id: str, user_id: str = Depends(obter_usuario_token)):
    return AnotacaoService().excluir(anot_id, user_id)


# ─── NOTIFICAÇÕES ────────────────────────────────────────────────────────────

@app.get("/notificacoes", tags=["Notificações"])
def listar_notificacoes(user_id: str = Depends(obter_usuario_token)):
    return NotificacaoService().listar(user_id)


# ─── HEALTH ──────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "app": "AgendaMed", "versao": "2.0.0"}
