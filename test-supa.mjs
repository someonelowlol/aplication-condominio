import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test-error-2@condominio.com',
    password: 'securepassword123'
  });
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
