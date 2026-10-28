// features/aboutus/index.js
"use client"
import { useState } from 'react';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import AboutEditor from './components/AboutEditor';
import { aboutUsNavItems, componentMap } from "./sidebarData";


export default function AboutUsPage() {
  const [activeKey, setActiveKey] = useState('about');

  return (
    <div className="flex w-full min-w-0">
      <SubSidebar
        title="About Us"
        navItems={aboutUsNavItems}
        activeKey={activeKey}
        onSelect={setActiveKey}
      />

      <div className="min-w-0 flex-1 w-full p-4">
        {componentMap[activeKey] || <div>Component not found</div>}
      </div>
    </div>
  );
}
