import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { createClient } from '@/utils/supabase/server';

export default async function DatabasePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardShell>
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-emerald-700">Database</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Records</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Database content will go here.
        </p>
      </section>
    </DashboardShell>
  );
}
