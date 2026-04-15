'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    let finalBreadcrumbs: BreadcrumbItem[] = [];
    let finalPageTitle = pageTitle;

    // Determine breadcrumbs
    if (breadcrumbs && breadcrumbs.length > 0) {
      finalBreadcrumbs = breadcrumbs;
    } else {
      // Generate from path
      const path = currentPath || pathname || '';
      if (path) {
        finalBreadcrumbs = generateBreadcrumbsFromPath(path, pathLabels);
        // If pageTitle not provided, use last segment label
        if (!finalPageTitle && finalBreadcrumbs.length > 0) {
          finalPageTitle = finalBreadcrumbs[finalBreadcrumbs.length - 1].label;
        }
      }
    }

    // If still no breadcrumbs, default empty
    if (finalBreadcrumbs.length === 0) {
      finalBreadcrumbs = [];
    }

    // Set the breadcrumbs and page title
    setBreadcrumbs(finalBreadcrumbs);
    if (finalPageTitle) {
      setPageTitle(finalPageTitle);
    }

    // Cleanup function to reset breadcrumbs when component unmounts
    return () => {
      if (resetOnUnmount) {
        resetBreadcrumbs();
      }
    };
  }, [breadcrumbs, pageTitle, currentPath, pathLabels, pathname, setBreadcrumbs, setPageTitle, resetBreadcrumbs, resetOnUnmount]);
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