import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DatabaseContent } from '@/components/database/database-content';

export default function DatabasePage() {
  return (
    <DashboardShell>
      <DatabaseContent />
    </DashboardShell>
  );
}
