'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Roboto_Slab } from 'next/font/google';
import DepartmentalActivitiesList from '@/app/components/departmental-activities/DepartmentalActivitiesList';
import DepartmentalActivitiesSkeleton from '@/app/components/departmental-activities/DepartmentalActivitiesSkeleton';
import { getHomeDepartmentalActivitiesGridClass } from '@/app/components/departmental-activities/activityGridLayout';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const HOME_ACTIVITY_COUNT = 4;
const homeGridClass = getHomeDepartmentalActivitiesGridClass();

export default function DepartmentEvents() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/departments/public/activities/home');
        if (response.data?.success) {
          setActivities(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to load homepage departmental activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="w-full py50">
      <div className="px300">
        <div className="title pb30">
          <div className={roboto_slab.className}>
            <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">
              Departmental Activities
            </h1>
          </div>
        </div>

        {loading ? (
          <DepartmentalActivitiesSkeleton count={HOME_ACTIVITY_COUNT} gridClassName={homeGridClass} />
        ) : (
          <DepartmentalActivitiesList
            activities={activities}
            pageSize={HOME_ACTIVITY_COUNT}
            enableViewMore={false}
            gridClassName={homeGridClass}
            emptyMessage="No current departmental activities to display."
          />
        )}

        <div className="mt20 flex justify-center text-center">
          <Link
            href="/departmental-activities"
            className="my-button relative cursor-pointer overflow-hidden rounded-sm bg-primarycolor px20 py10 shadow-2xl"
          >
            <span className="text-center font15 font-[500] text-white">View More</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
