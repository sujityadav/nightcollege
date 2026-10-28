'use client';

import Image from 'next/image';
import 'suneditor/dist/css/suneditor.min.css';

export default function AboutUsPublicContent({ data, showPhoto = false }) {
  const title = data?.title?.trim() || '';
  const photo = data?.photo?.trim();
  const hasHtml = Boolean(data?.content?.trim());

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(20,58,119,0.10)]">
      <div className="space-y-6 p-5 sm:p-8 lg:p-10">
        {title ? (
          <header className="border-b border-[#E7EDF7] pb-5">
            <h1 className="font26 font-[700] leading-tight text-[#1B212F]">{title}</h1>
          </header>
        ) : null}

        {showPhoto && photo ? (
          <div className="max-w-[500px]">
            <Image
              src={photo}
              width={500}
              height={600}
              alt={title || 'About us'}
              unoptimized={photo.startsWith('http')}
              className="h-auto w-full rounded-md border shadow-lg"
            />
          </div>
        ) : null}

        {hasHtml ? (
          <div
            className="sun-editor-editable text-sm leading-7 text-[#4B586E] sm:text-[15px]"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <p className="text-sm text-[#6C768B]">No content has been added yet.</p>
        )}
      </div>
    </article>
  );
}
