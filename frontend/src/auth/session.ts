export interface AuthUser {
  id: string;
  username: string;
  display_name: string;
  email: string;
  role: string;
  is_guest: boolean;
  auth_type: 'frontpage' | 'guest';
}

interface FrontpageStoredUser {
  id?: string | number;
  username?: string;
  display_name?: string;
  email?: string;
  role?: string;
}

interface FrontpageTokenPayload {
  sub?: string | number;
  user_id?: string | number;
  email?: string;
  username?: string;
  display_name?: string;
  role?: string;
  roles?: string[];
}

interface FrontpageStoredAuth {
  token?: string;
  user?: FrontpageStoredUser | null;
}

interface GuestStoredSession {
  token: string;
  user: AuthUser;
}

const FRONTPAGE_AUTH_STORAGE_KEY = 'auth-storage';
const GUEST_AUTH_STORAGE_KEY = 'adventurer-guild-guest-session';
const LEGACY_GAME_STORAGE_KEY = 'adventurer-guild';
const GAME_STORAGE_PREFIX = 'adventurer-guild::';

const getStorage = (): Storage | null => {
  return typeof localStorage === 'undefined' ? null : localStorage;
};

const parseJson = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const normalizeString = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeId = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
};

const decodeJwtPayload = (token: string): FrontpageTokenPayload | null => {
  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as FrontpageTokenPayload;
  } catch {
    return null;
  }
};

const createGuestId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `guest_${crypto.randomUUID()}`;
  }

  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const readFrontpageSession = (): { token: string; user: AuthUser } | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const parsed = parseJson<{ state?: FrontpageStoredAuth }>(storage.getItem(FRONTPAGE_AUTH_STORAGE_KEY));

  const token = normalizeString(parsed?.state?.token);
  if (!token) {
    return null;
  }

  const tokenPayload = decodeJwtPayload(token);
  const user = parsed?.state?.user ?? {};
  const id = normalizeId(user.id) || normalizeId(tokenPayload?.sub) || normalizeId(tokenPayload?.user_id);
  const email = normalizeString(user.email) || normalizeString(tokenPayload?.email);
  const username = normalizeString(user.username) || normalizeString(tokenPayload?.username);
  const displayName =
    normalizeString(user.display_name) || normalizeString(tokenPayload?.display_name) || username || `Guild Member ${id.slice(0, 6)}`;
  const role = normalizeString(user.role) || normalizeString(tokenPayload?.role) || normalizeString(tokenPayload?.roles?.[0]);

  return {
    token,
    user: {
      id,
      username: username || displayName,
      display_name: displayName,
      email,
      role: role || 'user',
      is_guest: false,
      auth_type: 'frontpage',
    },
  };
};

export const readGuestSession = (): { token: string; user: AuthUser } | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const parsed = parseJson<GuestStoredSession>(storage.getItem(GUEST_AUTH_STORAGE_KEY));
  if (!parsed?.token || !parsed?.user?.id) {
    return null;
  }

  return {
    token: parsed.token,
    user: {
      ...parsed.user,
      is_guest: true,
      auth_type: 'guest',
    },
  };
};

export const createGuestPlaceholder = (): { token: string; user: AuthUser } => {
  const id = createGuestId();
  return {
    token: `guest-pending.${id}`,
    user: {
      id,
      username: 'guest',
      display_name: 'Guest Adventurer',
      email: '',
      role: 'guest',
      is_guest: true,
      auth_type: 'guest',
    },
  };
};

export const saveGuestSession = (session: { token: string; user: AuthUser }): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(GUEST_AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearGuestSession = (): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(GUEST_AUTH_STORAGE_KEY);
};

export const getActiveSession = (): { token: string; user: AuthUser } | null => {
  return readFrontpageSession() ?? readGuestSession();
};

export const getActiveToken = (): string | null => {
  return getActiveSession()?.token ?? null;
};

export const getActiveGameStorageKey = (): string | null => {
  const session = getActiveSession();
  if (!session?.user?.id) {
    return null;
  }

  return `${GAME_STORAGE_PREFIX}${session.user.id}`;
};

export const getLegacyGameStorageKey = (): string => LEGACY_GAME_STORAGE_KEY;

export const copyGameStorage = (sourceKey: string, targetKey: string): boolean => {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  if (!sourceKey || !targetKey || sourceKey === targetKey) {
    return false;
  }

  const existing = storage.getItem(sourceKey);
  if (!existing) {
    return false;
  }

  storage.setItem(targetKey, existing);
  return true;
};

export const moveGameStorage = (sourceKey: string, targetKey: string): boolean => {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  const copied = copyGameStorage(sourceKey, targetKey);
  if (copied) {
    storage.removeItem(sourceKey);
  }

  return copied;
};

export const withRedirectParam = (basePath: string): string => {
  if (typeof window === 'undefined') {
    return basePath;
  }

  try {
    const url = new URL(basePath, window.location.origin);
    url.searchParams.set('redirect', window.location.href);
    return url.toString();
  } catch {
    return basePath;
  }
};

export const appendGuestUserId = (baseUrl: string, guestUserId: string): string => {
  if (typeof window === 'undefined') {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('guest_user_id', guestUserId);
    return url.toString();
  } catch {
    return baseUrl;
  }
};

export const getLoginUrl = (): string => {
  const configured = import.meta.env.VITE_WEB_HATCHERY_LOGIN_URL || '/login';
  return withRedirectParam(configured);
};

export const getSignupUrl = (): string => {
  const configured = import.meta.env.VITE_WEB_HATCHERY_SIGNUP_URL || '/signup';
  return withRedirectParam(configured);
};

export const getApiBaseUrl = (): string => {
  const configured = normalizeString(import.meta.env.VITE_API_BASE_URL);
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const baseUrl = normalizeString(import.meta.env.BASE_URL);
  if (!baseUrl || baseUrl === '/') {
    return '';
  }

  return baseUrl.replace(/\/$/, '');
};

export const getSessionUrl = (): string => `${getApiBaseUrl()}/api/auth/session`;

export const getGuestSessionUrl = (): string => `${getApiBaseUrl()}/api/auth/guest-session`;

export const getLinkGuestUrl = (): string => `${getApiBaseUrl()}/api/auth/link-guest`;

export const readGuestUserIdFromUrl = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const url = new URL(window.location.href);
    const value = normalizeString(url.searchParams.get('guest_user_id'));
    return value || null;
  } catch {
    return null;
  }
};

export const removeGuestUserIdFromUrl = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('guest_user_id');
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Ignore URL cleanup failures.
  }
};
