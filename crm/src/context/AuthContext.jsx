import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001/api'
  : (import.meta.env.VITE_API_BASE_URL || 'https://athena-backend-hu1m.onrender.com/api');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('athena_crm_token') || '');
  const [loading, setLoading] = useState(true);

  // Parse JWT token payload safely
  const parseJwt = (tokenStr) => {
    try {
      const base64Url = tokenStr.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        // Verifica se tem papel com permissão comercial
        const role = decoded.role || 'staff';
        setUser({
          id: decoded.id || decoded.userId,
          name: decoded.name || 'Membro da Equipe',
          email: decoded.email,
          role,
          mustChangePassword: Boolean(decoded.mustChangePassword)
        });
      } else {
        // Token expirado
        localStorage.removeItem('athena_crm_token');
        setToken('');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Credenciais inválidas.');
      }

      const receivedToken = data.token;
      const decoded = parseJwt(receivedToken);

      // Verificação de segurança: apenas admin, vendedor, staff ou operacoes podem entrar no CRM
      const role = (decoded?.role || data.user?.role || '').toLowerCase();
      const isAllowed = ['admin', 'vendedor', 'staff', 'operacoes', 'edicao', 'editor'].includes(role);

      if (!isAllowed) {
        throw new Error('Acesso negado. Apenas membros da equipe comercial ou administradores podem acessar o CRM.');
      }

      const mustChange = Boolean(data.mustChangePassword || decoded?.mustChangePassword);

      localStorage.setItem('athena_crm_token', receivedToken);
      setToken(receivedToken);
      setUser({
        id: decoded?.id || data.id || data.user?.id,
        name: data.name || data.user?.name || decoded?.name || 'Membro da Equipe',
        email: data.email || data.user?.email || decoded?.email,
        role,
        mustChangePassword: mustChange
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const clearMustChangePassword = () => {
    setUser(prev => prev ? { ...prev, mustChangePassword: false } : null);
  };

  const logout = () => {
    localStorage.removeItem('athena_crm_token');
    setToken('');
    setUser(null);
  };

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      clearMustChangePassword,
      getAuthHeaders,
      API_BASE_URL
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
