import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, registrar as apiRegistrar, me as apiMe } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario]     = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@agendamed_token');
    if (token) {
      apiMe().then(setUsuario).catch(() => localStorage.removeItem('@agendamed_token')).finally(() => setCarregando(false));
    } else {
      setCarregando(false);
    }
  }, []);

  async function login(email, senha) {
    const res = await apiLogin({ email, senha });
    localStorage.setItem('@agendamed_token', res.token);
    setUsuario(res.usuario);
    return res;
  }

  async function registrar(nome, email, senha, telefone) {
    const res = await apiRegistrar({ nome, email, senha, telefone });
    localStorage.setItem('@agendamed_token', res.token);
    setUsuario(res.usuario);
    return res;
  }

  function logout() {
    localStorage.removeItem('@agendamed_token');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
