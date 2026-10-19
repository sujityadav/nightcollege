'use client';

import { useParams } from 'next/navigation';
import NaacPublicLayout from '@/app/features/naac-public/components/NaacPublicLayout';
import { naacNavItems } from '@/app/features/naac/sidebarData';

export default function NaacMenuPlaceholderPage() {
  const params = useParams();
  const key = params?.key;
  const navItem = naacNavItems.find((item) => item.key === key);
  const title = navItem?.label || 'NAAC / IQAC';

  return (
    <NaacPublicLayout
      bannerTitle={title}
      breadcrumbData={[
        { label: 'Home', url: '/' },
        { label: 'NAAC / IQAC', url: '/naac/menu/iqac-composition' },
        { label: title, url: '' },
      ]}
    >
      <div className="card-shadow flex min-h-[280px] flex-col items-center justify-center bg-white p-10 text-center">
        <i className="pi pi-clock mb-4 text-4xl text-[#af251c]" aria-hidden="true" />
        <h2 className="mb-2 text-xl font-bold text-[#19212A]">{title}</h2>
        <p className="max-w-md text-[#6C768B]">This section is coming soon.</p>
      </div>
    </NaacPublicLayout>
  );
}
