/**
 * Route Guard Components (Client-Side)
 *
 * Declarative route protection for client-side rendering.
 * Provides UX polish alongside proxy.ts edge protection and server guards.
 *
 * Defense in depth layers:
 * 1. proxy.ts: Edge protection (fast, first line)
 * 2. Server layouts: RSC guards (server-side verification)
 * 3. Client guards: UX polish (hydration, client navigation)
 *
 * @module components/guards/RouteGuard
 */

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/useAuth";
import {
  canAccessProvider,
  canAccessAdmin,
  canAccessAuthenticated,
} from "@/lib/auth";
import { ROUTES } from "@/lib/auth/route-rules";
import type { EffectiveRole } from "@/lib/auth/types";
import { PageSpinner } from "@/components/ui/spinner";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BASE GUARD HOOK
   ═══════════════════════════════════════════════════════════════════════════ */

interface UseGuardOptions {
  checkAccess: (isAuthenticated: boolean, role: EffectiveRole | null) => {
    allowed: boolean;
    redirectTo: string | null;
  };
}

function useRouteGuard({ checkAccess }: UseGuardOptions) {
  const router = useRouter();
  const { isAuthenticated, isReady, role } = useAuthState();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Wait for auth to be ready
    if (!isReady) return;

    // Prevent multiple redirects
    if (hasRedirected.current) return;

    const { allowed, redirectTo } = checkAccess(isAuthenticated, role);

    if (!allowed && redirectTo) {
      hasRedirected.current = true;
      router.replace(redirectTo);
    }
  }, [isReady, isAuthenticated, role, checkAccess, router]);

  // Reset redirect flag when auth state changes
  useEffect(() => {
    if (isReady) {
      hasRedirected.current = false;
    }
  }, [isReady, isAuthenticated]);

  const { allowed } = checkAccess(isAuthenticated, role);

  return {
    isReady,
    isAllowed: allowed,
    isLoading: !isReady,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   AUTHENTICATED GUARD
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Guard for routes requiring any authenticated user
 */
export function AuthenticatedGuard({ children, fallback }: RouteGuardProps) {
  const { isReady, isAllowed, isLoading } = useRouteGuard({
    checkAccess: (isAuthenticated) => canAccessAuthenticated(isAuthenticated),
  });

  if (isLoading) {
    return <>{fallback ?? <PageSpinner />}</>;
  }

  if (!isAllowed) {
    return <>{fallback ?? <PageSpinner />}</>;
  }

  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER GUARD
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Guard for routes requiring provider or admin role
 */
export function ProviderGuard({ children, fallback }: RouteGuardProps) {
  const { isReady, isAllowed, isLoading } = useRouteGuard({
    checkAccess: (isAuthenticated, role) => canAccessProvider(isAuthenticated, role),
  });

  if (isLoading) {
    return <>{fallback ?? <PageSpinner />}</>;
  }

  if (!isAllowed) {
    return <>{fallback ?? <PageSpinner />}</>;
  }

  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN GUARD
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Guard for routes requiring admin role
 */
export function AdminGuard({ children, fallback }: RouteGuardProps) {
  const { isReady, isAllowed, isLoading } = useRouteGuard({
    checkAccess: (isAuthenticated, role) => canAccessAdmin(isAuthenticated, role),
  });

  if (isLoading) {
    return <>{fallback ?? <PageSpinner />}</>;
  }

  if (!isAllowed) {
    return <>{fallback ?? <PageSpinner />}</>;
  }

  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   GUEST GUARD
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Guard for routes that should only be accessible to non-authenticated users
 * (e.g., login, register pages)
 */
export function GuestGuard({ children, fallback }: RouteGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuthState();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isReady) return;
    if (hasRedirected.current) return;

    if (isAuthenticated) {
      hasRedirected.current = true;
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady) {
    return <>{fallback ?? <PageSpinner />}</>;
  }

  if (isAuthenticated) {
    return <>{fallback ?? <PageSpinner />}</>;
  }

  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOOK EXPORTS (for custom implementations)
   ═══════════════════════════════════════════════════════════════════════════ */

export { useRouteGuard };
