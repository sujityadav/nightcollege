'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';
import SubBanner from '@/app/features/sub-banner';
import CommitteeDetailContent from '@/app/components/committees/CommitteeDetailContent';

export default function CommitteeDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug;

  const [pageTitle, setPageTitle] = useState('');
  const [yearEntries, setYearEntries] = useState([]);
  const [committee, setCommittee] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const recordIdFromQuery = searchParams.get('id');

  useEffect(() => {
    if (!slug) return;

    const loadPage = async () => {
      try {
        setLoading(true);
        setError('');

        const [yearsResponse, titleResponse] = await Promise.all([
          axios.get('/api/commities/public/years'),
          axios.get(`/api/commities/public/title/${slug}`),
        ]);

        if (!yearsResponse.data?.success) {
          throw new Error(yearsResponse.data?.message || 'Unable to load years');
        }

        const years = yearsResponse.data.data || [];
        setYearEntries(years);

        const titleFromSlug = titleResponse.data?.success
          ? titleResponse.data.data?.title
          : '';

        const initialId =
          recordIdFromQuery ||
          years.find((entry) => entry.slug === slug)?.id ||
          years[0]?.id ||
          '';

        setSelectedRecordId(initialId);
        setPageTitle(titleFromSlug || years.find((entry) => entry.id === initialId)?.title || 'Committee');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Not found');
        setYearEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug, recordIdFromQuery]);

  useEffect(() => {
    if (!selectedRecordId) {
      setCommittee(null);
      return;
    }

    const loadRecord = async () => {
      try {
        const response = await axios.get(`/api/commities/public/record/${selectedRecordId}`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Not found');
        }
        const record = response.data.data;
        setCommittee(record);
        setPageTitle(record?.title || pageTitle);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Not found');
        setCommittee(null);
      }
    };

    loadRecord();
  }, [selectedRecordId]);

  const yearOptions = useMemo(
    () =>
      yearEntries.map((entry) => ({
        label: entry.yearLabel,
        value: entry.id,
      })),
    [yearEntries]
  );

  const handleYearChange = (event) => {
    const nextId = event.value;
    const entry = yearEntries.find((item) => item.id === nextId);
    setSelectedRecordId(nextId);
    const nextSlug = entry?.slug || slug;
    router.replace(`/committees/${nextSlug}?id=${nextId}`, { scroll: false });
  };

  if (loading) {
    return (
      <>
        <SubBanner
          title="Committee"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Committee', url: '' }]}
        />
        <main className="mb-5 px300 py-8">
          <p className="text-sm text-[#6C768B]">Loading...</p>
        </main>
      </>
    );
  }

  if (error || (!loading && !yearEntries.length && !committee)) {
    return (
      <>
        <SubBanner
          title="Committee"
          breadcrumbData={[{ label: 'Home', url: '/' }, { label: 'Committee', url: '' }]}
        />
        <main className="mb-5 px300 py-10 text-center">
          <p className="mb-4 text-[#6C768B]">{error || 'Not found'}</p>
          <Link href="/" className="text-primarycolor underline">Back to Home</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SubBanner
        title={committee?.title || pageTitle}
        breadcrumbData={[
          { label: 'Home', url: '/' },
          { label: 'Committees', url: '' },
          { label: committee?.title || pageTitle, url: '' },
        ]}
      />
      <main className="mb-10 px300 py-6">
        <div className="mb-6 flex flex-wrap items-end justify-end gap-4">
          {yearOptions.length > 0 ? (
            <div className="w-full sm:w-auto sm:min-w-[240px]">
              <label className="mb-2 block text-right text-sm font-[600] text-[#1B212F]">
                Academic Year
              </label>
              <Dropdown
                value={selectedRecordId}
                options={yearOptions}
                onChange={handleYearChange}
                placeholder="Select year"
                className="w-full border rounded-none"
              />
            </div>
          ) : null}
        </div>

        {committee ? <CommitteeDetailContent committee={committee} showYearLabel={false} /> : null}
      </main>
    </>
  );
}
