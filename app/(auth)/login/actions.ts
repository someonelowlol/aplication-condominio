'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  const role = data.user?.user_metadata?.role || 'RESIDENT';

  revalidatePath('/', 'layout')
  if (role === 'ADMIN') {
    redirect('/admin')
  } else {
    redirect('/resident')
  }
}

export async function signup(role: 'RESIDENT' | 'ADMIN', formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role || 'RESIDENT'
      }
    }
  });

  if (error) {
    console.error('SUPABASE SIGNUP ERROR:', error);
    redirect(`/login?error=SignupFailed&message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout')
  if (role === 'ADMIN') {
    redirect('/admin')
  } else {
    redirect('/resident')
  }
}
