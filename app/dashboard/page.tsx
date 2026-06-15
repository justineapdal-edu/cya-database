import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <p className="text-sm font-medium text-emerald-700">Dashboard</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">Overview</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        You are signed in as {user?.email ?? 'an authenticated user'}.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Records</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">0</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">0</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Updated</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">Today</p>
        </div>
      </div>
    </section>
  );
}
