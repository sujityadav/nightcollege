'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';
import StudentCornerDetailContent from '@/app/components/student-corner/StudentCornerDetailContent';

export default function StudentCornerDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/student-corner/public/${id}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Not found');
        }
        setItem(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Not found');
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <>
        <SubBanner
          title="Student Corner"
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'Student Corner', url: '/student-corner' },
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

  if (error || !item) {
    return (
      <>
        <SubBanner
          title="Student Corner"
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'Student Corner', url: '/student-corner' },
          ]}
        />
        <main className="mb-5 px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Not found'}</p>
          <Link href="/student-corner" className="text-primarycolor underline">Back to Student Corner</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SubBanner
        title={item.title}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'Student Corner', url: '/student-corner' },
          { label: item.title, url: '' },
        ]}
      />
      <main className="mb-5 px300">
        <StudentCornerDetailContent item={item} />
      </main>
    </>
  );
}
