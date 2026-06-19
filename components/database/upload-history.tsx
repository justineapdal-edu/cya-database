'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';

type Upload = {
  id: string;
  created_at: string;
  filename: string;
  row_count: number;
  columns: string[];
};

export function UploadHistory({ refreshKey }: { refreshKey: number }) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from('uploads')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setUploads(data ?? []);
        }
        setLoading(false);
      });
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-destructive">
        <AlertCircle className="size-4" />
        {error}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Files</CardTitle>
        <CardDescription>
          {uploads.length === 0
            ? 'No uploads yet. Import a file above.'
            : `${uploads.length} file${uploads.length !== 1 ? 's' : ''} imported`}
        </CardDescription>
      </CardHeader>
      {uploads.length > 0 && (
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {uploads.map((upload) => (
              <Link
                key={upload.id}
                href={`/database/${upload.id}`}
                className="flex items-center gap-4 px-4 py-3 transition hover:bg-slate-50"
              >
                <FileSpreadsheet className="size-8 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{upload.filename}</p>
                  <p className="text-xs text-slate-500">
                    {upload.row_count} row{upload.row_count !== 1 ? 's' : ''} &middot;{' '}
                    {upload.columns.length} column{upload.columns.length !== 1 ? 's' : ''} &middot;{' '}
                    {new Date(upload.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
