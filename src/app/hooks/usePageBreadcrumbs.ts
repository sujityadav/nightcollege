'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useBreadcrumb, BreadcrumbItem } from '@/app/context/BreadcrumbContext';

interface UsePageBreadcrumbsOptions {
  breadcrumbs?: BreadcrumbItem[];
  pageTitle?: string;
  resetOnUnmount?: boolean;
  currentPath?: string;
  pathLabels?: Record<string, string>;
}

/**
 * Hook to set breadcrumbs and page title for the current page
 *
 * @example
 * // In a page component:
 * usePageBreadcrumbs({
 *   breadcrumbs: [
 *     { label: 'About Us', href: '/admin/about-us' },
 *     { label: 'College Glance' }
 *   ],
 *   pageTitle: 'College Glance Management'
 * });
 *
 * @example
 * // Automatic generation from current path:
 * usePageBreadcrumbs({
 *   currentPath: '/admin/about-us/college-glance',
 *   pathLabels: {
 *     '/admin': 'Dashboard',
 *     '/admin/about-us': 'About Us'
 *   },
 *   pageTitle: 'College Glance Management'
 * });
 */
export const usePageBreadcrumbs = ({
  breadcrumbs,
  pageTitle,
  resetOnUnmount = true,
  currentPath,
  pathLabels = {}
}: UsePageBreadcrumbsOptions) => {
  const { setBreadcrumbs, setPageTitle, resetBreadcrumbs } = useBreadcrumb();
  const pathname = usePathname();

  // Stabilize object/array props so inline literals from pages don't retrigger the effect
  const pathLabelsKey = useMemo(() => JSON.stringify(pathLabels ?? {}), [pathLabels]);
  const breadcrumbsKey = useMemo(() => JSON.stringify(breadcrumbs ?? null), [breadcrumbs]);
  const stablePathLabels = useMemo(
    () => JSON.parse(pathLabelsKey) as Record<string, string>,
    [pathLabelsKey]
  );
  const stableBreadcrumbs = useMemo(
    () => JSON.parse(breadcrumbsKey) as BreadcrumbItem[] | null,
    [breadcrumbsKey]
  );

  const resetOnUnmountRef = useRef(resetOnUnmount);
  resetOnUnmountRef.current = resetOnUnmount;

  useEffect(() => {
    let finalBreadcrumbs: BreadcrumbItem[] = [];
    let finalPageTitle = pageTitle;

    if (stableBreadcrumbs && stableBreadcrumbs.length > 0) {
      finalBreadcrumbs = stableBreadcrumbs;
    } else {
      const path = currentPath || pathname || '';
      if (path) {
        finalBreadcrumbs = generateBreadcrumbsFromPath(path, stablePathLabels);
        if (!finalPageTitle && finalBreadcrumbs.length > 0) {
          finalPageTitle = finalBreadcrumbs[finalBreadcrumbs.length - 1].label;
        }
      }
    }

    setBreadcrumbs(finalBreadcrumbs);
    if (finalPageTitle) {
      setPageTitle(finalPageTitle);
    }

    return () => {
      if (resetOnUnmountRef.current) {
        resetBreadcrumbs();
      }
    };
  }, [
    breadcrumbsKey,
    pageTitle,
    currentPath,
    pathLabelsKey,
    pathname,
    setBreadcrumbs,
    setPageTitle,
    resetBreadcrumbs,
    stableBreadcrumbs,
    stablePathLabels,
  ]);
};

/**
 * Utility function to create breadcrumb items with proper typing
 */
export const createBreadcrumb = (
  label: string, 
  href?: string, 
  isCurrent?: boolean
): BreadcrumbItem => ({
  label,
  href,
  isCurrent: isCurrent ?? (href === undefined)
});

/**
 * Helper to generate breadcrumbs based on path segments
 * 
 * @example
 * // For path '/admin/about-us/college-glance'
 * const breadcrumbs = generateBreadcrumbsFromPath('/admin/about-us/college-glance', {
 *   '/admin': 'Dashboard',
 *   '/admin/about-us': 'About Us'
 * });
 */
export const generateBreadcrumbsFromPath = (
  path: string,
  labelMap: Record<string, string> = {}
): BreadcrumbItem[] => {
  const segments = path.split('/').filter(segment => segment.length > 0);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    // Use custom label if provided, otherwise capitalize segment
    const label = labelMap[currentPath] || 
                  segment.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      isCurrent: isLast
    });
  });
  
  return breadcrumbs;
};