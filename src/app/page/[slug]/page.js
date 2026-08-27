'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/events/components/sub-banner';
import 'suneditor/dist/css/suneditor.min.css';

export default function QuickLinkContentPage() {
  const params = useParams();
  const slug = params?.slug;
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/quick-links/page/${slug}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Page not found');
        }
        setPageData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Page not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <>
        <SubBanner title="Loading..." breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Page', url: '' }]} />
        <div className="px300 py-10 text-center text-[#6C768B]">Loading page...</div>
      </>
    );
  }

  if (error || !pageData) {
    return (
      <>
        <SubBanner title="Page Not Found" breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Page', url: '' }]} />
        <div className="px300 py-10 text-center">
          <p className="text-[#6C768B] mb-4">{error || 'Page not found'}</p>
          <Link href="/" className="text-primarycolor underline">
            Back to Home
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SubBanner
        title={pageData.title}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: pageData.title, url: '' },
        ]}
      />
      <div className="px300 py-8 pb-16">
        <div
          className="bg-white card-shadow p-6 prose max-w-none quick-link-content"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      </div>
    </>
  );
}
