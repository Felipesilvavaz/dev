# models.py - AgendaMed
from sqlalchemy import create_engine, Column, String, Date, DateTime, ForeignKey, Text, Time
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import uuid
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://agendamed:agendamed123@localhost:5432/agendamed")

engine = create_engine(DATABASE_URL)
Base = declarative_base()
Session = sessionmaker(bind=engine)


class Usuario(Base):
    __tablename__ = 'usuarios'
    id       = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome     = Column(String, nullable=False)
    email    = Column(String, unique=True, nullable=False)
    senha    = Column(String, nullable=False)
    telefone = Column(String)
    criado_em = Column(DateTime, default=datetime.utcnow)

    medicamentos = relationship("Medicamento", back_populates="usuario", cascade="all, delete")
    compromissos = relationship("Compromisso", back_populates="usuario", cascade="all, delete")
    anotacoes    = relationship("AnotacaoMedica", back_populates="usuario", cascade="all, delete")
    notificacoes = relationship("Notificacao", back_populates="usuario", cascade="all, delete")


class Medicamento(Base):
    __tablename__ = 'medicamentos'
    id           = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id   = Column(String, ForeignKey('usuarios.id'), nullable=False)
    nome         = Column(String, nullable=False)
    dosagem      = Column(String)
    via          = Column(String)
    observacoes  = Column(Text)
    horarios     = Column(String)   # "08:00,20:00"
    frequencia   = Column(String)   # "12h", "8h", "24h"
    data_inicio  = Column(Date)
    data_fim     = Column(Date)
    criado_em    = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="medicamentos")


class Compromisso(Base):
    __tablename__ = 'compromissos'
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id = Column(String, ForeignKey('usuarios.id'), nullable=False)
    tipo       = Column(String, nullable=False)   # CONSULTA | EXAME
    titulo     = Column(String, nullable=False)
    data_hora  = Column(DateTime)
    local      = Column(String)
    obs        = Column(Text)
    criado_em  = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="compromissos")


class AnotacaoMedica(Base):
    __tablename__ = 'anotacoes_medicas'
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id = Column(String, ForeignKey('usuarios.id'), nullable=False)
    texto      = Column(Text, nullable=False)
    criado_em  = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="anotacoes")


class Notificacao(Base):
    __tablename__ = 'notificacoes'
    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    usuario_id  = Column(String, ForeignKey('usuarios.id'), nullable=False)
    titulo      = Column(String)
    mensagem    = Column(String)
    data_hora   = Column(DateTime)
    status      = Column(String, default='PENDENTE')  # PENDENTE | ENVIADA | DESCARTADA
    origem_tipo = Column(String)   # DOSE | COMPROMISSO
    origem_id   = Column(String)
    criado_em   = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="notificacoes")


def criar_tabelas():
    Base.metadata.create_all(engine)
