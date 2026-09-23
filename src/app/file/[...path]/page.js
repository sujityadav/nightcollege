'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/events/components/sub-banner';
import { buildFileManagerViewApiPath } from '@/app/utils/fileManagerDocument';

export default function FilePreviewPage() {
  const params = useParams();
  const pathSegments = params?.path;
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pathSegments?.length) return;

    const fetchFile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(buildFileManagerViewApiPath(pathSegments));
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'File not found');
        }
        setFileData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'File not found');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [pathSegments]);

  const breadcrumbData = [
    { label: 'Home', url: '/' },
    { label: fileData?.title || 'File', url: '' },
  ];

  if (loading) {
    return (
      <>
        <SubBanner title="File" breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'File', url: '' }]} />
        <div className="px300 py-10 text-center text-[#6C768B]">Loading file...</div>
      </>
    );
  }

  if (error || !fileData) {
    return (
      <>
        <SubBanner title="File" breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'File', url: '' }]} />
        <div className="px300 py-10 text-center">
          <p className="text-[#6C768B] mb-4">{error || 'File not found'}</p>
          <Link href="/" className="text-primarycolor underline">
            Back to Home
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SubBanner title={fileData.title} breadcrumbData={breadcrumbData} />
      <div className="px300 py-8 pb-16">
        <div className="bg-white card-shadow p-4 md:p-6">
          {fileData.viewType === 'pdf' ? (
            <iframe
              src={fileData.fileUrl}
              title={fileData.fileName || fileData.title}
              className="w-full min-h-[75vh] border border-[#E5E7EB]"
            />
          ) : (
            <div className="flex justify-center">
              <img
                src={fileData.fileUrl}
                alt={fileData.fileName || fileData.title}
                className="max-w-full h-auto rounded"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
