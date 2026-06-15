import { createClient } from '@/utils/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <p className="text-sm font-medium text-emerald-700">Profile</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">Account details</h1>
      <dl className="mt-6 grid gap-4">
        <div className="rounded-lg border border-slate-200 p-4">
          <dt className="text-sm text-slate-500">Email</dt>
          <dd className="mt-1 text-sm font-medium text-slate-950">{user?.email}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <dt className="text-sm text-slate-500">User ID</dt>
          <dd className="mt-1 break-all text-sm font-medium text-slate-950">{user?.id}</dd>
        </div>
      </dl>
    </section>
  );
}
