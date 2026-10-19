'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';

export default function NaacDocumentPage() {
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
        const response = await axios.get(`/api/naac-links/view/${id}`);
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

  const breadcrumbData = [
    { label: 'Home', url: '/' },
    { label: documentData?.title || 'Document', url: '' },
  ];

  if (loading) {
    return (
      <>
        <SubBanner
          title="Document"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Document', url: '' }]}
        />
        <div className="px300 py-10 text-center text-[#6C768B]">Loading document...</div>
      </>
    );
  }

  if (error || !documentData) {
    return (
      <>
        <SubBanner
          title="Document"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Document', url: '' }]}
        />
        <div className="px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Document not found'}</p>
          <Link href="/" className="text-primarycolor underline">
            Back to Home
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SubBanner title={documentData.title} breadcrumbData={breadcrumbData} />
      <div className="px300 py-8 pb-16">
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
      </div>
    </>
  );
}
