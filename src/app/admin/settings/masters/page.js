'use client';

import SettingsNavCard from '@/app/features/settings/SettingsNavCard';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

export default function MastersPage() {
  usePageBreadcrumbs({
    pageTitle: 'Masters',
    breadcrumbs: [
      { label: 'Settings', href: '/admin/settings' },
      { label: 'Masters', isCurrent: true },
    ],
  });

  return (
    <div className="min-w-0 flex-1 p-5">
      <h2 className="text-[#19212A] text-[22px] font-[700] mb-5">Masters</h2>
      <div className="flex flex-wrap gap-5">
        <SettingsNavCard
          href="/admin/settings/masters/years"
          title="Years"
          description="Academic year ranges"
          icon="pi pi-calendar"
        />
      </div>
    </div>
  );
}
