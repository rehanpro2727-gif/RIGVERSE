// RIGVERSE — Session Store (Zustand)
// Manages guest and authenticated user sessions, authentication tokens,
// and session persistence across reloads.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GUEST_SESSION_STORAGE_KEY, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, GUEST_COOKIE } from '@shared/types/constants';
import { User, UserPreferences, Session } from '@/models/user';
import { Build, BuildComponent } from '@/models/build';
import { ComponentCategory, BuildStage, BuildVisibility, RoomTheme } from '@shared/types';

interface SessionStoreState {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  guestId: string | null;

  // Build sessions
  currentBuild: Build | null;
  savedBuilds: Build[];
  pendingBuilds: Build[];

  // Token storage (encrypted in production)
  accessToken: string | null;
  refreshToken: string | null;

  // Loading & error state
  isLoading: boolean;
  loadingMessages: Record<string, string>;
  error: string | null | undefined;

  // Actions
  login(email: string, password: string): Promise<User>;
  loginWithGoogle(): Promise<User>;
  logout(): void;
  refreshAccessToken(): Promise<string | null>;
  setGuestSession(): void;
  hydrateSession(): Promise<void>;
  saveBuild(build: Build): Promise<Build>;
  loadBuild(buildId: string): Promise<Build>;
  deleteBuild(buildId: string): Promise<void>;
  setCurrentBuild(build: Build | null): void;
}

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      session: null,
      guestId: null,

      currentBuild: null,
      savedBuilds: [],
      pendingBuilds: [],

      accessToken: null,
      refreshToken: null,

      isLoading: false,
      loadingMessages: {},
      error: null,

      login: async (email, password) => {
        set({ ...get(), isLoading: true, loadingMessages: { ...get().loadingMessages, auth: 'Signing in...' } });
        try {
          // In production: call API /api/v1/auth/login
          const user = await simulateLogin(email, password);
          const session = await createSession(user);
          set({
            ...get(),
            isAuthenticated: true,
            user,
            session,
            accessToken: session.accessToken ?? '',
            refreshToken: session.refreshToken ?? '',
          });
          return user;
        } catch (e) {
          set({ ...get(), error: 'Authentication failed' });
          throw e;
        } finally {
          set({ ...get(), isLoading: false, loadingMessages: { ...get().loadingMessages, ...(get().loadingMessages && { auth: undefined } as any) } });
        }
      },

      loginWithGoogle: async () => {
        set({ ...get(), isLoading: true, loadingMessages: { ...get().loadingMessages, auth: 'Signing in with Google...' } });
        try {
          // In production: call API /api/v1/auth/google
          const user = await simulateGoogleLogin();
          const session = await createSession(user);
          set({
            ...get(),
            isAuthenticated: true,
            user,
            session,
            accessToken: session.accessToken ?? '',
            refreshToken: session.refreshToken ?? '',
          });
          return user;
        } catch (e) {
          set({ ...get(), error: 'Google authentication failed' });
          throw e;
        } finally {
          set({ ...get(), isLoading: false, loadingMessages: { ...get().loadingMessages, ...(get().loadingMessages && { auth: undefined } as any) } });
        }
      },

      logout() {
        set({
          ...get(),
          isAuthenticated: false,
          user: null,
          session: null,
          accessToken: null,
          refreshToken: null,
          currentBuild: null,
        });
        // Clear from cookies/server session
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return null;
        try {
          // In production: call API /api/v1/auth/refresh
          const newAccessToken = await simulateRefreshToken(refreshToken);
          set({
            ...get(),
            accessToken: newAccessToken,
          });
          return newAccessToken;
        } catch (e) {
          set({ ...get(), error: 'Token refresh failed' });
          return null;
        }
      },

      setGuestSession() {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        set({
          ...get(),
          guestId,
          isAuthenticated: false,
        });
        localStorage.setItem(GUEST_COOKIE, guestId);
      },

      hydrateSession: async () => {
        set({ ...get(), isLoading: true, loadingMessages: { ...get().loadingMessages, session: 'Hydrating session...' } });
        try {
          const guestId = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
          const user = guestId ? (() => { const { id, ...rest } = guestUser; return { id: guestId, ...rest }; })() : null;
          const session = guestId ? await createSession(user || guestUser) : null;
          set({
            ...get(),
            isAuthenticated: !!user,
            user,
            session,
            currentBuild: null,
            accessToken: session?.accessToken ?? '',
            refreshToken: session?.refreshToken ?? '',
          });
        } catch (e) {
          set({ ...get(), error: 'Session hydration failed' });
        } finally {
          set({ ...get(), isLoading: false, loadingMessages: { ...get().loadingMessages, session: undefined as any } });
        }
      },

      saveBuild: async (build) => {
        try {
          // In production: PATCH /api/v1/builds/{buildId}
          const saved = await simulateSaveBuild(build);
          set({
            ...get(),
            currentBuild: saved,
            savedBuilds: [saved, ...get().savedBuilds.filter((b) => b.id !== saved.id)],
          });
          return saved;
        } catch (e) {
          set({ ...get(), error: 'Failed to save build' });
          throw e;
        }
      },

      loadBuild: async (buildId) => {
        try {
          // In production: GET /api/v1/builds/{buildId}
          const build = await simulateLoadBuild(buildId);
          set({ ...get(), currentBuild: build });
          return build;
        } catch (e) {
          set({ ...get(), error: 'Failed to load build' });
          throw e;
        }
      },

      deleteBuild: async (buildId) => {
        try {
          // In production: DELETE /api/v1/builds/{buildId}
          await simulateDeleteBuild(buildId);
          set({
            ...get(),
            savedBuilds: get().savedBuilds.filter((b) => b.id !== buildId),
          });
        } catch (e) {
          set({ ...get(), error: 'Failed to delete build' });
          throw e;
        }
      },

      setCurrentBuild(build) {
        set({ ...get(), currentBuild: build });
      },
    }),
    {
      name: 'rigverse-session',
      getStorage: () => localStorage,
      partialize: (state) => ({
        guestId: state.guestId,
        savedBuilds: state.savedBuilds,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// --- Simulation helpers (replace with actual API calls) ---
async function simulateLogin(email: string, password: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    id: `user_${Date.now()}`,
    email,
    displayName: email.split('@')[0],
    role: 'USER',
    preferences: {
      theme: 'dark',
      currency: 'INR',
      region: 'IN',
      reducedMotion: false,
      autoSaveBuilds: true,
      emailAlerts: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function simulateGoogleLogin(): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    id: `google_${Date.now()}`,
    email: 'user@gmail.com',
    googleId: 'google_123',
    displayName: 'Google User',
    avatarUrl: '/assets/avatars/google.png',
    role: 'USER',
    preferences: {
      theme: 'dark',
      currency: 'INR',
      region: 'IN',
      reducedMotion: false,
      autoSaveBuilds: true,
      emailAlerts: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function createSession(user: User): Promise<Session> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const accessToken = `access_${Date.now()}`;
  const refreshToken = `refresh_${Date.now()}`;
  return {
    user,
    accessToken,
    refreshToken,
    expiresAt: Date.now() + 3600000, // 1 hour
  };
}

async function simulateRefreshToken(refreshToken: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return `access_${Date.now()}`;
}

const guestUser: User = {
  id: 'guest',
  email: 'guest@rigverse.local',
  displayName: 'Guest Builder',
  role: 'USER',
  preferences: {
    theme: 'dark',
    currency: 'INR',
    region: 'IN',
    reducedMotion: false,
    autoSaveBuilds: true,
    emailAlerts: false,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function simulateSaveBuild(build: Build): Promise<Build> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    ...build,
    updatedAt: new Date(),
  };
}

async function simulateLoadBuild(buildId: string): Promise<Build> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const emptyComp: Record<ComponentCategory, BuildComponent | null> = {
    [ComponentCategory.CPU]: null,
    [ComponentCategory.GPU]: null,
    [ComponentCategory.MOTHERBOARD]: null,
    [ComponentCategory.RAM]: null,
    [ComponentCategory.STORAGE]: null,
    [ComponentCategory.CASE]: null,
    [ComponentCategory.PSU]: null,
    [ComponentCategory.COOLING]: null,
  };
  return {
    id: buildId,
    title: 'Saved Build',
    stage: BuildStage.FORGE,
    visibility: BuildVisibility.PRIVATE,
    components: emptyComp,
    accessories: [],
    totals: { componentPrice: 0, accessoryPrice: 0, subtotal: 0, shipping: 0, total: 0, savingsVsMrp: 0, breakdown: {} },
    sceneState: {
      cameraPosition: [0, 0.9, 2.4],
      cameraTarget: [0, 0.45, 0],
      ambientIntensity: 0.35,
      decorItems: [],
      roomTheme: RoomTheme.DARK,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function simulateDeleteBuild(buildId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
}

export type SessionStore = ReturnType<typeof useSessionStore>;
export type { User, UserPreferences, Session, Build }; // Re-export for convenience