'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import axios from 'axios';
import {
  getDefaultPublicEventYearFilter,
  getPublicEventYearFilterOptions,
  PUBLIC_EVENT_FILTER_ALL,
  PUBLIC_EVENTS_PAGE_SIZE,
} from '@/app/lib/publicEventFilters';
import DepartmentalActivitiesFilterSelect from '@/app/components/departmental-activities/DepartmentalActivitiesFilterSelect';
import EventCard from '@/app/components/events/EventCard';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const LOAD_MORE_SKELETON_COUNT = 4;

function EventsGridSkeleton({ count }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`event-skeleton-${index}`} className="overflow-hidden border border-[#E7EDF7]">
          <div className="aspect-[4/3] animate-pulse bg-[#e8edf5]" />
          <div className="space-y-3 bg-[#f0f7ff] p-5">
            <div className="h-5 w-4/5 animate-pulse rounded bg-[#e8edf5]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#e8edf5]" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#e8edf5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [year, setYear] = useState(() => getDefaultPublicEventYearFilter());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const loadMoreRef = useRef(null);
  const fetchingRef = useRef(false);
  const filterOptions = getPublicEventYearFilterOptions();

  const fetchEvents = useCallback(async (pageToLoad, yearValue, append) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');

      const response = await axios.get('/api/events/public', {
        params: {
          year: yearValue === PUBLIC_EVENT_FILTER_ALL ? '' : yearValue,
          page: pageToLoad,
          limit: PUBLIC_EVENTS_PAGE_SIZE,
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to load events');
      }

      const nextEvents = response.data.data || [];
      setEvents((prev) => (append ? [...prev, ...nextEvents] : nextEvents));
      setHasMore(Boolean(response.data.hasMore));
      setPage(pageToLoad);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to load events';
      setError(message);
      if (!append) setEvents([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchEvents(1, year, false);
  }, [year, fetchEvents]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchEvents(page + 1, year, true);
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchEvents, hasMore, loading, loadingMore, page, year]);

  return (
    <div className="w-full py20">
      <div className="px300">
        <div className="flex flex-col items-center justify-between gap-4 pb-8 md:flex-row md:items-center">
          <div className="title">
            <div className={roboto_slab.className}>
              <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">Latest Events</h1>
            </div>
          </div>
          <DepartmentalActivitiesFilterSelect
            value={year}
            onChange={(e) => setYear(e.target.value)}
            options={filterOptions}
          />
        </div>

        {loading ? (
          <EventsGridSkeleton count={PUBLIC_EVENTS_PAGE_SIZE} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !events.length ? (
          <p className="text-sm text-[#6C768B]">No events found for the selected filter.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} className="h-full" />
              ))}
            </div>

            {loadingMore ? (
              <div className="mt-6">
                <EventsGridSkeleton count={LOAD_MORE_SKELETON_COUNT} />
              </div>
            ) : null}

            {hasMore ? <div ref={loadMoreRef} className="h-8 w-full" aria-hidden="true" /> : null}
          </>
        )}
      </div>
    </div>
  );
}
