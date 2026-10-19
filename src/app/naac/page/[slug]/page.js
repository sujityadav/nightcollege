'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import NaacPublicLayout from '@/app/features/naac-public/components/NaacPublicLayout';
import 'suneditor/dist/css/suneditor.min.css';

export default function NaacContentPage() {
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
        const response = await axios.get(`/api/naac-links/page/${slug}`);
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

  const title = pageData?.title || (loading ? 'Loading...' : 'Page Not Found');

  return (
    <NaacPublicLayout
      bannerTitle={title}
      breadcrumbData={[
        { label: 'Home', url: '/' },
        { label: 'NAAC / IQAC', url: '/naac/menu/iqac-composition' },
        { label: title, url: '' },
      ]}
    >
      {loading ? (
        <div className="card-shadow bg-white p-10 text-center text-[#6C768B]">Loading page...</div>
      ) : error || !pageData ? (
        <div className="card-shadow bg-white p-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Page not found'}</p>
          <Link href="/" className="text-primarycolor underline">
            Back to Home
          </Link>
        </div>
      ) : (
        <div
          className="card-shadow bg-white p-6 prose max-w-none quick-link-content"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      )}
    </NaacPublicLayout>
  );
}
