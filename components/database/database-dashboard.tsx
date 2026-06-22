'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FileSpreadsheet,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { UploadModal } from '@/components/database/upload-modal';
import { DataTable } from '@/components/database/data-table';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

type Upload = {
  id: string;
  created_at: string;
  filename: string;
  row_count: number;
  columns: string[];
};

export function DatabaseDashboard() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(true);
  const [uploadsError, setUploadsError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchUploads = useCallback(async () => {
    setUploadsLoading(true);
    setUploadsError(null);

    const { data, error: err } = await supabase
      .from('uploads')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setUploadsError(err.message);
    } else {
      const list = (data ?? []) as Upload[];
      setUploads(list);
    }
    setUploadsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads, refreshKey]);

  useEffect(() => {
    if (!uploadsLoading && uploads.length > 0 && !selectedId) {
      setSelectedId(uploads[0].id);
    } else if (!uploadsLoading && uploads.length === 0) {
      setSelectedId(null);
    }
  }, [uploads, uploadsLoading, selectedId]);

  const handleUploadComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleTableRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const selectedUpload = uploads.find((u) => u.id === selectedId);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Database</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            {selectedUpload ? selectedUpload.filename : 'No file selected'}
          </h1>
          {selectedUpload && (
            <p className="mt-0.5 text-sm text-slate-500">
              {selectedUpload.row_count} row
              {selectedUpload.row_count !== 1 ? 's' : ''} &middot;{' '}
              {selectedUpload.columns.length} column
              {selectedUpload.columns.length !== 1 ? 's' : ''} &middot;{' '}
              {new Date(selectedUpload.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <UploadModal onComplete={handleUploadComplete} />
      </div>

      <div className="flex flex-1 gap-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="flex flex-col gap-2">
            <p className="px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              Uploaded Files
            </p>

            {uploadsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-slate-400" />
              </div>
            )}

            {uploadsError && (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {uploadsError}
              </div>
            )}

            {!uploadsLoading && !uploadsError && uploads.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                <FileSpreadsheet className="mx-auto mb-2 size-8 text-slate-300" />
                <p>No files uploaded yet.</p>
              </div>
            )}

            {!uploadsLoading &&
              !uploadsError &&
              uploads.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedId(u.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition',
                    selectedId === u.id
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <FileSpreadsheet className="size-4 shrink-0" />
                  <span className="truncate">{u.filename}</span>
                </button>
              ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <label className="flex items-center gap-2 lg:hidden">
            <FileSpreadsheet className="size-4 text-slate-500" />
            <select
              className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-primary"
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(e.target.value || null)}
            >
              {uploads.length === 0 && (
                <option value="">No files uploaded</option>
              )}
              {uploads.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.filename} ({u.row_count} rows)
                </option>
              ))}
            </select>
          </label>

          {selectedId ? (
            <div className="mt-4 lg:mt-0">
              <DataTable
                uploadId={selectedId}
                onRefresh={handleTableRefresh}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-slate-500">
              <FileSpreadsheet className="size-12 text-slate-300" />
              <p className="font-medium text-slate-700">No file selected</p>
              <p>Select a file from the sidebar or upload a new one.</p>
              <UploadModal onComplete={handleUploadComplete} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
