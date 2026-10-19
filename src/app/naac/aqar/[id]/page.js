'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import NaacPublicLayout from '@/app/features/naac-public/components/NaacPublicLayout';
import AqarDocumentBlock from '@/app/features/naac-public/components/AqarDocumentBlock';

export default function NaacAqarDetailPage() {
  const params = useParams();
  const documentId = params?.id;
  const [document, setDocument] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!documentId) return;
    const load = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/naac-aqar-documents/public/${documentId}`);
        if (!response.data?.success) {
          setDocument(null);
          setParts([]);
          return;
        }
        setDocument(response.data.data?.document || null);
        setParts(response.data.data?.parts || []);
      } catch {
        setDocument(null);
        setParts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [documentId]);

  return (
    <NaacPublicLayout
      bannerTitle="AQAR Documents"
      breadcrumbData={[
        { label: 'Home', url: '/' },
        { label: 'NAAC / IQAC', url: '/naac/menu/iqac-composition' },
        { label: 'AQAR Documents', url: '/naac/aqar' },
        { label: document?.title || 'Document', url: '' },
      ]}
    >
      <div className="mb-4">
        <Link href="/naac/aqar" className="text-sm text-primarycolor hover:underline">
          ← Back to AQAR list
        </Link>
      </div>

      {loading ? (
        <div className="card-shadow bg-white p-10 text-center text-[#6C768B]">Loading...</div>
      ) : !document || parts.length === 0 ? (
        <div className="card-shadow bg-white p-10 text-center text-[#6C768B]">
          This AQAR document is not available.
        </div>
      ) : (
        <AqarDocumentBlock document={document} parts={parts} loading={false} />
      )}
    </NaacPublicLayout>
  );
}
