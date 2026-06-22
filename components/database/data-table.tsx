'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

type DataRec = {
  id: string;
  data: Record<string, unknown>;
};

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
} | null;

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  return String(value);
}

function getColumnKeys(records: DataRec[]): string[] {
  const keySet = new Set<string>();
  for (const record of records) {
    for (const key of Object.keys(record.data)) {
      keySet.add(key);
    }
  }
  return Array.from(keySet);
}

export function DataTable({
  uploadId,
  onRefresh,
}: {
  uploadId: string;
  onRefresh: () => void;
}) {
  const [records, setRecords] = useState<DataRec[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortConfig>(null);
  const [savingCell, setSavingCell] = useState<{
    recordId: string;
    column: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('records')
      .select('id, data')
      .eq('upload_id', uploadId)
      .order('created_at', { ascending: true });

    if (err) {
      setError(err.message);
      setRecords([]);
      setColumns([]);
    } else {
      const recs = data as DataRec[];
      setRecords(recs);
      setColumns(getColumnKeys(recs));
    }
    setLoading(false);
  }, [uploadId, supabase]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) =>
      Object.values(r.data).some((v) => {
        if (v === null || v === undefined) return false;
        return String(v).toLowerCase().includes(q);
      })
    );
  }, [records, searchQuery]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a.data[sort.column];
      const bVal = b.data[sort.column];
      const aStr = aVal == null ? '' : String(aVal);
      const bStr = bVal == null ? '' : String(bVal);
      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const handleSort = useCallback((column: string) => {
    setSort((prev) => {
      if (prev?.column === column) {
        if (prev.direction === 'asc') return { column, direction: 'desc' };
        return null;
      }
      return { column, direction: 'asc' };
    });
  }, []);

  const [editingCell, setEditingCell] = useState<{
    recordId: string;
    column: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const startEdit = useCallback(
    (recordId: string, column: string, currentValue: unknown) => {
      setEditingCell({ recordId, column });
      setEditValue(formatCell(currentValue));
    },
    []
  );

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const saveEdit = useCallback(
    async (recordId: string, column: string) => {
      if (savingCell) return;
      setSavingCell({ recordId, column });

      const record = records.find((r) => r.id === recordId);
      if (!record) {
        cancelEdit();
        setSavingCell(null);
        return;
      }

      const newData = { ...record.data, [column]: editValue };
      const { error: err } = await supabase
        .from('records')
        .update({ data: newData })
        .eq('id', recordId);

      if (err) {
        console.error('Failed to update record:', err.message);
      } else {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === recordId ? { ...r, data: newData } : r
          )
        );
      }

      setSavingCell(null);
      cancelEdit();
    },
    [records, editValue, savingCell, supabase, cancelEdit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, recordId: string, column: string) => {
      if (e.key === 'Enter') {
        saveEdit(recordId, column);
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    },
    [saveEdit, cancelEdit]
  );

  const handleDelete = useCallback(
    async (recordId: string) => {
      if (deletingId) return;
      setDeletingId(recordId);

      const { error: err } = await supabase
        .from('records')
        .delete()
        .eq('id', recordId);

      if (err) {
        console.error('Failed to delete record:', err.message);
      } else {
        setRecords((prev) => {
        const next = prev.filter((r) => r.id !== recordId);
        setColumns(getColumnKeys(next));
        return next;
      });
        onRefresh();
      }

      setDeletingId(null);
    },
    [deletingId, supabase, onRefresh]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-destructive">
        <AlertCircle className="size-4" />
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-sm text-slate-500">
        <p className="font-medium">No data</p>
        <p>This file has no records.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search across all columns…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase">
              <th className="w-10 px-4 py-3">#</th>
              {columns.map((col) => {
                const isSorted = sort?.column === col;
                const SortIcon = !isSorted
                  ? ArrowUpDown
                  : sort!.direction === 'asc'
                    ? ArrowUp
                    : ArrowDown;
                return (
                  <th key={col} className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort(col)}
                      className="flex items-center gap-1 hover:text-slate-800"
                    >
                      {col}
                      <SortIcon className="size-3" />
                    </button>
                  </th>
                );
              })}
              <th className="w-20 px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((record, i) => (
              <tr
                key={record.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-xs text-slate-400">{i + 1}</td>
                {columns.map((col) => {
                  const isEditing =
                    editingCell?.recordId === record.id &&
                    editingCell?.column === col;
                  const isSaving =
                    savingCell?.recordId === record.id &&
                    savingCell?.column === col;
                  const value = record.data[col];

                  return (
                    <td
                      key={col}
                      className={cn(
                        'max-w-xs truncate whitespace-nowrap px-4 py-3 text-slate-900',
                        !isEditing && 'cursor-pointer'
                      )}
                      onDoubleClick={() => {
                        if (!isEditing) startEdit(record.id, col, value);
                      }}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) =>
                              handleKeyDown(e, record.id, col)
                            }
                            onBlur={() => saveEdit(record.id, col)}
                            className="h-7 w-full min-w-[80px] rounded border border-blue-400 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                          />
                          {isSaving && (
                            <Loader2 className="size-3 shrink-0 animate-spin text-slate-400" />
                          )}
                        </div>
                      ) : isSaving ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">
                            {formatCell(value)}
                          </span>
                          <Loader2 className="size-3 shrink-0 animate-spin text-slate-400" />
                        </div>
                      ) : (
                        <span title={formatCell(value)}>
                          {formatCell(value) || (
                            <span className="text-slate-300 italic">
                              empty
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editingCell?.recordId === record.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => saveEdit(record.id, editingCell.column)}
                          disabled={!!savingCell}
                        >
                          <Check className="size-3 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={cancelEdit}
                        >
                          <X className="size-3 text-slate-500" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {columns.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              startEdit(record.id, columns[0], record.data[columns[0]])
                            }
                          >
                            <Pencil className="size-3 text-slate-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(record.id)}
                          disabled={deletingId === record.id}
                        >
                          {deletingId === record.id ? (
                            <Loader2 className="size-3 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="size-3 text-destructive" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Showing {sorted.length} of {records.length} row
        {records.length !== 1 ? 's' : ''}
        {searchQuery && ` (filtered)`}
        {sort && ` · sorted by "${sort.column}"`}
        &nbsp;&middot; Double-click a cell to edit
      </p>
    </div>
  );
}
