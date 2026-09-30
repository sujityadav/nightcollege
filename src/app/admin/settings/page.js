'use client';

import SettingsNavCard from '@/app/features/settings/SettingsNavCard';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

export default function SettingsPage() {
  usePageBreadcrumbs({
    pageTitle: 'Settings',
    breadcrumbs: [{ label: 'Settings', isCurrent: true }],
  });

  return (
    <div className="min-w-0 flex-1 p-5">
      <h2 className="text-[#19212A] text-[22px] font-[700] mb-5">Settings</h2>
      <div className="flex flex-wrap gap-5">
        <SettingsNavCard
          href="/admin/settings/masters"
          title="Masters"
          description="Manage master data for the application"
          icon="pi pi-database"
        />
      </div>
    </div>
  );
}
