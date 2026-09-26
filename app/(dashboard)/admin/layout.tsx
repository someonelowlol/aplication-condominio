import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AuthError, requireRole } from '@/lib/supabase/auth';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireRole(['admin']);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(error.status === 401 ? '/login' : '/resident');
    }
    throw error;
  }

  return <>{children}</>;
}
