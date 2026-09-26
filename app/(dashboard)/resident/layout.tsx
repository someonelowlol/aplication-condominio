import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AuthError, requireRole } from '@/lib/supabase/auth';

export default async function ResidentLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    // Security staff share the resident dashboard; admins keep access too.
    await requireRole(['admin', 'resident', 'security']);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/login');
    }
    throw error;
  }

  return <>{children}</>;
}
