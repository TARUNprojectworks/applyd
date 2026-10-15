import { createContext, useContext, useState } from 'react';

// Context lets any component read the logged-in user without passing props down
const AuthContext = createContext(null);

// Reads the saved user from localStorage when the app first loads
function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);

  // Called after a successful login/register
  function login(token, userData) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// Small helper hook: const { user, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
