import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

// NOTE: This module uses only the anon-key server client from
// '@/lib/supabase/server'. Never import SUPABASE_SERVICE_ROLE_KEY here
// or in any client component.

export type AppRole = 'admin' | 'resident' | 'security';

const VALID_ROLES: readonly AppRole[] = ['admin', 'resident', 'security'];

export class AuthError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export interface AuthContext {
  user: User;
  // Raw profile row (role already normalized to lowercase by getProfile).
  profile: Record<string, unknown> & { role: AppRole };
  role: AppRole;
}

function normalizeRole(value: unknown): AppRole {
  const role = String(value ?? 'resident').toLowerCase();
  return (VALID_ROLES as readonly string[]).includes(role)
    ? (role as AppRole)
    : 'resident';
}

// Returns the authenticated user, or throws 401 when unauthenticated.
export async function getUser(): Promise<{ user: User }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError(401, 'Not authenticated');
  }

  return { user };
}

// Returns the user plus their profile. Role is read from the profiles
// table (single source of truth), never from user_metadata.
export async function getProfile(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError(401, 'Not authenticated');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Missing profile (e.g. RLS or trigger lag) falls back to least privilege.
  const role = normalizeRole(profile?.role);

  return {
    user,
    profile: { ...(profile ?? { id: user.id }), role },
    role,
  };
}

// Guards server code by role. Throws 401 when unauthenticated and
// 403 when the profile role is not in the allowed list.
export async function requireRole(
  allowed: AppRole[],
): Promise<AuthContext> {
  const context = await getProfile();

  if (!allowed.includes(context.role)) {
    throw new AuthError(403, 'Insufficient role');
  }

  return context;
}
