// app/ConditionalLayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import WebsiteTop from '../layout/website/top'
import "../../globals.css";

export default function ConditionalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith('/admin');
  const isLoginRoute = pathname?.startsWith('/login');


  return (
    <>
      {!isAdminRoute && !isLoginRoute && <WebsiteTop />}
      {children}
    </>
  );
}
