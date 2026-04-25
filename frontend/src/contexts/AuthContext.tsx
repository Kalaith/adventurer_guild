import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  appendGuestUserId,
  AuthUser,
  clearGuestSession,
  getActiveGameStorageKey,
  getActiveSession,
  getLinkGuestUrl,
  getGuestSessionUrl,
  getLegacyGameStorageKey,
  getLoginUrl,
  getSessionUrl,
  getSignupUrl,
  moveGameStorage,
  readFrontpageSession,
  readGuestSession,
  readGuestUserIdFromUrl,
  removeGuestUserIdFromUrl,
  saveGuestSession,
} from '../auth/session';
import { rehydrateGuildStore } from '../stores/gameStore';

type AuthMode = 'frontpage' | 'guest' | null;

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  authMode: AuthMode;
  error: string | null;
  continueAsGuest: () => Promise<void>;
  loginWithRedirect: () => void;
  getLinkAccountUrl: () => string;
  logout: () => void;
}

interface SessionResponse {
  success: boolean;
  error?: string;
  message?: string;
  login_url?: string;
  data?: {
    token?: string;
    user?: AuthUser;
    linked?: boolean;
    guest_user_id?: string;
    linked_to_user_id?: string;
    moved_rows_by_table?: Record<string, number>;
    total_moved_rows?: number;
  };
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  authMode: null,
  error: null,
  continueAsGuest: async () => undefined,
  loginWithRedirect: () => undefined,
  getLinkAccountUrl: () => '/signup',
  logout: () => undefined,
});

export const useAuth = (): AuthContextValue => useContext(AuthContext);

const parseJson = async <T,>(response: Response): Promise<T | null> => {
  const raw = await response.text();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeStorageKeyRef = useRef<string | null>(null);
  const hasAttemptedLinkRef = useRef(false);

  const rehydrateForCurrentSession = useCallback(async () => {
    const nextKey = getActiveGameStorageKey();
    if (activeStorageKeyRef.current !== nextKey) {
      activeStorageKeyRef.current = nextKey;
      await rehydrateGuildStore();
    }
  }, []);

  const validateStoredSession = useCallback(async (): Promise<void> => {
    const activeSession = getActiveSession();
    if (!activeSession?.token) {
      setUser(null);
      setAuthMode(null);
      await rehydrateForCurrentSession();
      return;
    }

    const response = await fetch(getSessionUrl(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${activeSession.token}`,
      },
    });

    const result = await parseJson<SessionResponse>(response);
    if (!response.ok || !result?.success || !result.data?.user) {
      if (activeSession.user.is_guest) {
        clearGuestSession();
      }
      setUser(null);
      setAuthMode(null);
      throw new Error(result?.message || result?.error || `Session validation failed (${response.status})`);
    }

    setUser(result.data.user);
    setAuthMode(result.data.user.auth_type);
    await rehydrateForCurrentSession();
  }, [rehydrateForCurrentSession]);

  const syncFromStorage = useCallback(async () => {
    try {
      await validateStoredSession();
      setError(null);
    } catch (sessionError) {
      setError(sessionError instanceof Error ? sessionError.message : 'Failed to validate session');
    }
  }, [validateStoredSession]);

  const continueAsGuest = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const existing = readGuestSession();
      if (existing) {
        await syncFromStorage();
        return;
      }

      const response = await fetch(getGuestSessionUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await parseJson<SessionResponse>(response);
      if (!response.ok || !result?.success || !result.data?.token || !result.data.user) {
        throw new Error(result?.message || result?.error || `Failed to create guest session (${response.status})`);
      }

      saveGuestSession({
        token: result.data.token,
        user: {
          ...result.data.user,
          is_guest: true,
          auth_type: 'guest',
        },
      });

      const guestStorageKey = getActiveGameStorageKey();
      if (guestStorageKey) {
        moveGameStorage(getLegacyGameStorageKey(), guestStorageKey);
      }

      await syncFromStorage();
    } finally {
      setIsLoading(false);
    }
  }, [syncFromStorage]);

  const loginWithRedirect = useCallback(() => {
    setError(null);
    window.location.href = getLoginUrl();
  }, []);

  const getLinkAccountUrl = useCallback(() => {
    if (!user?.is_guest) {
      return getSignupUrl();
    }

    return appendGuestUserId(getSignupUrl(), user.id);
  }, [user]);

  const logout = useCallback(() => {
    if (authMode === 'guest') {
      clearGuestSession();
      void syncFromStorage();
      return;
    }

    window.location.href = getLoginUrl();
  }, [authMode, syncFromStorage]);

  useEffect(() => {
    void syncFromStorage().finally(() => setIsLoading(false));
  }, [syncFromStorage]);

  useEffect(() => {
    const handleStorage = () => {
      void syncFromStorage();
    };

    const handleLoginRequired = () => {
      setError('Authentication is required to access live API routes.');
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('webhatchery:login-required', handleLoginRequired as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('webhatchery:login-required', handleLoginRequired as EventListener);
    };
  }, [syncFromStorage]);

  useEffect(() => {
    const guestUserId = readGuestUserIdFromUrl();
    const frontpageSession = readFrontpageSession();
    const guestSession = readGuestSession();

    if (!guestUserId || hasAttemptedLinkRef.current) {
      return;
    }

    if (!frontpageSession?.token || !guestSession?.user?.id || guestSession.user.id !== guestUserId) {
      return;
    }

    hasAttemptedLinkRef.current = true;

    (async () => {
      try {
        const response = await fetch(getLinkGuestUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${frontpageSession.token}`,
          },
          body: JSON.stringify({ guest_user_id: guestUserId }),
        });

        const result = await parseJson<SessionResponse>(response);
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || result?.error || `Failed to link guest progress (${response.status})`);
        }

        const frontpageStorageKey = `adventurer-guild::${frontpageSession.user.id}`;
        const guestStorageKey = `adventurer-guild::${guestUserId}`;
        moveGameStorage(guestStorageKey, frontpageStorageKey);
        clearGuestSession();
        setError(null);
      } catch (linkError) {
        setError(linkError instanceof Error ? linkError.message : 'Failed to link guest progress');
      } finally {
        removeGuestUserIdFromUrl();
        await syncFromStorage();
      }
    })();
  }, [syncFromStorage]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      user,
      authMode,
      error,
      continueAsGuest,
      loginWithRedirect,
      getLinkAccountUrl,
      logout,
    }),
    [authMode, continueAsGuest, error, getLinkAccountUrl, isLoading, loginWithRedirect, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
