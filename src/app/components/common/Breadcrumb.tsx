'use client';

import React from 'react';
import Link from 'next/link';
import { useBreadcrumb } from '@/app/context/BreadcrumbContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  className?: string;
  showHome?: boolean;
  homeHref?: string;
  homeLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  pageTitle?: string;
  useContext?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  className = '',
  showHome = true,
  homeHref = '/admin',
  homeLabel = 'Home',
  breadcrumbs = [],
  pageTitle = 'Dashboard',
  useContext = true
}) => {
  let contextBreadcrumbs: BreadcrumbItem[] = [];
  let contextPageTitle = pageTitle;
  
  if (useContext) {
    try {
      const context = useBreadcrumb();
      contextBreadcrumbs = context.breadcrumbs;
      contextPageTitle = context.pageTitle;
    } catch (error) {
      // Context not available, use provided props
      console.warn('Breadcrumb context not available, using provided props');
    }
  }

  // Use context values if available and useContext is true, otherwise use props
  const finalBreadcrumbs = useContext && contextBreadcrumbs.length > 0
    ? contextBreadcrumbs
    : breadcrumbs;
  const finalPageTitle = useContext && contextPageTitle !== 'Dashboard'
    ? contextPageTitle
    : pageTitle;

  // Combine home with breadcrumbs if showHome is true
  const allBreadcrumbs = showHome
    ? [{ label: homeLabel, href: homeHref }, ...finalBreadcrumbs]
    : [...finalBreadcrumbs];

  if (allBreadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      {/* Breadcrumb trail */}
      <div className="flex space-x-[8px] items-center mb-1">
        {allBreadcrumbs.map((item, index) => {
          const isLast = index === allBreadcrumbs.length - 1;
          
          return (
            <React.Fragment key={index}>
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-[#9CA1AB] text-[12px] xl:text-[0.729vw] leading-none hover:text-[#af251c] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`${isLast ? 'text-[#af251c]' : 'text-[#9CA1AB]'} text-[12px] xl:text-[0.729vw] leading-none`}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <i className="pi pi-angle-right text-[8px] text-[#9CA1AB]"></i>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Page title */}
      <div className="text-[#374151] text-[18px] xl:text-[0.938vw] font-semibold leading-[1.2]">
        {finalPageTitle}
      </div>
    </div>
  );
};

export default Breadcrumb;