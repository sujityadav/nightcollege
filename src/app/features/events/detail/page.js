'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '../../sub-banner';
import EventDetailContent from '@/app/components/events/EventDetailContent';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/events/public/${eventId}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Event not found');
        }
        setEvent(response.data.data);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : 'Event not found';
        setError(message);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <>
        <SubBanner
          title="Event"
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'All Events', url: '/events/all-events' },
          ]}
        />
        <div className="px300 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-2/3 rounded bg-[#e8edf5]" />
            <div className="h-64 rounded bg-[#e8edf5]" />
            <div className="h-24 rounded bg-[#e8edf5]" />
          </div>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <SubBanner
          title="Event"
          breadcrumbData={[
            { label: 'Home', url: '/' },
            { label: 'All Events', url: '/events/all-events' },
          ]}
        />
        <div className="px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Event not found'}</p>
          <Link href="/events/all-events" className="text-primarycolor underline">
            Back to All Events
          </Link>
        </div>
      </>
    );
  }

  const breadcrumbData = [
    { label: 'Home', url: '/' },
    { label: 'All Events', url: '/events/all-events' },
    { label: event.title, url: '' },
  ];

  return (
    <>
      <SubBanner title={event.title} breadcrumbData={breadcrumbData} />
      <div className="w-full">
        <div className="px300">
          <EventDetailContent event={event} />
        </div>
      </div>
    </>
  );
}
