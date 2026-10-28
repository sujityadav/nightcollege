'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';
import {
  fileDisplayName,
  getStudentCornerFileViewType,
  studentCornerInlineFileUrl,
} from '@/app/lib/studentCornerData';

export default function StudentCornerFileViewPage() {
  const params = useParams();
  const id = params?.id;
  const fileIndex = Number(params?.fileIndex);
  const [item, setItem] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || Number.isNaN(fileIndex)) return;

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/student-corner/public/${id}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Not found');
        }
        const data = response.data.data;
        const selected = data.files?.[fileIndex];
        if (!selected) {
          throw new Error('File not found');
        }
        const viewType = getStudentCornerFileViewType(selected);
        if (!viewType) {
          window.location.href = selected.url;
          return;
        }
        setItem(data);
        setFile({ ...selected, viewType });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Not found');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, fileIndex]);

  const fileName = file ? fileDisplayName(file) : 'File';
  const viewType = file?.viewType || (file ? getStudentCornerFileViewType(file) : null);
  const inlineSrc = id != null && file ? studentCornerInlineFileUrl(id, fileIndex) : '';

  if (loading) {
    return (
      <>
        <SubBanner
          title="Student Corner"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'File', url: '' }]}
        />
        <div className="px300 py-10 text-center text-[#6C768B]">Loading file...</div>
      </>
    );
  }

  if (error || !file || !item) {
    return (
      <>
        <SubBanner
          title="Student Corner"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'File', url: '' }]}
        />
        <div className="px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'File not found'}</p>
          <Link href={`/student-corner/${id}`} className="text-primarycolor underline">
            Back to item
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SubBanner
        title={fileName}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'Student Corner', url: '/student-corner' },
          { label: item.title, url: `/student-corner/${id}` },
          { label: fileName, url: '' },
        ]}
      />
      <div className="px300 py-8 pb-16">
        <div className="bg-white card-shadow p-4 md:p-6">
          {viewType === 'pdf' ? (
            <iframe
              src={inlineSrc}
              title={fileName}
              className="w-full min-h-[75vh] border border-[#E5E7EB]"
            />
          ) : viewType === 'image' ? (
            <div className="flex justify-center">
              <img src={inlineSrc} alt={fileName} className="max-h-[80vh] max-w-full object-contain" />
            </div>
          ) : (
            <p className="text-center text-[#6C768B]">
              <a href={file.url} download className="text-primarycolor underline">Download file</a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
