'use client';

import SubBanner from '@/app/features/sub-banner';
import DepartmentalActivitiesInfiniteBrowse from '@/app/components/departmental-activities/DepartmentalActivitiesInfiniteBrowse';

export default function AllDepartmentalActivitiesPage() {
  const breadcrumbData = [
    { label: 'Home', url: '/' },
    { label: 'Departmental Activities', url: '' },
  ];

  return (
    <>
      <SubBanner title="Departmental Activities" breadcrumbData={breadcrumbData} />
      <main className="mb-5 px300">
        <section className="rounded-lg bg-white p-5 shadow-[0_4px_18px_rgba(20,58,119,0.10)] sm:p-7 lg:p-9">
          <DepartmentalActivitiesInfiniteBrowse showHeading={false} />
        </section>
      </main>
    </>
  );
}
