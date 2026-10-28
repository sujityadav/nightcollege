'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import 'suneditor/dist/css/suneditor.min.css';

const STAFF_PANELS = [
  { key: 'teaching', label: 'Teaching Staff', staffType: 'Teaching' },
  { key: 'non-teaching', label: 'Non Teaching Staff', staffType: 'Non Teaching' },
];

const FALLBACK_PHOTO = '/images/admin/profile_default.png';
const ROW_MIN_HEIGHT = 200;
const BIO_MAX_HEIGHT = 72;

function StaffMemberRow({ member }) {
  const photo = member.photo || FALLBACK_PHOTO;
  const [expanded, setExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const bioRef = useRef(null);

  useLayoutEffect(() => {
    if (!member.bio || expanded) return;
    const el = bioRef.current;
    if (!el) return;
    setShowReadMore(el.scrollHeight > BIO_MAX_HEIGHT + 1);
  }, [member.bio, expanded]);

  return (
    <article
      className="grid grid-cols-1 gap-4 border-b border-[#E7EDF7] py-5 last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-5 sm:py-6"
      style={{ minHeight: expanded ? undefined : ROW_MIN_HEIGHT }}
    >
      <div className="flex justify-center sm:justify-start">
        <Image
          src={photo}
          width={120}
          height={120}
          alt={member.name || 'Staff member'}
          unoptimized={photo.startsWith('http')}
          className="h-[120px] w-[120px] rounded-full border border-[#E7EDF7] object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        <h3 className="m-0 text-lg font-[600] leading-tight text-[#1B212F]">
          {member.name || '—'}
        </h3>
        <p className="mt-1 font-[600] text-primarycolor">
          {member.designation || '—'}
        </p>

        {member.bio ? (
          <div className="mt-3">
            <div
              ref={bioRef}
              className={`sun-editor-editable text-sm leading-6 text-[#4B586E] sm:text-[15px] ${
                expanded ? '' : 'overflow-hidden'
              }`}
              style={expanded ? undefined : { maxHeight: BIO_MAX_HEIGHT }}
              dangerouslySetInnerHTML={{ __html: member.bio }}
            />
            {showReadMore ? (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-2 border-0 bg-transparent p-0 text-sm font-[600] text-primarycolor underline"
              >
                {expanded ? 'Read less' : 'Read more'}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#6C768B]">—</p>
        )}
      </div>

      <div className="flex items-end justify-start sm:items-center sm:justify-end sm:self-stretch">
        {member.resume ? (
          <a
            href={member.resume}
            download={member.resumeFileName || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="arrow-link inline-flex whitespace-nowrap text-sm"
          >
            Download Resume<span className="arrow" />
          </a>
        ) : (
          <span className="text-sm text-[#9CA3AF]">No resume</span>
        )}
      </div>
    </article>
  );
}

function StaffPanelBody({ staffType }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/stafs/public', {
        params: { staffType },
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to load staff');
      }
      setMembers(response.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load staff');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [staffType]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  if (loading) {
    return <p className="py-6 text-sm text-[#6C768B]">Loading staff...</p>;
  }

  if (error) {
    return <p className="py-6 text-sm text-red-600">{error}</p>;
  }

  if (!members.length) {
    return (
      <p className="py-6 text-sm text-[#6C768B]">No staff members have been added for this category.</p>
    );
  }

  return (
    <div>
      {members.map((member) => (
        <StaffMemberRow key={member.id} member={member} />
      ))}
    </div>
  );
}

export default function StaffDirectory({ initialPanelKey = 'teaching' }) {
  const [openKey, setOpenKey] = useState(initialPanelKey);

  useEffect(() => {
    setOpenKey(initialPanelKey);
  }, [initialPanelKey]);

  return (
    <div className="space-y-3">
      {STAFF_PANELS.map((panel) => {
        const isOpen = openKey === panel.key;
        return (
          <div
            key={panel.key}
            className="overflow-hidden rounded-md border border-[#E7EDF7] bg-white shadow-[0_2px_10px_rgba(20,58,119,0.06)]"
          >
            <button
              type="button"
              onClick={() => setOpenKey(panel.key)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-6"
              aria-expanded={isOpen}
            >
              <span className="font18 font-[600] text-[#1B212F]">{panel.label}</span>
              <i
                className={`pi ${isOpen ? 'pi-chevron-up' : 'pi-chevron-down'} text-primarycolor`}
                aria-hidden="true"
              />
            </button>
            {isOpen ? (
              <div className="border-t border-[#E7EDF7] px-4 pb-4 sm:px-6">
                <StaffPanelBody staffType={panel.staffType} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
