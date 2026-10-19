'use client';

import NaacPage from '../../features/naac/index';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

export default function AdminNaacPage() {
  usePageBreadcrumbs({
    pageTitle: 'NAAC Management',
    pathLabels: {
      '/admin': 'Dashboard',
      '/admin/naac': 'NAAC',
    },
  });

  return (
    <div className="flex w-full">
      <NaacPage />
    </div>
  );
}
