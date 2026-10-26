import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('workbridge_user') || 'null'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('workbridge_token')));

  useEffect(() => {
    if (!localStorage.getItem('workbridge_token')) return setLoading(false);
    api('/auth/me').then(({ user: currentUser }) => {
      setUser(currentUser); localStorage.setItem('workbridge_user', JSON.stringify(currentUser));
    }).catch(() => {
      localStorage.removeItem('workbridge_token'); localStorage.removeItem('workbridge_user'); setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const completeAuth = ({ token, user: nextUser }) => {
    localStorage.setItem('workbridge_token', token); localStorage.setItem('workbridge_user', JSON.stringify(nextUser)); setUser(nextUser);
  };
  const logout = () => { localStorage.removeItem('workbridge_token'); localStorage.removeItem('workbridge_user'); setUser(null); };
  const updateUser = (nextUser) => { localStorage.setItem('workbridge_user', JSON.stringify(nextUser)); setUser(nextUser); };
  return <AuthContext.Provider value={{ user, loading, completeAuth, logout, updateUser }}>{children}</AuthContext.Provider>;
}

