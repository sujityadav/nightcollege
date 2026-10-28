'use client';

import { format } from 'date-fns';
import PhotoGalleria from '@/app/components/galleria/index';
import 'suneditor/dist/css/suneditor.min.css';

function formatDate(value) {
  if (!value) return '';
  try {
    return format(new Date(value), 'dd MMM, yyyy');
  } catch {
    return '';
  }
}

function fileDisplayName(file) {
  if (file?.fileName) return file.fileName;
  try {
    const parts = file.url.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'Download file');
  } catch {
    return 'Download file';
  }
}

export default function InfrastructureDetailContent({ facility }) {
  const galleryImages = (facility?.photos || []).map((file, index) => ({
    itemImageSrc: file.url,
    thumbnailImageSrc: file.url,
    alt: facility?.title || `Photo ${index + 1}`,
    title: file.fileName || `Photo ${index + 1}`,
  }));

  const dateFrom = formatDate(facility?.fromDate);
  const dateTo = formatDate(facility?.toDate);
  const dateRange =
    dateFrom && dateTo && dateFrom !== dateTo ? `${dateFrom} – ${dateTo}` : dateFrom || dateTo;

  const hasSidebarMeta = Boolean(
    facility?.smallDescription || dateRange || facility?.files?.length
  );

  return (
    <div className="py-8 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        {galleryImages.length ? (
          <div className="min-w-0 w-full lg:flex-[3]">
            <div className="card galleria-demo w-full max-w-full">
              <PhotoGalleria images={galleryImages} />
            </div>
          </div>
        ) : null}

        {hasSidebarMeta ? (
          <div
            className={`min-w-0 w-full space-y-5 ${galleryImages.length ? 'lg:flex-[2]' : ''}`}
          >
            {facility?.smallDescription ? (
              <p className="text-sm leading-7 text-[#4B586E] sm:text-[15px]">
                {facility.smallDescription}
              </p>
            ) : null}

            {dateRange ? (
              <div className="flex items-center gap-3 text-sm text-[#4B586E] sm:text-[15px]">
                <i className="pi pi-calendar text-primarycolor" aria-hidden="true" />
                <p className="m-0">{dateRange}</p>
              </div>
            ) : null}

            {facility?.files?.length ? (
              <div className="space-y-2 border-t border-[#E7EDF7] pt-5">
                <h2 className="m-0 text-base font-[600] text-[#1B212F]">Downloads</h2>
                <ul className="m-0 list-none space-y-2 p-0">
                  {facility.files.map((file) => (
                    <li key={file.url}>
                      <a
                        href={file.url}
                        download={file.fileName || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
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
        ) : null}
      </div>

      {facility?.largeDescription ? (
        <div
          className="sun-editor-editable border-t border-[#E7EDF7] pt-8 text-sm leading-7 text-[#4B586E] sm:pt-10 sm:text-[15px]"
          dangerouslySetInnerHTML={{ __html: facility.largeDescription }}
        />
      ) : null}
    </div>
  );
}
