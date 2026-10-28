'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';
import AboutUsPublicContent from '@/app/components/about-us/AboutUsPublicContent';
import DeskDetailContent from '@/app/components/desk/DeskDetailContent';
import { getPublicAboutUsSection } from '@/app/lib/publicAboutUsSections';

function hasPublicContent(data) {
  if (!data) return false;
  return Boolean(data.title?.trim() || data.content?.trim() || data.photo?.trim());
}

export default function AboutUsSectionPage() {
  const params = useParams();
  const sectionSlug = params?.section;
  const section = getPublicAboutUsSection(sectionSlug);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!section) {
      setError('Page not found');
      setLoading(false);
      return;
    }

    const fetchSection = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/api/about-us/public', {
          params: { type: section.apiType },
        });
        const entry = response.data?.data;
        if (!hasPublicContent(entry)) {
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

    fetchSection();
  }, [section]);

  const pageTitle = section?.label || 'About Us';

  if (!section) {
    return (
      <>
        <SubBanner
          title="About Us"
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
          title={pageTitle}
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'About', url: '/about-us/about' },
            { label: pageTitle, url: '' },
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
          title={pageTitle}
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'About', url: '/about-us/about' },
            { label: pageTitle, url: '' },
          ]}
        />
        <main className="mb-5 px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Content not available'}</p>
          <Link href="/" className="text-primarycolor underline">Back to Home</Link>
        </main>
      </>
    );
  }

  const bannerTitle = data.title?.trim() || pageTitle;
  const isDesk = Boolean(section.deskFallbackDesignation);

  return (
    <>
      <SubBanner
        title={bannerTitle}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'About', url: '/about-us/about' },
          { label: pageTitle, url: '' },
        ]}
      />
      <main className="mb-5 px300">
        {isDesk ? (
          <DeskDetailContent
            data={data}
            fallbackDesignation={section.deskFallbackDesignation}
          />
        ) : (
          <AboutUsPublicContent data={data} showPhoto={Boolean(section.showPhoto)} />
        )}
      </main>
    </>
  );
}
