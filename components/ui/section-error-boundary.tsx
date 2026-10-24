'use client';

import * as Sentry from '@sentry/nextjs';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { recoverFromChunkLoadError } from '@/lib/ui/chunk-load-recovery';

type SectionErrorBoundaryProps = {
  /** Where this boundary sits, for Sentry ('product-modal', 'similar-products'…). */
  name: string;
  /** Shown instead of the failed section; null hides it. */
  fallback?: ReactNode;
  /** When any of these change (e.g. another product opens) the section retries. */
  resetKeys?: readonly unknown[];
  children: ReactNode;
};

type SectionErrorBoundaryState = {
  failed: boolean;
  resetKeys?: readonly unknown[];
};

function keysChanged(a?: readonly unknown[], b?: readonly unknown[]): boolean {
  if (a === b) return false;
  if (!a || !b || a.length !== b.length) return true;
  return a.some((value, index) => !Object.is(value, b[index]));
}

/**
 * Keeps a failure inside one part of the page. A nonessential section
 * (similar products, offers, price alert) or an overlay rendered outside the
 * route's own error page (the desktop product modal) must never replace the
 * whole site with the global error screen.
 */
export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = {
    failed: false,
    resetKeys: this.props.resetKeys,
  };

  static getDerivedStateFromError(): Partial<SectionErrorBoundaryState> {
    return { failed: true };
  }

  static getDerivedStateFromProps(
    props: SectionErrorBoundaryProps,
    state: SectionErrorBoundaryState,
  ): Partial<SectionErrorBoundaryState> | null {
    if (keysChanged(props.resetKeys, state.resetKeys)) {
      return { failed: false, resetKeys: props.resetKeys };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (recoverFromChunkLoadError(error)) return;
    Sentry.withScope((scope) => {
      scope.setTag('error_boundary', this.props.name);
      scope.setExtra('componentStack', info.componentStack);
      Sentry.captureException(error);
    });
  }

  render(): ReactNode {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
