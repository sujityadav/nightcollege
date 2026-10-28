'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';

export default function StudentCornerListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/student-corner/public');
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Unable to load items');
        }
        setItems(response.data.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load items');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  return (
    <>
      <SubBanner
        title="Student Corner"
        breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Student Corner', url: '' }]}
      />
      <main className="mb-10 px300 py-8">
        {loading ? (
          <p className="text-sm text-[#6C768B]">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !items.length ? (
          <p className="text-sm text-[#6C768B]">No student corner items available.</p>
        ) : (
          <ul className="m-0 list-none space-y-3 p-0">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-[#E7EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(20,58,119,0.06)] sm:px-6"
              >
                <Link
                  href={`/student-corner/${item.id}`}
                  className="arrow-link inline-flex text-base font-[600] text-[#1B212F] no-underline hover:text-primarycolor"
                >
                  {item.title}
                  <span className="arrow" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
