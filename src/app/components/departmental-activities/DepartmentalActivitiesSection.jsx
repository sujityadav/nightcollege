'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Roboto_Slab } from 'next/font/google';
import {
  getDefaultDepartmentActivityYearFilter,
  getDepartmentActivityFilterOptions,
} from '@/app/lib/departmentActivityFilters';
import DepartmentalActivitiesFilterSelect from './DepartmentalActivitiesFilterSelect';
import DepartmentalActivitiesList from './DepartmentalActivitiesList';
import DepartmentalActivitiesSkeleton from './DepartmentalActivitiesSkeleton';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export default function DepartmentalActivitiesSection({
  subjectId,
  departmentId,
  activities: activitiesProp,
  showHeading = true,
  title = 'Departmental Activities',
  initialFilter = getDefaultDepartmentActivityYearFilter(),
  fetchFromApi = true,
}) {
  const [activities, setActivities] = useState(activitiesProp || []);
  const [loading, setLoading] = useState(Boolean(fetchFromApi && subjectId));
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  const filterOptions = useMemo(() => getDepartmentActivityFilterOptions(), []);

  useEffect(() => {
    if (!fetchFromApi) {
      setActivities(activitiesProp || []);
      setLoading(false);
    }
  }, [fetchFromApi, activitiesProp]);

  useEffect(() => {
    if (!fetchFromApi) {
      return;
    }

    if (!subjectId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get('/api/departments/public/activities', {
          params: {
            subjectId,
            filter,
            ...(departmentId ? { departmentId } : {}),
          },
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to load activities');
        }

        setActivities(response.data.data || []);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : 'Failed to load activities';
        setError(message);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [subjectId, departmentId, filter, fetchFromApi]);

  return (
    <div className="w-full max-w-none">
      {showHeading ? (
        <div className="mb-6 flex w-full flex-col gap-4 border-b border-[#EEF2F8] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="title min-w-0 flex-1 pb-0">
            <div className={roboto_slab.className}>
              <h1 className="font26 font-[700] leading-[140%] text-[#1B212F]">{title}</h1>
            </div>
          </div>

          {fetchFromApi && subjectId ? (
            <DepartmentalActivitiesFilterSelect
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={filterOptions}
            />
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <DepartmentalActivitiesSkeleton />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <DepartmentalActivitiesList
          key={filter}
          activities={activities}
          applyExpiryDimming
        />
      )}
    </div>
  );
}
