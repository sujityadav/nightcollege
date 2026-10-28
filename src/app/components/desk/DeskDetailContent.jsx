'use client';

import Image from 'next/image';
import { formatOurDesignation } from '@/app/lib/deskRoles';
import 'suneditor/dist/css/suneditor.min.css';

export default function DeskDetailContent({ data, fallbackDesignation }) {
  const title = data?.title?.trim() || '';
  const photo = data?.photo?.trim();
  const designationLine = formatOurDesignation(data?.designation, fallbackDesignation);
  const hasHtml = Boolean(data?.content?.trim());

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(20,58,119,0.10)]">
      <div className="space-y-6 p-5 sm:p-8 lg:p-10">
        <header className="flex flex-col gap-6 border-b border-[#E7EDF7] pb-6 sm:flex-row sm:items-start">
          {photo ? (
            <div className="shrink-0">
              <Image
                src={photo}
                width={205}
                height={240}
                alt={title || designationLine}
                unoptimized={photo.startsWith('http')}
                className="h-auto w-full max-w-[205px] rounded-md border-2 shadow-lg"
              />
            </div>
          ) : null}
          <div className="min-w-0">
            {title ? (
              <h1 className="font26 font-[700] leading-tight text-[#1B212F]">{title}</h1>
            ) : null}
            {designationLine ? (
              <p className="mt-2 font-[700] leading-none text-primarycolor">{designationLine}</p>
            ) : null}
          </div>
        </header>

        {hasHtml ? (
          <div
            className="sun-editor-editable text-sm leading-7 text-[#4B586E] sm:text-[15px]"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <p className="text-sm text-[#6C768B]">No description has been added yet.</p>
        )}
      </div>
    </article>
  );
}
