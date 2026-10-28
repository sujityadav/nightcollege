'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SubBanner from '@/app/features/sub-banner';
import {
  committeeFileDisplayName,
  committeeInlineFileUrl,
  committeeTitleToSlug,
  getCommitteeFileViewType,
  isCommitteeFilePreviewable,
} from '@/app/lib/committeeData';

export default function CommitteeFileViewPage() {
  const params = useParams();
  const id = params?.id;
  const [committee, setCommittee] = useState(null);
  const [viewType, setViewType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchRecord = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/commities/public/record/${id}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Not found');
        }
        const data = response.data.data;
        const file = data?.file;
        if (!file?.url) {
          throw new Error('File not found');
        }
        if (!isCommitteeFilePreviewable(file)) {
          window.location.href = file.url;
          return;
        }
        setCommittee(data);
        setViewType(getCommitteeFileViewType(file));
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Not found');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const fileName = committee?.file ? committeeFileDisplayName(committee.file) : 'File';
  const inlineSrc = id ? committeeInlineFileUrl(id) : '';
  const slug = committee?.title ? committeeTitleToSlug(committee.title) : '';
  const detailHref = slug && id ? `/committees/${slug}?id=${id}` : '/';

  if (loading) {
    return (
      <>
        <SubBanner
          title="Committee"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'File', url: '' }]}
        />
        <div className="px300 py-10 text-center text-[#6C768B]">Loading file...</div>
      </>
    );
  }

  if (error || !committee?.file) {
    return (
      <>
        <SubBanner
          title="Committee"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'File', url: '' }]}
        />
        <div className="px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'File not found'}</p>
          <Link href={detailHref} className="text-primarycolor underline">Back to committee</Link>
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
          { label: 'Committees', url: '' },
          { label: committee.title, url: detailHref },
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
              <a href={committee.file.url} download className="text-primarycolor underline">
                Download file
              </a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
