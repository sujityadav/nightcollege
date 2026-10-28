'use client';

import { fileDisplayName } from '@/app/lib/collegePublicationData';
import 'suneditor/dist/css/suneditor.min.css';

export default function PublicationDetailContent({ publication }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(20,58,119,0.10)]">
      <div className="space-y-6 p-5 sm:p-8 lg:p-10">
        <header className="border-b border-[#E7EDF7] pb-5">
          <h1 className="font26 font-[700] leading-tight text-[#1B212F]">
            {publication?.title || 'Publication'}
          </h1>
          {publication?.yearLabel ? (
            <p className="mt-2 text-sm font-[600] text-primarycolor">{publication.yearLabel}</p>
          ) : null}
        </header>

        {publication?.description ? (
          <div
            className="sun-editor-editable text-sm leading-7 text-[#4B586E] sm:text-[15px]"
            dangerouslySetInnerHTML={{ __html: publication.description }}
          />
        ) : null}

        {publication?.files?.length ? (
          <div className="border-t border-[#E7EDF7] pt-6">
            <h2 className="mb-4 text-lg font-[600] text-[#1B212F]">Files</h2>
            <ul className="m-0 list-none space-y-2 p-0">
              {publication.files.map((file) => (
                <li key={file.url}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.fileName || undefined}
                    className="arrow-link inline-flex"
                  >
                    {fileDisplayName(file)}
                    <span className="arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
