'use client';

import React from 'react';
import AboutUs from '../../features/aboutus/index';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

const About = () => {
  // Set breadcrumbs for this page - automatically generated from path
  usePageBreadcrumbs({
    pageTitle: 'About Us Management',
    pathLabels: {
      '/admin': 'Dashboard',
      '/admin/about-us': 'About Us'
    }
  });

  return (
    <div className='flex w-full'>
      <AboutUs />
    </div>
  );
};

export default About;