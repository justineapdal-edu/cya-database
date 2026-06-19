import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { createClient } from '@/utils/supabase/server';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  return String(value);
}

export default async function UploadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: upload, error: uploadError } = await supabase
    .from('uploads')
    .select('*')
    .eq('id', id)
    .single();

  if (uploadError || !upload) {
    notFound();
  }

  const { data: records } = await supabase
    .from('records')
    .select('*')
    .eq('upload_id', id)
    .order('created_at', { ascending: true });

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/database">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <p className="text-sm font-medium text-emerald-700">Database</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">{upload.filename}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {upload.row_count} row{upload.row_count !== 1 ? 's' : ''} &middot;{' '}
              {upload.columns.length} column{upload.columns.length !== 1 ? 's' : ''} &middot;{' '}
              {new Date(upload.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
            <CardDescription>
              {records?.length ?? 0} row{(records?.length ?? 0) !== 1 ? 's' : ''} imported
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500 uppercase">
                    <th className="w-10 px-4 py-3">#</th>
                    {upload.columns.map((col: string) => (
                      <th key={col} className="px-4 py-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records?.map((record, i) => (
                    <tr key={record.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-400">{i + 1}</td>
                      {upload.columns.map((col: string) => {
                        const data = record.data as Record<string, unknown>;
                        return (
                          <td key={col} className="max-w-xs truncate whitespace-nowrap px-4 py-3 text-slate-900">
                            {formatCell(data[col])}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
