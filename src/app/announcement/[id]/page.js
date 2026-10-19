'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';
import 'suneditor/dist/css/suneditor.min.css';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/announcements/public/${id}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Announcement not found');
        }
        setAnnouncement(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Announcement not found');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  if (loading) {
    return (
      <>
        <SubBanner
          title="Announcement"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Announcement', url: '' }]}
        />
        <div className="px300 py-10 text-center text-[#6C768B]">Loading announcement...</div>
      </>
    );
  }

  if (error || !announcement) {
    return (
      <>
        <SubBanner
          title="Announcement"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Announcement', url: '' }]}
        />
        <div className="px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Announcement not found'}</p>
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
        title={announcement.title}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'Announcement', url: '' },
          { label: announcement.title, url: '' },
        ]}
      />
      <div className="px300 py-8 pb-16">
        <div className="card-shadow bg-white p-6 md:p-8">
          <div
            className="prose max-w-none quick-link-content text-[#212325]"
            dangerouslySetInnerHTML={{ __html: announcement.description }}
          />
        </div>
      </div>
    </>
  );
}
