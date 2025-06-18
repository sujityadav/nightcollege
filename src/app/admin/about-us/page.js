'use client';
import React, { useState } from 'react'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { SubSidebar } from '@/app/components/layout/sub-sidebar';

export default function AboutUs (){
  const SideBarNavItems = [
  {
    label: 'My Profile',
    href: '/account',
  },
  {
    label: 'My Company',
    href: '/account/companies',
  },
  {
    label: 'Finance',
    href: 'account/finance/credit-limit',
  },
  {
    label: 'Agreements',
    href: '/agreements',
  },
  {
    label: 'Brand Setup',
    href: '/account/brand-setup',
  },
];
  
  return (
 
 <div className="flex w-full">
        <SubSidebar title="About us" navItems={SideBarNavItems} />
       <div className='p-[20px]'>ddd</div>
      </div>
  );
}



