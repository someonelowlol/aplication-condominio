'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AppRole = 'admin' | 'resident' | 'security';

function normalizeRole(value: unknown): AppRole {
  const role = String(value ?? 'resident').toLowerCase();
  return role === 'admin' || role === 'security' || role === 'resident'
    ? role
    : 'resident';
}

async function getRoleFromProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<AppRole> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  // Missing profile falls back to least privilege.
  return normalizeRole(profile?.role);
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=InvalidCredentials&message=${encodeURIComponent(error.message)}`)
  }

  // Single source of truth: profiles table, normalized to lowercase.
  // Never trust user_metadata for authorization.
  const role = await getRoleFromProfiles(supabase, data.user.id);

  revalidatePath('/', 'layout')
  if (role === 'admin') {
    redirect('/admin')
  } else {
    // Both 'resident' and 'security' land on the shared dashboard.
    redirect('/resident')
  }
}

export async function signup(role: 'RESIDENT' | 'ADMIN', formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Public signup always creates residents. Admin accounts are provisioned
  // via seed/SQL or the admin panel, never through this public action.
  // The `role` argument is intentionally ignored (kept for compatibility
  // with the existing login form) so no privilege escalation is possible.
  void role;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'resident'
      }
    }
  });

  if (error) {
    console.error('SUPABASE SIGNUP ERROR:', error);
    redirect(`/login?error=SignupFailed&message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout')
  redirect('/resident')
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
