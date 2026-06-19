'use client';

import { useState } from 'react';
import { FileUploadZone } from '@/components/database/file-upload-zone';
import { UploadHistory } from '@/components/database/upload-history';

export function DatabaseContent() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">Database</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Imports</h1>
      </div>

      <FileUploadZone onComplete={() => setRefreshKey((k) => k + 1)} />
      <UploadHistory refreshKey={refreshKey} />
    </div>
  );
}
