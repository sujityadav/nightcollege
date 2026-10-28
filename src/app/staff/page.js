'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import SubBanner from '@/app/features/sub-banner';
import StaffDirectory from '@/app/components/staff/StaffDirectory';

const VALID_PANEL_KEYS = new Set(['teaching', 'non-teaching']);

function resolvePanelKey(typeParam) {
  const normalized = String(typeParam || 'teaching').toLowerCase();
  return VALID_PANEL_KEYS.has(normalized) ? normalized : 'teaching';
}

export default function StaffPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const initialPanelKey = useMemo(() => resolvePanelKey(typeParam), [typeParam]);

  const pageTitle =
    initialPanelKey === 'non-teaching' ? 'Non Teaching Staff' : 'Teaching Staff';

  return (
    <>
      <SubBanner
        title="Staff"
        subtitle={pageTitle}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'Administration', url: '/' },
          { label: 'Staff', url: '' },
        ]}
      />
      <main className="mb-10 px300 py-8">
        <StaffDirectory initialPanelKey={initialPanelKey} />
      </main>
    </>
  );
}
