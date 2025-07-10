// features/aboutus/components/AboutUsLayout.jsx
import React from 'react';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';
import { aboutUsNavItems } from '../sidebarData';

const AboutUsLayout = ({ children }) => {
  return (
    <div className="flex">
      <SubSidebar title="About Us" navItems={aboutUsNavItems} />
      <div className="flex-grow p-4">{children}</div>
    </div>
  );
};

export default AboutUsLayout;
