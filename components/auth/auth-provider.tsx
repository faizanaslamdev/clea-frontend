'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AuthModal } from '@/components/auth/auth-modal';
import {
  type AuthPendingAction,
  clearPendingAction,
  readPendingAction,
  savePendingAction,
} from '@/lib/auth/pending-action';
import { cancelPendingTrackAction } from '@/lib/auth/resume-pending-action';
import type { AuthView } from '@/lib/auth/errors';

interface OpenAuthModalOptions {
  view?: AuthView;
  pendingAction?: Omit<AuthPendingAction, 'createdAt'> & {
    createdAt?: string;
  };
}

interface AuthModalContextValue {
  openAuthModal: (options?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  pendingAction: AuthPendingAction | null;
  /** Refresh pending action from sessionStorage (e.g. after page load). */
  refreshPendingAction: () => void;
  /**
   * Clear after Phase 2 tracking succeeds.
   * Do not call merely because the user signed in.
   */
  clearPendingActionAfterSuccess: () => void;
  /** Explicit user cancel. */
  cancelPendingAction: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<AuthView>('sign-in');
  const [pendingAction, setPendingAction] = useState<AuthPendingAction | null>(
    null,
  );

  const refreshPendingAction = useCallback(() => {
    setPendingAction(readPendingAction());
  }, []);

  useEffect(() => {
    refreshPendingAction();
  }, [refreshPendingAction]);

  const openAuthModal = useCallback((options?: OpenAuthModalOptions) => {
    if (options?.pendingAction) {
      const saved = savePendingAction(options.pendingAction);
      setPendingAction(saved);
    } else {
      setPendingAction(readPendingAction());
    }

    setInitialView(options?.view ?? 'sign-in');
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    // Pending action is intentionally preserved across modal close.
    setPendingAction(readPendingAction());
  }, []);

  const clearPendingActionAfterSuccess = useCallback(() => {
    clearPendingAction();
    setPendingAction(null);
  }, []);

  const cancelPendingAction = useCallback(() => {
    cancelPendingTrackAction();
    setPendingAction(null);
  }, []);

  const value = useMemo(
    () => ({
      openAuthModal,
      closeAuthModal,
      isAuthModalOpen: isOpen,
      pendingAction,
      refreshPendingAction,
      clearPendingActionAfterSuccess,
      cancelPendingAction,
    }),
    [
      cancelPendingAction,
      clearPendingActionAfterSuccess,
      closeAuthModal,
      isOpen,
      openAuthModal,
      pendingAction,
      refreshPendingAction,
    ],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeAuthModal();
            return;
          }
          setIsOpen(true);
        }}
        initialView={initialView}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthProvider');
  }

  return context;
}
