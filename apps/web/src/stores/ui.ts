// RIGVERSE — UI Store (Zustand)
// Manages UI state: theme, modals, toasts, notifications, mobile/responsive
// breakpoints, and any other global UI flags.

import { ReactNode } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BuildStage, RoomTheme } from '@shared/types';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  timestamp: number;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  actions?: NotificationAction[];
  duration: number;
  timestamp: number;
}

interface UIStoreState {
  // Theme & Presentation
  stage: BuildStage;
  theme: 'dark' | 'light' | 'system';
  roomTheme: RoomTheme;
  reducedMotion: boolean;
  fullscreen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Modals & Overlays
  activeModal: string | null;
  modals: Record<string, Record<string, unknown> | undefined>;
  overlayStack: string[]; // ['build-summary', 'compatibility-report', etc.]

  // Notifications
  toasts: Toast[];
  notifications: Notification[];

  // Loading & Status
  isLoading: boolean;
  loadingMessages: Record<string, string>;
  error: string | null;

  // Drawer (BottomDrawer / Expanded Details)
  isDrawerOpen: boolean;
  drawerContent: ReactNode | null;

  // Controls
  touchControls: boolean;
  hapticsEnabled: boolean;
  mouseSensitive: number;

  // Actions
  setTheme(theme: 'dark' | 'light' | 'system'): void;
  setRoomTheme(theme: RoomTheme): void;
  setStage(stage: BuildStage): void;
  setReducedMotion(enabled: boolean): void;
  toggleFullscreen(): void;
  toggleDrawer(): void;
  setDrawerContent(content: ReactNode | null): void;

  setDeviceBreakpoints(isMobile: boolean, isTablet: boolean, isDesktop: boolean): void;
  openModal(name: string, data?: Record<string, unknown>): void;
  closeModal(name?: string): void;
  pushOverlay(overlayId: string): void;
  popOverlay(): void;
  showToast(message: string, type?: Toast['type'], duration?: number): string;
  hideToast(id: string): void;
  showNotification(message: string, type?: Notification['type'], actions?: NotificationAction[], duration?: number): string;
  dismissNotification(id: string): void;
  setLoading(key: string, message: string): void;
  setLoadingGlobal(loading: boolean, message?: string): void;
  setError(error: string | null): void;
  setTouchControls(enabled: boolean): void;
  setHaptics(enabled: boolean): void;
  setMouseSensitivity(sensitivity: number): void;
}

const uid = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

type PersistedUI = Pick<
  UIStoreState,
  'theme' | 'roomTheme' | 'reducedMotion' | 'touchControls' | 'hapticsEnabled' | 'mouseSensitive'
>;

export const useUIStore = create<UIStoreState>()(
  persist(
    (set, get) => ({
      stage: BuildStage.FORGE,
      theme: 'dark',
      roomTheme: RoomTheme.DARK,
      reducedMotion: false,
      fullscreen: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,

      activeModal: null,
      modals: {},
      overlayStack: [],

      toasts: [],
      notifications: [],

      isLoading: false,
      loadingMessages: {},
      error: null,

      isDrawerOpen: false,
      drawerContent: null,

      touchControls: true,
      hapticsEnabled: true,
      mouseSensitive: 1,

      setTheme(theme) {
        set({ theme });
      },

      setRoomTheme(theme) {
        set({ roomTheme: theme });
      },

      setStage(stage) {
        set({ stage });
      },

      setReducedMotion(enabled) {
        set({ reducedMotion: enabled });
      },

      toggleFullscreen() {
        set((s) => ({ fullscreen: !s.fullscreen }));
      },

      toggleDrawer() {
        set({ ...get(), isDrawerOpen: !get().isDrawerOpen });
      },

      setDrawerContent(content) {
        set({ ...get(), drawerContent: content });
      },

      setDeviceBreakpoints(isMobile, isTablet, isDesktop) {
        set({ isMobile, isTablet, isDesktop });
      },

      openModal(name, data) {
        set((s) => ({ activeModal: name, modals: { ...s.modals, [name]: data ?? {} } }));
      },

      // closeModal(name) closes that modal; closeModal() closes whichever is active.
      closeModal(name) {
        set((s) => {
          const target = name ?? s.activeModal;
          if (!target) return {};
          const { [target]: _removed, ...rest } = s.modals;
          return {
            modals: rest,
            activeModal: s.activeModal === target ? null : s.activeModal,
          };
        });
      },

      pushOverlay(overlayId) {
        set((s) => ({ overlayStack: [...s.overlayStack, overlayId] }));
      },

      popOverlay() {
        set((s) => ({ overlayStack: s.overlayStack.slice(0, -1) }));
      },

      showToast(message, type = 'info', duration = 4000) {
        const id = uid('toast');
        const toast: Toast = { id, message, type, duration, timestamp: Date.now() };
        set((s) => ({ toasts: [...s.toasts, toast] }));
        if (duration > 0) {
          setTimeout(() => get().hideToast(id), duration);
        }
        return id;
      },

      hideToast(id) {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      },

      showNotification(message, type = 'info', actions = [], duration = 8000) {
        const id = uid('notif');
        const notification: Notification = { id, message, type, actions, duration, timestamp: Date.now() };
        set((s) => ({ notifications: [...s.notifications, notification] }));
        if (duration > 0) {
          setTimeout(() => get().dismissNotification(id), duration);
        }
        return id;
      },

      dismissNotification(id) {
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
      },

      setLoading(key, message) {
        set((s) => ({ loadingMessages: { ...s.loadingMessages, [key]: message } }));
      },

      setLoadingGlobal(loading, message) {
        set((s) => ({
          isLoading: loading,
          loadingMessages: message ? { ...s.loadingMessages, global: message } : s.loadingMessages,
        }));
      },

      setError(error) {
        set({ error });
      },

      setTouchControls(enabled) {
        set({ touchControls: enabled });
      },

      setHaptics(enabled) {
        set({ hapticsEnabled: enabled });
      },

      setMouseSensitivity(sensitivity) {
        set({ mouseSensitive: sensitivity });
      },
    }),
    {
      name: 'rigverse-ui',
      storage: createJSONStorage(() => localStorage),
      // Hydrated manually after mount (see StoreHydrator) to avoid SSR hydration mismatches
      skipHydration: true,
      partialize: (state): PersistedUI => ({
        theme: state.theme,
        roomTheme: state.roomTheme,
        reducedMotion: state.reducedMotion,
        touchControls: state.touchControls,
        hapticsEnabled: state.hapticsEnabled,
        mouseSensitive: state.mouseSensitive,
      }),
    },
  ),
);

export type UIStore = ReturnType<typeof useUIStore>;
