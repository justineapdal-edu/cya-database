'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
      type="button"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  );
}
