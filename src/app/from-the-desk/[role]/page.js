'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';
import DeskDetailContent from '@/app/components/desk/DeskDetailContent';
import { getDeskRoleConfig } from '@/app/lib/deskRoles';

export default function FromTheDeskDetailPage() {
  const params = useParams();
  const roleSlug = params?.role;
  const roleConfig = getDeskRoleConfig(roleSlug);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roleConfig) {
      setError('Page not found');
      setLoading(false);
      return;
    }

    const fetchDesk = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/api/about-us/public', {
          params: { type: roleConfig.apiType },
        });
        const entry = response.data?.data;
        if (!entry?.title?.trim() && !entry?.content?.trim() && !entry?.photo?.trim()) {
          throw new Error('Content not available');
        }
        setData(entry);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Content not available');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDesk();
  }, [roleConfig]);

  const bannerTitle = data?.title?.trim() || roleConfig?.pageTitle || 'From the Desk';

  if (!roleConfig) {
    return (
      <>
        <SubBanner
          title="From the Desk"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Not found', url: '' }]}
        />
        <main className="mb-5 px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">Page not found</p>
          <Link href="/" className="text-primarycolor underline">Back to Home</Link>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SubBanner
          title={roleConfig.pageTitle}
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: roleConfig.pageTitle, url: '' },
          ]}
        />
        <main className="mb-5 px300 py-8">
          <div className="animate-pulse space-y-4 rounded-lg bg-white p-8 shadow-[0_4px_18px_rgba(20,58,119,0.10)]">
            <div className="h-8 w-2/3 rounded bg-[#e8edf5]" />
            <div className="h-40 rounded bg-[#e8edf5]" />
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <SubBanner
          title={roleConfig.pageTitle}
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: roleConfig.pageTitle, url: '' },
          ]}
        />
        <main className="mb-5 px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Content not available'}</p>
          <Link href="/" className="text-primarycolor underline">Back to Home</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SubBanner
        title={bannerTitle}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'From the Desk', url: '/' },
          { label: bannerTitle, url: '' },
        ]}
      />
      <main className="mb-5 px300">
        <DeskDetailContent data={data} fallbackDesignation={roleConfig.fallbackDesignation} />
      </main>
    </>
  );
}
