'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildDepartmentTrailBreadcrumbs,
  resolveDepartmentHierarchy,
} from '@/app/utils/departmentBreadcrumbs';
import { usePageBreadcrumbs } from '@/app/hooks/usePageBreadcrumbs';

export function useDepartmentHierarchyBreadcrumbs({
  departmentId = null,
  subjectId = null,
  subPointId = null,
  pageTitle,
  tail = [],
}) {
  const [hierarchy, setHierarchy] = useState({
    ids: { deptId: departmentId, subjId: subjectId, subPtId: subPointId },
    titles: { departmentTitle: '', subjectTitle: '', subPointTitle: '' },
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!departmentId && !subjectId && !subPointId) {
        setHierarchy({
          ids: { deptId: null, subjId: null, subPtId: null },
          titles: { departmentTitle: '', subjectTitle: '', subPointTitle: '' },
        });
        return;
      }

      try {
        const result = await resolveDepartmentHierarchy({
          departmentId,
          subjectId,
          subPointId,
        });
        if (!cancelled) setHierarchy(result);
      } catch (error) {
        console.error('Failed to load breadcrumb hierarchy:', error);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [departmentId, subjectId, subPointId]);

  const tailKey = useMemo(() => JSON.stringify(tail ?? []), [tail]);
  const stableTail = useMemo(() => JSON.parse(tailKey), [tailKey]);

  const breadcrumbs = useMemo(
    () =>
      buildDepartmentTrailBreadcrumbs({
        ids: hierarchy.ids,
        titles: hierarchy.titles,
        tail: stableTail,
      }),
    [hierarchy, stableTail]
  );

  usePageBreadcrumbs({
    pageTitle,
    breadcrumbs,
  });

  return hierarchy;
}
