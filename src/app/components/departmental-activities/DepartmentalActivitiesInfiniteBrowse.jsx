'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Roboto_Slab } from 'next/font/google';
import {
  ACTIVITY_FILTER_ALL,
  DEPARTMENTAL_ACTIVITIES_BROWSE_PAGE_SIZE,
  getBrowseDepartmentActivityFilterOptions,
  isDepartmentalActivityWithinToDate,
} from '@/app/lib/departmentActivityFilters';
import DepartmentalActivitiesFilterSelect from './DepartmentalActivitiesFilterSelect';
import DepartmentalActivityCard from './DepartmentalActivityCard';
import DepartmentalActivitiesSkeleton from './DepartmentalActivitiesSkeleton';
import { getHomeDepartmentalActivitiesGridClass } from './activityGridLayout';
const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const gridClass = getHomeDepartmentalActivitiesGridClass();
const PAGE_SIZE = DEPARTMENTAL_ACTIVITIES_BROWSE_PAGE_SIZE;
const LOAD_MORE_SKELETON_COUNT = 4;

export default function DepartmentalActivitiesInfiniteBrowse({
  subjectId,
  departmentId,
  showHeading = true,
  title = 'Departmental Activities',
}) {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState(ACTIVITY_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const loadMoreRef = useRef(null);
  const fetchingRef = useRef(false);
  const filterOptions = getBrowseDepartmentActivityFilterOptions();

  const fetchPage = useCallback(
    async (pageToLoad, filterValue, append) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError('');

        const response = await axios.get('/api/departments/public/activities/list', {
          params: {
            filter: filterValue,
            page: pageToLoad,
            limit: PAGE_SIZE,
            ...(subjectId ? { subjectId } : {}),
            ...(departmentId ? { departmentId } : {}),
          },
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to load activities');
        }

        const nextItems = response.data.data || [];
        setActivities((prev) => (append ? [...prev, ...nextItems] : nextItems));
        setHasMore(Boolean(response.data.hasMore));
        setPage(pageToLoad);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : 'Failed to load activities';
        setError(message);
        if (!append) {
          setActivities([]);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
      }
    },
    [departmentId, subjectId]
  );

  useEffect(() => {
    fetchPage(1, filter, false);
  }, [filter, fetchPage]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchPage(page + 1, filter, true);
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchPage, filter, hasMore, loading, loadingMore, page]);

  const browseFilterOptions = filterOptions;

  return (
    <div className="w-full max-w-none">
      <div
        className={`mb-6 flex w-full flex-col gap-4 border-b border-[#EEF2F8] pb-5 sm:flex-row sm:items-center ${
          showHeading ? 'sm:justify-between' : 'sm:justify-end'
        }`}
      >
        {showHeading ? (
          <div className="title min-w-0 flex-1 pb-0">
            <div className={roboto_slab.className}>
              <h1 className="font26 font-[700] leading-[140%] text-[#1B212F]">{title}</h1>
            </div>
          </div>
        ) : null}
        <DepartmentalActivitiesFilterSelect
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={browseFilterOptions}
        />
      </div>

      {loading ? (
        <DepartmentalActivitiesSkeleton count={PAGE_SIZE} gridClassName={gridClass} />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !activities.length ? (
        <div className="flex min-h-[200px] w-full items-center justify-center rounded-md border border-dashed border-[#D8E2F0] bg-[#F8FAFE] px-6 py-10 text-center">
          <p className="max-w-xl text-sm leading-7 text-[#4B586E] sm:text-[15px]">
            No departmental activities found for the selected filter.
          </p>
        </div>
      ) : (
        <>
          <div className={gridClass}>
            {activities.map((activity) => (
              <DepartmentalActivityCard
                key={activity.id}
                activity={activity}
                dimmed={!isDepartmentalActivityWithinToDate(activity.toDate)}
              />
            ))}
          </div>

          {loadingMore ? (
            <div className="mt-6">
              <DepartmentalActivitiesSkeleton
                count={LOAD_MORE_SKELETON_COUNT}
                gridClassName={gridClass}
              />
            </div>
          ) : null}

          {hasMore ? <div ref={loadMoreRef} className="h-8 w-full" aria-hidden="true" /> : null}
        </>
      )}
    </div>
  );
}
