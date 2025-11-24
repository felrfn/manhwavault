import React, { createContext, useContext, useCallback, useState } from "react";
import { loginRequest, registerRequest, fetchMe } from "../lib/api/auth";

interface User {
  id: string;
  username: string;
  displayName?: string | null;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string, d?: string) => Promise<void>;
  logout: () => void;
  restore: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const restore = useCallback(async () => {
    setLoading(true);
    const stored = localStorage.getItem("auth_token");
    if (stored) {
      setToken(stored);
      try {
        const me = await fetchMe(stored);
        setUser(me);
      } catch {
        localStorage.removeItem("auth_token");
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  async function login(u: string, p: string) {
    const { token } = await loginRequest(u, p);
    localStorage.setItem("auth_token", token);
    setToken(token);
    const me = await fetchMe(token);
    setUser(me);
  }

  async function register(u: string, p: string, d?: string) {
    await registerRequest(u, p, d);
    await login(u, p);
  }

  function logout() {
    localStorage.removeItem("auth_token");
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, restore }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
