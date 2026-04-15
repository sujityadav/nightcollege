'use client';

import React from 'react';
import { usePageBreadcrumbs, createBreadcrumb, generateBreadcrumbsFromPath } from '@/app/hooks/usePageBreadcrumbs';

interface PageBreadcrumbsProps {
  /**
   * Array of breadcrumb items
   * If not provided, will generate from currentPath
   */
  items?: Array<{label: string, href?: string}>;
  
  /**
   * Current page title
   */
  title: string;
  
  /**
   * Current path for automatic breadcrumb generation
   * Example: '/admin/about-us/college-glance'
   */
  currentPath?: string;
  
  /**
   * Custom labels for specific paths when using automatic generation
   */
  pathLabels?: Record<string, string>;
  
  /**
   * Whether to reset breadcrumbs on unmount
   * @default true
   */
  resetOnUnmount?: boolean;
}

/**
 * Component to set breadcrumbs for the current page
 * Use this component at the top of your page component
 * 
 * @example
 * // Simple usage with manual breadcrumbs
 * <PageBreadcrumbs
 *   items={[
 *     { label: 'About Us', href: '/admin/about-us' },
 *     { label: 'College Glance' }
 *   ]}
 *   title="College Glance Management"
 * />
 * 
 * @example
 * // Automatic generation from path
 * <PageBreadcrumbs
 *   currentPath="/admin/about-us/college-glance"
 *   pathLabels={{
 *     '/admin': 'Dashboard',
 *     '/admin/about-us': 'About Us'
 *   }}
 *   title="College Glance"
 * />
 */
const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({
  items,
  title,
  currentPath,
  pathLabels = {},
  resetOnUnmount = true
}) => {
  let breadcrumbs = items || [];
  
  // Generate breadcrumbs from path if currentPath is provided and no items given
  if (currentPath && (!items || items.length === 0)) {
    breadcrumbs = generateBreadcrumbsFromPath(currentPath, pathLabels);
  }
  
  // Use the hook to set breadcrumbs
  usePageBreadcrumbs({
    breadcrumbs,
    pageTitle: title,
    resetOnUnmount
  });
  
  // This component doesn't render anything
  return null;
};

export default PageBreadcrumbs;

/**
 * Higher-order component to add breadcrumbs to a page
 * 
 * @example
 * const MyPage = withBreadcrumbs({
 *   items: [
 *     { label: 'About Us', href: '/admin/about-us' },
 *     { label: 'College Glance' }
 *   ],
 *   title: 'College Glance Management'
 * })(PageComponent);
 */
export function withBreadcrumbs<P extends object>(
  options: Omit<PageBreadcrumbsProps, 'children'>
) {
  return (WrappedComponent: React.ComponentType<P>) => {
    const ComponentWithBreadcrumbs = (props: P) => {
      return (
        <>
          <PageBreadcrumbs {...options} />
          <WrappedComponent {...props} />
        </>
      );
    };
    
    // Copy display name for debugging
    ComponentWithBreadcrumbs.displayName = `WithBreadcrumbs(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    
    return ComponentWithBreadcrumbs;
  };
}