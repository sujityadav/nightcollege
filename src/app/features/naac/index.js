'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import WorkInProgress from './components/WorkInProgress';
import NaacQuickLinksPanel from './components/NaacQuickLinksPanel';
import AqarDocumentsPanel from './components/AqarDocumentsPanel';
import {
  naacNavItems,
  naacWipSectionTitles,
  NAAC_QUICK_LINK_SECTIONS,
} from './sidebarData';

const DEFAULT_SECTION = 'iqac-composition';

export default function NaacPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  const initialKey =
    sectionFromUrl && naacNavItems.some((item) => item.key === sectionFromUrl)
      ? sectionFromUrl
      : DEFAULT_SECTION;

  const [activeKey, setActiveKey] = useState(initialKey);

  useEffect(() => {
    if (
      sectionFromUrl &&
      naacNavItems.some((item) => item.key === sectionFromUrl) &&
      sectionFromUrl !== activeKey
    ) {
      setActiveKey(sectionFromUrl);
    }
  }, [sectionFromUrl, activeKey]);

  const handleSelect = (key) => {
    setActiveKey(key);
    router.replace(`/admin/naac?section=${key}`, { scroll: false });
  };

  let content = <div>Section not found</div>;
  if (activeKey === 'aqar-documents') {
    content = <AqarDocumentsPanel />;
  } else if (NAAC_QUICK_LINK_SECTIONS[activeKey]) {
    content = <NaacQuickLinksPanel key={activeKey} sectionKey={activeKey} />;
  } else if (naacWipSectionTitles[activeKey]) {
    content = <WorkInProgress title={naacWipSectionTitles[activeKey]} />;
  }

  return (
    <div className="flex w-full">
      <SubSidebar
        title="NAAC"
        navItems={naacNavItems}
        activeKey={activeKey}
        onSelect={handleSelect}
      />

      <div className="flex-grow p-4">{content}</div>
    </div>
  );
}
