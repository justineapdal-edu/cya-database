import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DatabaseDashboard } from '@/components/database/database-dashboard';

export default function DatabasePage() {
  return (
    <DashboardShell>
      <DatabaseDashboard />
    </DashboardShell>
  );
}
