import { create } from 'zustand';

const STORAGE_KEY = 'taskteam-auth';

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

function writeStoredAuth(state) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: state.user,
      token: state.token
    })
  );
}

function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

const storedAuth = readStoredAuth();

export const useAuthStore = create((set) => ({
  user: storedAuth.user,
  token: storedAuth.token,
  role: storedAuth.user?.role || null,
  login: ({ user, token }) => {
    const nextState = {
      user,
      token,
      role: user.role
    };

    writeStoredAuth(nextState);
    set(nextState);
  },
  setUser: (user) => {
    set((state) => {
      const nextState = {
        ...state,
        user,
        role: user?.role || null
      };
      writeStoredAuth(nextState);
      return nextState;
    });
  },
  logout: () => {
    clearStoredAuth();
    set({ user: null, token: null, role: null });
  }
}));
