'use client';

import Link from 'next/link';
import {
  committeeFileDisplayName,
  isCommitteeFilePreviewable,
} from '@/app/lib/committeeData';
import 'suneditor/dist/css/suneditor.min.css';

export default function CommitteeDetailContent({ committee, showYearLabel = true }) {
  const file = committee?.file;
  const fileName = file ? committeeFileDisplayName(file) : '';
  const canPreview = file && isCommitteeFilePreviewable(file);
  const recordId = committee?.id;

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(20,58,119,0.10)]">
      <div className="space-y-6 p-5 sm:p-8 lg:p-10">
        <header className="border-b border-[#E7EDF7] pb-5">
          <h1 className="font26 font-[700] leading-tight text-[#1B212F]">
            {committee?.title || 'Committee'}
          </h1>
          {showYearLabel && committee?.yearLabel ? (
            <p className="mt-2 text-sm font-[600] text-primarycolor">{committee.yearLabel}</p>
          ) : null}
          {committee?.smallDescription ? (
            <p className="mt-3 text-sm text-[#4B586E]">{committee.smallDescription}</p>
          ) : null}
        </header>

        {committee?.largeDescription ? (
          <div
            className="sun-editor-editable text-sm leading-7 text-[#4B586E] sm:text-[15px]"
            dangerouslySetInnerHTML={{ __html: committee.largeDescription }}
          />
        ) : null}

        {file ? (
          <div className="border-t border-[#E7EDF7] pt-6">
            <h2 className="mb-3 text-lg font-[600] text-[#1B212F]">Attachment</h2>
            {canPreview && recordId ? (
              <Link
                href={`/committees/view/${recordId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="arrow-link inline-flex"
              >
                {fileName}
                <span className="arrow" />
              </Link>
            ) : (
              <a href={file.url} download={file.fileName || undefined} className="arrow-link inline-flex">
                {fileName}
                <span className="arrow" />
              </a>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
