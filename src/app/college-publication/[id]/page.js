'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';
import PublicationDetailContent from '@/app/components/college-publication/PublicationDetailContent';

export default function CollegePublicationDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchPublication = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/college-publication/public/${id}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Publication not found');
        }
        setPublication(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Publication not found');
        setPublication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [id]);

  if (loading) {
    return (
      <>
        <SubBanner
          title="College Publication"
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'College Publication', url: '/college-publication' },
          ]}
        />
        <main className="mb-5 px300 py-8">
          <div className="animate-pulse space-y-4 rounded-lg bg-white p-8 shadow-[0_4px_18px_rgba(20,58,119,0.10)]">
            <div className="h-8 w-2/3 rounded bg-[#e8edf5]" />
            <div className="h-24 rounded bg-[#e8edf5]" />
          </div>
        </main>
      </>
    );
  }

  if (error || !publication) {
    return (
      <>
        <SubBanner
          title="College Publication"
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'College Publication', url: '/college-publication' },
          ]}
        />
        <main className="mb-5 px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Publication not found'}</p>
          <Link href="/college-publication" className="text-primarycolor underline">
            Back to publications
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SubBanner
        title={publication.title}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'College Publication', url: '/college-publication' },
          { label: publication.title, url: '' },
        ]}
      />
      <main className="mb-5 px300">
        <PublicationDetailContent publication={publication} />
      </main>
    </>
  );
}
