// RIGVERSE — UI Store (Zustand)
// Manages UI state: theme, modals, toasts, notifications, mobile/responsive
// breakpoints, and any other global UI flags.

import { ReactNode } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoomTheme } from '@shared/types';
import { BuildStage } from '@shared/types/enums';

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
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
    timestamp: number;
  }>;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'destructive' }>;
    duration: number;
    timestamp: number;
  }>;

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
  showToast(message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number): string;
  hideToast(id: string): void;
  showNotification(message: string, type?: 'success' | 'error' | 'warning' | 'info', actions?: NotificationAction[]): string;
  dismissNotification(id: string): void;
  setLoading(key: string, message: string): void;
  setLoadingGlobal(loading: boolean, message?: string): void;
  setError(error: string | null): void;
  setTouchControls(enabled: boolean): void;
  setHaptics(enabled: boolean): void;
  setMouseSensitivity(sensitivity: number): void;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  timestamp: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  actions?: NotificationAction[];
  duration: number;
  timestamp: number;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

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
        set({ ...get(), theme });
      },

      setRoomTheme(theme) {
        set({ ...get(), roomTheme: theme });
      },

      setStage(stage) {
        set({ ...get(), stage });
      },

      setReducedMotion(enabled) {
        set({ ...get(), reducedMotion: enabled });
      },

      toggleFullscreen() {
        set({ ...get(), fullscreen: !get().fullscreen });
      },

      toggleDrawer() {
        set({ ...get(), isDrawerOpen: !get().isDrawerOpen });
      },

      setDrawerContent(content) {
        set({ ...get(), drawerContent: content });
      },

      setDeviceBreakpoints(isMobile, isTablet, isDesktop) {
        set({ ...get(), isMobile, isTablet, isDesktop });
      },

      openModal(name, data) {
        set({
          ...get(),
          activeModal: name,
          modals: { ...get().modals, [name]: data },
        });
      },

      closeModal(name) {
        set({
          ...get(),
          activeModal: name ? (get().overlayStack.length > 0 ? get().overlayStack[get().overlayStack.length - 1] : null) : null,
          modals: name ? { ...get().modals, [name]: undefined } : get().modals,
        });
        if (!name) {
          set({ ...get(), overlayStack: get().overlayStack.slice(0, -1) });
        }
      },

      pushOverlay(overlayId) {
        set({ ...get(), overlayStack: [...get().overlayStack, overlayId] });
      },

      popOverlay() {
        set({ ...get(), overlayStack: get().overlayStack.slice(0, -1) });
      },

      showToast(message, type = 'info', duration = 4000) {
        const id = `toast_${Date.now()}`;
        const toast: Toast = { id, message, type, duration, timestamp: Date.now() };
        set({ ...get(), toasts: [...get().toasts, toast] });
        if (duration > 0) {
          setTimeout(() => {
            set({ ...get(), toasts: get().toasts.filter((t) => t.id !== id) });
          }, duration);
        }
        return id;
      },

      hideToast(id) {
        set({ ...get(), toasts: get().toasts.filter((t) => t.id !== id) });
      },

      showNotification(message, type = 'info', actions = [], duration = 8000) {
        const id = `notif_${Date.now()}`;
        const notification: Notification = { id, message, type, actions, duration, timestamp: Date.now() };
        set({ ...get(), notifications: [...get().notifications, notification] });
        if (duration > 0) {
          setTimeout(() => {
            set({ ...get(), notifications: get().notifications.filter((n) => n.id !== id) });
          }, duration);
        }
        return id;
      },

      dismissNotification(id) {
        set({ ...get(), notifications: get().notifications.filter((n) => n.id !== id) });
      },

      setLoading(key, message) {
        set({
          ...get(),
          loadingMessages: { ...get().loadingMessages, [key]: message },
        });
      },

      setLoadingGlobal(loading, message) {
        set({
          ...get(),
          isLoading: loading,
          loadingMessages: message ? { ...get().loadingMessages, global: message } : get().loadingMessages,
        });
      },

      setError(error) {
        set({ ...get(), error });
      },

      setTouchControls(enabled) {
        set({ ...get(), touchControls: enabled });
      },

      setHaptics(enabled) {
        set({ ...get(), hapticsEnabled: enabled });
      },

      setMouseSensitivity(sensitivity) {
        set({ ...get(), mouseSensitive: sensitivity });
      },
    }),
    {
      name: 'rigverse-ui',
      getStorage: () => localStorage,
      partialize: (state) => ({
        theme: state.theme,
        roomTheme: state.roomTheme,
        reducedMotion: state.reducedMotion,
        touchControls: state.touchControls,
        hapticsEnabled: state.hapticsEnabled,
        mouseSensitive: state.mouseSensitive,
        toasts: [],
        notifications: [],
      }),
    }
  )
);

export type UIStore = ReturnType<typeof useUIStore>;
