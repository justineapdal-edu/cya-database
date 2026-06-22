'use client';

import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createClient } from '@/utils/supabase/client';

type ParseStatus =
  | { type: 'idle' }
  | { type: 'parsing'; fileName: string }
  | { type: 'uploading'; current: number; total: number }
  | { type: 'success'; count: number }
  | { type: 'error'; message: string };

const CHUNK_SIZE = 500;

export function UploadModal({ onComplete }: { onComplete: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ParseStatus>({ type: 'idle' });
  const [dragOver, setDragOver] = useState(false);

  const reset = useCallback(() => {
    setStatus({ type: 'idle' });
    setDragOver(false);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setStatus({ type: 'parsing', fileName: file.name });

      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          setStatus({ type: 'error', message: 'The file contains no data rows.' });
          return;
        }

        const columns = Object.keys(rows[0]);
        const supabase = createClient();

        const { data: upload, error: uploadError } = await supabase
          .from('uploads')
          .insert({ filename: file.name, row_count: rows.length, columns })
          .select('id')
          .single();

        if (uploadError) {
          setStatus({
            type: 'error',
            message: `Failed to create upload record: ${uploadError.message}`,
          });
          return;
        }

        const chunks: Record<string, unknown>[][] = [];
        for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
          chunks.push(rows.slice(i, i + CHUNK_SIZE));
        }

        setStatus({ type: 'uploading', current: 0, total: chunks.length });

        for (let i = 0; i < chunks.length; i++) {
          setStatus({ type: 'uploading', current: i + 1, total: chunks.length });

          const { error } = await supabase.from('records').insert(
            chunks[i].map((row) => ({ upload_id: upload.id, data: row }))
          );

          if (error) {
            setStatus({
              type: 'error',
              message: `Insert failed at chunk ${i + 1}: ${error.message}`,
            });
            return;
          }
        }

        setStatus({ type: 'success', count: rows.length });
        setTimeout(() => {
          reset();
          setOpen(false);
          onComplete();
        }, 1500);
      } catch (err) {
        setStatus({
          type: 'error',
          message: err instanceof Error ? err.message : 'Failed to parse file.',
        });
      }
    },
    [onComplete, reset]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const isLoading = status.type === 'parsing' || status.type === 'uploading';
  const isDone = status.type === 'success';

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="size-4" />
          Upload New File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Spreadsheet</DialogTitle>
          <DialogDescription>
            Upload a .csv or .xlsx file. All columns are imported as-is.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
            } ${isDone ? 'pointer-events-none' : ''}`}
          >
            <input
              type="file"
              accept=".csv,.xlsx"
              className="sr-only"
              onChange={handleFileInput}
              disabled={isLoading || isDone}
            />

            {status.type === 'idle' && (
              <>
                <Upload className="size-8 text-slate-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Drop your file here, or{' '}
                    <span className="text-primary underline underline-offset-2">
                      browse
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Supports .csv and .xlsx files
                  </p>
                </div>
              </>
            )}

            {status.type === 'parsing' && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-slate-600">
                  Parsing {status.fileName}…
                </p>
              </div>
            )}

            {status.type === 'uploading' && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-slate-600">
                  Uploading chunk {status.current} of {status.total}…
                </p>
                <div className="flex h-2 w-64 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${(status.current / status.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {status.type === 'success' && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="size-8 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700">
                  Successfully imported {status.count} record
                  {status.count !== 1 ? 's' : ''}!
                </p>
              </div>
            )}

            {status.type === 'error' && (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="size-8 text-destructive" />
                <p className="max-w-sm text-center text-sm text-destructive whitespace-pre-line">
                  {status.message}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                >
                  Try again
                </Button>
              </div>
            )}
          </label>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileSpreadsheet className="size-4 shrink-0" />
            <span>All columns from your spreadsheet are imported as-is.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
