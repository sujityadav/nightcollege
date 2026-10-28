'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';
import InfrastructureDetailContent from '@/app/components/infrastructure/InfrastructureDetailContent';

export default function InfrastructureDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchFacility = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/infrastructure-facilities/public/${id}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Not found');
        }
        setFacility(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Not found');
        setFacility(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
  }, [id]);

  if (loading) {
    return (
      <>
        <SubBanner
          title="Infrastructure"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Infrastructure', url: '' }]}
        />
        <div className="px300 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-2/3 rounded bg-[#e8edf5]" />
            <div className="h-64 rounded bg-[#e8edf5]" />
          </div>
        </div>
      </>
    );
  }

  if (error || !facility) {
    return (
      <>
        <SubBanner
          title="Infrastructure"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Infrastructure', url: '' }]}
        />
        <div className="px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Not found'}</p>
          <Link href="/" className="text-primarycolor underline">Back to Home</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SubBanner
        title={facility.title}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'Infrastructure', url: '/' },
          { label: facility.title, url: '' },
        ]}
      />
      <div className="w-full">
        <div className="px300">
          <InfrastructureDetailContent facility={facility} />
        </div>
      </div>
    </>
  );
}
