'use client';

import SubBanner from '@/app/features/sub-banner';
import DepartmentStyleSidebar from '@/app/components/department-style-sidebar';
import { naacPublicNavItems } from '../sidebarData';

export default function NaacPublicLayout({
  bannerTitle,
  breadcrumbData,
  hideSidebar = false,
  children,
}) {
  const crumbs = breadcrumbData || [
    { label: 'Home', url: '/' },
    { label: 'NAAC / IQAC', url: '/naac/menu/iqac-composition' },
  ];

  const sidebar = hideSidebar ? null : (
    <DepartmentStyleSidebar title="NAAC / IQAC" navItems={naacPublicNavItems} headerIcon="pi pi-book" />
  );

  const mainContent = <div className="min-w-0 flex-1">{children}</div>;

  return (
    <>
      <SubBanner title={bannerTitle || 'NAAC / IQAC'} breadcrumbData={crumbs} />
      <main className={hideSidebar ? undefined : 'mb-5'}>
        <div className={`px300 pt-2 ${hideSidebar ? 'pb-16' : 'pb-8'}`}>
          {hideSidebar ? (
            mainContent
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)] lg:gap-8">
              {sidebar}
              {mainContent}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
