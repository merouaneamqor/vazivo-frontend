/**
 * Server-Side Route Guards
 *
 * These guards run on the server during RSC rendering.
 * They provide defense-in-depth alongside proxy.ts edge protection.
 *
 * Usage:
 * - proxy.ts: First line of defense (edge, fast)
 * - Server guards: Second line (RSC, full verification)
 * - Client guards: UX polish (hydration, navigation)
 *
 * @module components/guards/server
 */

import { redirect } from "next/navigation";
import {
  requireAdmin,
  requireProvider,
  requireCustomer,
  requireAdminRoles,
  verifySession,
  getOptionalSession,
  type VerifiedSession,
} from "@/lib/auth/dal";
import { ROUTES } from "@/lib/auth/route-rules";
import type { AdminRole } from "@/lib/auth/types";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface ServerGuardProps {
  children: React.ReactNode;
}

interface AdminSubRoleGuardProps extends ServerGuardProps {
  /** Required admin sub-roles (any of these will grant access) */
  allowedRoles: readonly AdminRole[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   AUTHENTICATED GUARD (SERVER)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Server-side guard requiring any authenticated user.
 * Redirects to login if not authenticated.
 *
 * @example
 * // In a Server Component layout:
 * export default function DashboardLayout({ children }) {
 *   return <ServerAuthenticatedGuard>{children}</ServerAuthenticatedGuard>;
 * }
 */
export async function ServerAuthenticatedGuard({
  children,
}: ServerGuardProps): Promise<React.ReactNode> {
  await verifySession(); // Throws redirect to login if invalid
  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN GUARD (SERVER)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Server-side guard requiring admin role.
 * Redirects to login or dashboard based on auth state.
 *
 * @example
 * // In admin layout:
 * export default function AdminLayout({ children }) {
 *   return <ServerAdminGuard>{children}</ServerAdminGuard>;
 * }
 */
export async function ServerAdminGuard({
  children,
}: ServerGuardProps): Promise<React.ReactNode> {
  await requireAdmin(); // Throws redirect if not admin
  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN SUB-ROLE GUARD (SERVER)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Server-side guard requiring specific admin sub-roles.
 * Useful for fine-grained admin area access control.
 *
 * @example
 * // Finance section only for superadmin and finance roles:
 * export default function FinanceLayout({ children }) {
 *   return (
 *     <ServerAdminSubRoleGuard allowedRoles={['superadmin', 'finance']}>
 *       {children}
 *     </ServerAdminSubRoleGuard>
 *   );
 * }
 */
export async function ServerAdminSubRoleGuard({
  children,
  allowedRoles,
}: AdminSubRoleGuardProps): Promise<React.ReactNode> {
  await requireAdminRoles(allowedRoles); // Throws redirect if not allowed
  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER GUARD (SERVER)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Server-side guard requiring provider or admin role.
 * Redirects to login or dashboard based on auth state.
 *
 * @example
 * // In provider dashboard layout:
 * export default function ProviderLayout({ children }) {
 *   return <ServerProviderGuard>{children}</ServerProviderGuard>;
 * }
 */
export async function ServerProviderGuard({
  children,
}: ServerGuardProps): Promise<React.ReactNode> {
  await requireProvider(); // Throws redirect if not provider/admin
  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOMER GUARD (SERVER)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Server-side guard requiring customer role specifically.
 * Useful for customer-only areas (not provider, not admin).
 *
 * @example
 * // Customer-specific booking area:
 * export default function CustomerBookingLayout({ children }) {
 *   return <ServerCustomerGuard>{children}</ServerCustomerGuard>;
 * }
 */
export async function ServerCustomerGuard({
  children,
}: ServerGuardProps): Promise<React.ReactNode> {
  await requireCustomer(); // Throws redirect if not customer
  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   GUEST GUARD (SERVER)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Server-side guard for guest-only routes (login, register).
 * Redirects authenticated users to their dashboard.
 *
 * @example
 * // Login page layout:
 * export default function LoginLayout({ children }) {
 *   return <ServerGuestGuard>{children}</ServerGuestGuard>;
 * }
 */
export async function ServerGuestGuard({
  children,
}: ServerGuardProps): Promise<React.ReactNode> {
  const session = await getOptionalSession();

  if (session) {
    // Redirect to role-appropriate dashboard
    if (session.role === "admin") {
      redirect(ROUTES.ADMIN_DASHBOARD);
    } else if (session.role === "provider") {
      redirect(ROUTES.PROVIDER);
    } else {
      redirect(ROUTES.DASHBOARD);
    }
  }

  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SESSION CONTEXT PROVIDER (SERVER)
   ═══════════════════════════════════════════════════════════════════════════ */

interface WithSessionProps {
  children: (session: VerifiedSession) => React.ReactNode;
}

/**
 * Provides verified session to children for server-side rendering.
 * Useful when children need access to session data.
 *
 * @example
 * export default function Layout({ children }) {
 *   return (
 *     <WithSession>
 *       {(session) => (
 *         <Header userId={session.userId} role={session.effectiveRole} />
 *         {children}
 *       )}
 *     </WithSession>
 *   );
 * }
 */
export async function WithSession({
  children,
}: WithSessionProps): Promise<React.ReactNode> {
  const session = await verifySession();
  return <>{children(session)}</>;
}

interface WithOptionalSessionProps {
  children: (session: VerifiedSession | null) => React.ReactNode;
}

/**
 * Provides optional session to children (null if not authenticated).
 * Useful for public pages that adapt to auth state.
 */
export async function WithOptionalSession({
  children,
}: WithOptionalSessionProps): Promise<React.ReactNode> {
  const session = await getOptionalSession();
  return <>{children(session)}</>;
}
