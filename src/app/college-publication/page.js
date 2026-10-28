'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';

export default function CollegePublicationListPage() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/college-publication/public');
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Unable to load publications');
        }
        setPublications(response.data.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load publications');
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  return (
    <>
      <SubBanner
        title="College Publication"
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'College Publication', url: '' },
        ]}
      />
      <main className="mb-10 px300 py-8">
        {loading ? (
          <p className="text-sm text-[#6C768B]">Loading publications...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !publications.length ? (
          <p className="text-sm text-[#6C768B]">No publications available.</p>
        ) : (
          <ul className="m-0 list-none space-y-3 p-0">
            {publications.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-[#E7EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(20,58,119,0.06)] sm:px-6"
              >
                <Link
                  href={`/college-publication/${item.id}`}
                  className="arrow-link inline-flex text-base font-[600] text-[#1B212F] no-underline hover:text-primarycolor"
                >
                  {item.title}
                  <span className="arrow" />
                </Link>
                {item.yearLabel ? (
                  <p className="mt-1 text-sm text-[#6C768B]">{item.yearLabel}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
