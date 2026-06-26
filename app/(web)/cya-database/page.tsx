'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { createClient } from '@/utils/supabase/client';

const PROVINCES = ['Metro Manila', 'Rizal', 'Cavite', 'Laguna'];

const MUNICIPALITIES: Record<string, string[]> = {
  'Metro Manila': ['Pasig', 'Quezon City', 'Makati', 'Taguig'],
  Rizal: ['Cainta', 'Antipolo', 'Taytay', 'Angono'],
  Cavite: ['Dasmariñas', 'Bacoor', 'Imus', 'Silang'],
  Laguna: ['Santa Rosa', 'Biñan', 'Calamba', 'San Pedro'],
};

const BARANGAYS = ['San Juan ', 'Santo Domingo', 'Barangay 3', 'Barangay 4'];

type CyadRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  name: string;
  age: number;
  contact_number: string;
  social_media_link: string | null;
  invited_by: string | null;
  address: {
    house_no: string;
    street_name: string;
    subdivision: string;
    barangay: string;
    municipality: string;
    province: string;
  };
};

type FormData = {
  email: string;
  name: string;
  age: string;
  contact_number: string;
  social_media_link: string;
  invited_by: string;
  house_no: string;
  street_name: string;
  subdivision: string;
  barangay: string;
  municipality: string;
  province: string;
};

const initialForm: FormData = {
  email: '',
  name: '',
  age: '',
  contact_number: '',
  social_media_link: '',
  invited_by: '',
  house_no: '',
  street_name: '',
  subdivision: '',
  barangay: '',
  municipality: '',
  province: '',
};

function recordToForm(r: CyadRecord): FormData {
  return {
    email: r.email,
    name: r.name,
    age: String(r.age),
    contact_number: r.contact_number,
    social_media_link: r.social_media_link ?? '',
    invited_by: r.invited_by ?? '',
    house_no: r.address.house_no ?? '',
    street_name: r.address.street_name ?? '',
    subdivision: r.address.subdivision ?? '',
    barangay: r.address.barangay ?? '',
    municipality: r.address.municipality ?? '',
    province: r.address.province ?? '',
  };
}

function formatAddress(addr: CyadRecord['address']): string {
  const parts = [
    addr.house_no,
    addr.street_name,
    addr.subdivision,
    addr.barangay,
    addr.municipality,
    addr.province,
  ].filter(Boolean);
  return parts.join(', ') || '—';
}

function FormFields({
  form,
  errors,
  onChange,
}: {
  form: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" value={form.email} onChange={onChange} />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={form.name} onChange={onChange} />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" min="0" value={form.age} onChange={onChange} />
          {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_number">Contact Number</Label>
          <Input id="contact_number" name="contact_number" value={form.contact_number} onChange={onChange} />
          {errors.contact_number && <p className="text-xs text-destructive">{errors.contact_number}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="social_media_link">Social Media Link</Label>
          <Input id="social_media_link" name="social_media_link" value={form.social_media_link} onChange={onChange} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invited_by">Invited By</Label>
          <Input id="invited_by" name="invited_by" value={form.invited_by} onChange={onChange} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Address</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="house_no">House No.</Label>
            <Input id="house_no" name="house_no" value={form.house_no} onChange={onChange} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="street_name">Street Name</Label>
            <Input id="street_name" name="street_name" value={form.street_name} onChange={onChange} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subdivision">Subdivision</Label>
            <Input id="subdivision" name="subdivision" value={form.subdivision} onChange={onChange} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="province">Province</Label>
            <select
              id="province"
              name="province"
              value={form.province}
              onChange={onChange}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select province</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="municipality">Municipality / City</Label>
            <select
              id="municipality"
              name="municipality"
              value={form.municipality}
              onChange={onChange}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select municipality</option>
              {(MUNICIPALITIES[form.province] ?? []).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="barangay">Barangay</Label>
            <select
              id="barangay"
              name="barangay"
              value={form.barangay}
              onChange={onChange}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select barangay</option>
              {BARANGAYS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

const supabase = createClient();

export default function CyadDatabasePage() {
  const [records, setRecords] = useState<CyadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<CyadRecord | null>(null);
  const [editRecord, setEditRecord] = useState<CyadRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<CyadRecord | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('cya_database')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setRecords((data ?? []) as CyadRecord[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!form.email) errors.email = 'Email is required';
    if (!form.name) errors.name = 'Name is required';
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 0)
      errors.age = 'Valid age is required';
    if (!form.contact_number) errors.contact_number = 'Contact number is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildInsertPayload = (f: FormData) => ({
    email: f.email,
    name: f.name,
    age: Number(f.age),
    contact_number: f.contact_number,
    social_media_link: f.social_media_link || null,
    invited_by: f.invited_by || null,
    address: {
      house_no: f.house_no,
      street_name: f.street_name,
      subdivision: f.subdivision,
      barangay: f.barangay,
      municipality: f.municipality,
      province: f.province,
    },
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const { error: err } = await supabase.from('cya_database').insert(buildInsertPayload(form));

    setSubmitting(false);
    if (err) { alert('Failed to add record: ' + err.message); return; }

    setAddOpen(false);
    setForm(initialForm);
    fetchRecords();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !editRecord) return;
    setSubmitting(true);

    const { error: err } = await supabase
      .from('cya_database')
      .update(buildInsertPayload(form))
      .eq('id', editRecord.id);

    setSubmitting(false);
    if (err) { alert('Failed to update record: ' + err.message); return; }

    setEditRecord(null);
    setDetailRecord(null);
    setForm(initialForm);
    fetchRecords();
  };

  const handleDelete = async () => {
    if (!deleteRecord) return;
    setDeleting(true);

    const { error: err } = await supabase
      .from('cya_database')
      .delete()
      .eq('id', deleteRecord.id);

    setDeleting(false);
    if (err) { alert('Failed to delete record: ' + err.message); return; }

    setDeleteRecord(null);
    setDetailRecord(null);
    fetchRecords();
  };

  const openEdit = (record: CyadRecord) => {
    setForm(recordToForm(record));
    setEditRecord(record);
  };

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.email.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.contact_number.includes(q) ||
      (r.invited_by ?? '').toLowerCase().includes(q)
    );
  });

  const detail = detailRecord;

  return (
    <DashboardShell>
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Directory</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">CYA Database</h1>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <Button asChild>
            <DialogTrigger>
              <Plus className="size-4" />
              Add New Record
            </DialogTrigger>
          </Button>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-5">
              <FormFields form={form} errors={formErrors} onChange={handleChange} />
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  {submitting ? 'Saving...' : 'Save Record'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by email, name, contact number, or invited by..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Contact Number</th>
              <th className="px-4 py-3">Social Media</th>
              <th className="px-4 py-3">Invited By</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                  <p className="mt-2">Loading records...</p>
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <AlertCircle className="size-4" />
                    {error}
                  </div>
                </td>
              </tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  {search ? 'No records match your search.' : 'No records yet. Add your first record!'}
                </td>
              </tr>
            )}
            {!loading && !error && filtered.map((record) => (
              <tr
                key={record.id}
                className="border-b border-slate-100 transition hover:bg-slate-50 cursor-pointer"
                onClick={() => setDetailRecord(record)}
              >
                <td className="px-4 py-3">{record.email}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{record.name}</td>
                <td className="px-4 py-3">{record.age}</td>
                <td className="px-4 py-3">{record.contact_number}</td>
                <td className="px-4 py-3 text-slate-600">
                  {record.social_media_link ? (
                    <a
                      href={record.social_media_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Link
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">{record.invited_by ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{formatAddress(record.address)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => { openEdit(record); setDetailRecord(null); }}
                      className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      title="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeleteRecord(record); setDetailRecord(null); }}
                      className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && (
        <p className="mt-3 text-xs text-slate-400">
          Showing {filtered.length} of {records.length} record{records.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Detail Modal ── */}
      <Dialog open={!!detailRecord} onOpenChange={(open) => { if (!open) { setDetailRecord(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="relative">
            <DialogTitle>Record Details</DialogTitle>
            <div className="absolute right-10 top-0 flex gap-1">
              <button
                type="button"
                onClick={() => { if (detail) openEdit(detail); }}
                className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                title="Edit"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => { if (detail) setDeleteRecord(detail); }}
                className="rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </DialogHeader>
          {detail && (
            <div className="space-y-3">
              <DetailRow label="Email" value={detail.email} />
              <DetailRow label="Name" value={detail.name} />
              <DetailRow label="Age" value={String(detail.age)} />
              <DetailRow label="Contact Number" value={detail.contact_number} />
              <DetailRow label="Social Media" value={detail.social_media_link ?? '—'} />
              <DetailRow label="Invited By" value={detail.invited_by ?? '—'} />
              <div className="border-t border-slate-200 pt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Address</p>
                <div className="space-y-1.5">
                  <DetailRow label="House No." value={detail.address.house_no || '—'} />
                  <DetailRow label="Street Name" value={detail.address.street_name || '—'} />
                  <DetailRow label="Subdivision" value={detail.address.subdivision || '—'} />
                  <DetailRow label="Barangay" value={detail.address.barangay || '—'} />
                  <DetailRow label="Municipality" value={detail.address.municipality || '—'} />
                  <DetailRow label="Province" value={detail.address.province || '—'} />
                </div>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <DetailRow label="Created" value={new Date(detail.created_at).toLocaleString()} />
                <DetailRow label="Updated" value={new Date(detail.updated_at).toLocaleString()} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Modal ── */}
      <Dialog open={!!editRecord} onOpenChange={(open) => { if (!open) { setEditRecord(null); setForm(initialForm); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-5">
            <FormFields form={form} errors={formErrors} onChange={handleChange} />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? 'Saving...' : 'Update Record'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <Dialog open={!!deleteRecord} onOpenChange={(open) => { if (!open) setDeleteRecord(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete the record for{' '}
            <span className="font-medium text-slate-900">{deleteRecord?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
