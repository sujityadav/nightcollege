'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import NaacPublicLayout from '@/app/features/naac-public/components/NaacPublicLayout';

export default function NaacAqarPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const listResponse = await axios.get('/api/naac-aqar-documents/public');
        setDocuments(listResponse.data?.data || []);
      } catch {
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <NaacPublicLayout
      bannerTitle="AQAR Documents"
      breadcrumbData={[
        { label: 'Home', url: '/' },
        { label: 'NAAC / IQAC', url: '/naac/menu/iqac-composition' },
        { label: 'AQAR Documents', url: '' },
      ]}
    >
      {loading ? (
        <div className="card-shadow bg-white p-10 text-center text-[#6C768B]">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="card-shadow bg-white p-10 text-center text-[#6C768B]">
          No AQAR documents are published yet.
        </div>
      ) : (
        <div className="card-shadow bg-white p-6 sm:p-10">
          <ul className="m-0 list-none space-y-3 p-0">
            {documents.map((doc) => (
              <li key={doc._id}>
                <Link
                  href={`/naac/aqar/${doc._id}`}
                  className="text-lg font-medium text-primarycolor hover:underline"
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </NaacPublicLayout>
  );
}
