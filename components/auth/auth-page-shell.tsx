import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function AuthPageShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-10">
      {children}
    </main>
  );
}
