'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import NaacPublicLayout from '@/app/features/naac-public/components/NaacPublicLayout';

export default function NaacAqarRowDocumentPage() {
  const params = useParams();
  const id = params?.id;
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/naac-aqar-documents/rows/${id}/view`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Document not found');
        }
        setDocumentData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Document not found');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  return (
    <NaacPublicLayout
      hideSidebar
      bannerTitle={documentData?.title || 'AQAR Document'}
      breadcrumbData={[
        { label: 'Home', url: '/' },
        { label: 'NAAC / IQAC', url: '/naac/menu/iqac-composition' },
        { label: 'AQAR Documents', url: '/naac/aqar' },
        { label: documentData?.title || 'Document', url: '' },
      ]}
    >
      {loading ? (
        <div className="card-shadow bg-white p-10 text-center text-[#6C768B]">Loading document...</div>
      ) : error || !documentData ? (
        <div className="card-shadow bg-white p-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Document not found'}</p>
          <Link href="/naac/aqar" className="text-primarycolor underline">
            Back to AQAR Documents
          </Link>
        </div>
      ) : (
        <div className="card-shadow bg-white p-4 md:p-6">
          {documentData.viewType === 'pdf' ? (
            <iframe
              src={documentData.fileUrl}
              title={documentData.documentName || documentData.title}
              className="min-h-[75vh] w-full border border-[#E5E7EB]"
            />
          ) : (
            <div className="flex justify-center">
              <img
                src={documentData.fileUrl || documentData.documentUrl}
                alt={documentData.documentName || documentData.title}
                className="h-auto max-w-full rounded"
              />
            </div>
          )}
        </div>
      )}
    </NaacPublicLayout>
  );
}
