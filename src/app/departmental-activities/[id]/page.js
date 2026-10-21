'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';
import DepartmentalActivityDetailView from '@/app/components/departmental-activities/DepartmentalActivityDetailView';

export default function DepartmentalActivityDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/departments/public/activities/${id}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Activity not found');
        }
        setActivity(response.data.data);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : 'Activity not found';
        setError(message);
        setActivity(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const breadcrumbData = [
    { label: 'Home', url: '/' },
    { label: 'Departmental Activities', url: '/' },
    ...(activity?.title ? [{ label: activity.title, url: '' }] : []),
  ];

  if (loading) {
    return (
      <>
        <SubBanner
          title="Departmental Activity"
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'Departmental Activities', url: '/' },
          ]}
        />
        <main className="mb-5 px300 py-8">
          <div className="animate-pulse space-y-4 rounded-lg bg-white p-8 shadow-[0_4px_18px_rgba(20,58,119,0.10)]">
            <div className="aspect-[21/9] rounded bg-[#e8edf5]" />
            <div className="h-8 w-2/3 rounded bg-[#e8edf5]" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 rounded bg-[#e8edf5]" />
              <div className="h-16 rounded bg-[#e8edf5]" />
              <div className="h-16 rounded bg-[#e8edf5]" />
            </div>
            <div className="h-24 rounded bg-[#e8edf5]" />
          </div>
        </main>
      </>
    );
  }

  if (error || !activity) {
    return (
      <>
        <SubBanner
          title="Departmental Activity"
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'Departmental Activities', url: '/' },
          ]}
        />
        <main className="mb-5 px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Activity not found'}</p>
          <Link href="/" className="text-primarycolor underline">Back to Home</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SubBanner title={activity.title} subtitle={activity.footerLabel} breadcrumbData={breadcrumbData} />
      <main className="mb-5 px300">
        <DepartmentalActivityDetailView activity={activity} />
      </main>
    </>
  );
}
