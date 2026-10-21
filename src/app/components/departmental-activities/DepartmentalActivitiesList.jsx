'use client';

import { useMemo, useState } from 'react';
import DepartmentalActivityCard from './DepartmentalActivityCard';
import { isDepartmentalActivityWithinToDate } from '@/app/lib/departmentActivityFilters';
import {
  getDepartmentalActivitiesGridClass,
  getHomeDepartmentalActivitiesGridClass,
} from './activityGridLayout';

const DEFAULT_ROW_SIZE = 2;

export default function DepartmentalActivitiesList({
  activities = [],
  emptyMessage = 'No departmental activities found for the selected filter.',
  gridClassName,
  pageSize = DEFAULT_ROW_SIZE,
  enableViewMore = true,
  applyExpiryDimming = false,
}) {
  const [showAll, setShowAll] = useState(false);

  const list = useMemo(() => activities || [], [activities]);
  const visibleActivities = showAll ? list : list.slice(0, pageSize);
  const hasMore = enableViewMore && list.length > pageSize;

  const gridClass =
    gridClassName ||
    (pageSize >= 4
      ? getHomeDepartmentalActivitiesGridClass()
      : getDepartmentalActivitiesGridClass());

  if (!list.length) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed border-[#D8E2F0] bg-[#F8FAFE] px-6 py-10 text-center">
        <p className="max-w-xl text-sm leading-7 text-[#4B586E] sm:text-[15px]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={gridClass}>
        {visibleActivities.map((activity) => (
          <DepartmentalActivityCard
            key={activity.id}
            activity={activity}
            dimmed={
              applyExpiryDimming
                ? !isDepartmentalActivityWithinToDate(activity.toDate)
                : false
            }
          />
        ))}
      </div>

      {hasMore && !showAll ? (
        <div className="mt20 flex justify-center text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="my-button relative cursor-pointer overflow-hidden rounded-sm bg-primarycolor px20 py10 shadow-2xl"
          >
            <span className="my-auto text-center font15 font-[500] text-white">View More</span>
          </button>
        </div>
      ) : null}
    </>
  );
}
