'use client';

import {
  getDepartmentalActivitiesGridClass,
  getHomeDepartmentalActivitiesGridClass,
} from './activityGridLayout';

const DEFAULT_COUNT = 2;

export default function DepartmentalActivitiesSkeleton({
  count = DEFAULT_COUNT,
  gridClassName,
}) {
  const gridClass =
    gridClassName ||
    (count >= 4
      ? getHomeDepartmentalActivitiesGridClass()
      : getDepartmentalActivitiesGridClass());

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`departmental-activity-skeleton-${index}`}
          className="overflow-hidden border border-[#E7EDF7]"
        >
          <div className="aspect-[4/3] animate-pulse bg-[#e8edf5]" />
          <div className="space-y-3 p-5 sm:p-6">
            <div className="h-5 w-4/5 animate-pulse rounded bg-[#e8edf5]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#e8edf5]" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-[#e8edf5]" />
            <div className="h-6 w-24 animate-pulse rounded bg-[#e8edf5]" />
            <div className="h-4 w-28 animate-pulse rounded bg-[#f0d4d4]" />
          </div>
        </div>
      ))}
    </div>
  );
}
