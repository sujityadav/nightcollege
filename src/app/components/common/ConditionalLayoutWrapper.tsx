// app/ConditionalLayoutWrapper.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import WebsiteTop from '../layout/website/top'
import "../../globals.css";

export default function ConditionalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith('/admin');
  const isLoginRoute = pathname?.startsWith('/login');
  const childrenArray = React.Children.toArray(children);
  const pageContent = childrenArray[0];
  const otherComponents = childrenArray.slice(1);

  return (
    <>
      {!isAdminRoute && !isLoginRoute && <WebsiteTop />}
      {pageContent}
      {!isAdminRoute && !isLoginRoute && otherComponents}
    </>
  );
}
