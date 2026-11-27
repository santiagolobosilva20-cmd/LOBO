import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  getAuthToken,
  requestJson,
  setAuthToken,
  setUnauthorizedHandler,
} from '../../shared/api/http';
import type {
  AuthSessionPayload,
  AuthUser,
  SingleResponse,
  UserRole,
} from '../../shared/api/types';

interface AuthContextValue {
  user: AuthUser | null;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  registerMember: (name: string, email: string, password: string) => Promise<AuthUser>;
  demoLogin: (role: UserRole) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState<boolean>(() => getAuthToken() !== null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      queryClient.clear();
    });

    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsHydrating(false);
      return;
    }

    let cancelled = false;
    requestJson<SingleResponse<AuthUser>>('/auth/me')
      .then((res) => {
        if (!cancelled) {
          setUser(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsHydrating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = useCallback(
    (payload: AuthSessionPayload): AuthUser => {
      setAuthToken(payload.token);
      setUser(payload.user);
      queryClient.clear();
      return payload.user;
    },
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const res = await requestJson<SingleResponse<AuthSessionPayload>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return applySession(res.data);
    },
    [applySession],
  );

  const registerMember = useCallback(
    async (name: string, email: string, password: string): Promise<AuthUser> => {
      const res = await requestJson<SingleResponse<AuthSessionPayload>>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      return applySession(res.data);
    },
    [applySession],
  );

  const demoLogin = useCallback(
    async (role: UserRole): Promise<AuthUser> => {
      const res = await requestJson<SingleResponse<AuthSessionPayload>>('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      return applySession(res.data);
    },
    [applySession],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await requestJson<void>('/auth/logout', { method: 'POST' });
    } catch {
      // Clear local session regardless of server response
    } finally {
      setAuthToken(null);
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isHydrating,
        login,
        registerMember,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

