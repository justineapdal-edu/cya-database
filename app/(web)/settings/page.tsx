import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function SettingsPage() {
  return (
    <DashboardShell>
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-emerald-700">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Workspace settings</h1>
        <div className="mt-6 rounded-lg border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-950">Protected route ready</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add dashboard-only configuration screens in this folder as your app grows.
          </p>
        </div>
      </section>
    </DashboardShell>
  );
}
