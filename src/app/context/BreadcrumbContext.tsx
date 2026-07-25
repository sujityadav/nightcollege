'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  updateBreadcrumbs: (newBreadcrumbs: BreadcrumbItem[]) => void;
  resetBreadcrumbs: () => void;
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

interface BreadcrumbProviderProps {
  children: ReactNode;
  initialBreadcrumbs?: BreadcrumbItem[];
  initialTitle?: string;
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({ 
  children, 
  initialBreadcrumbs = [],
  initialTitle = 'Dashboard'
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>(initialBreadcrumbs);
  const [pageTitle, setPageTitle] = useState<string>(initialTitle);

  const updateBreadcrumbs = useCallback((newBreadcrumbs: BreadcrumbItem[]) => {
    setBreadcrumbs(newBreadcrumbs);
  }, []);

  const resetBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
    setPageTitle('Dashboard');
  }, []);

  const value = useMemo(
    () => ({
      breadcrumbs,
      setBreadcrumbs,
      updateBreadcrumbs,
      resetBreadcrumbs,
      pageTitle,
      setPageTitle,
    }),
    [breadcrumbs, pageTitle, updateBreadcrumbs, resetBreadcrumbs]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    // Return default values instead of throwing
    console.warn('useBreadcrumb used outside BreadcrumbProvider, returning default values');
    return {
      breadcrumbs: [],
      setBreadcrumbs: () => {},
      updateBreadcrumbs: () => {},
      resetBreadcrumbs: () => {},
      pageTitle: 'Dashboard',
      setPageTitle: () => {},
    };
  }
  return context;
};