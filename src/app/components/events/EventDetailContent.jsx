'use client';

import { format } from 'date-fns';
import PhotoGalleria from '@/app/components/galleria/index';
import 'suneditor/dist/css/suneditor.min.css';

function normalizeCategories(category) {
  if (!category) return [];
  if (Array.isArray(category)) {
    return category.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof category === 'string') {
    return category
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [String(category)];
}

function formatEventDate(fromDate) {
  if (!fromDate) return '—';
  try {
    return format(new Date(fromDate), 'dd MMM, yyyy');
  } catch {
    return '—';
  }
}

export default function EventDetailContent({ event }) {
  const categories = normalizeCategories(event?.category);
  const galleryImages = (event?.photos || []).map((url, index) => ({
    itemImageSrc: url,
    thumbnailImageSrc: url,
    alt: event?.title || `Event Image ${index + 1}`,
    title: `Event Photo ${index + 1}`,
  }));

  const hasSidebarMeta =
    categories.length > 0 ||
    event?.location ||
    event?.fromDate ||
    event?.smallDescription;

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
            {categories.length ? (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {categories.map((item) => (
                  <span
                    key={item}
                    className="inline-block shrink-0 rounded-md bg-primarycolor px-3 py-1 text-center font14 text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}

            {event?.location ? (
              <div className="flex items-center gap-3 text-sm text-[#4B586E] sm:text-[15px]">
                <i className="pi pi-map-marker text-primarycolor" aria-hidden="true" />
                <p className="m-0">{event.location}</p>
              </div>
            ) : null}

            <div className="flex items-center gap-3 text-sm text-[#4B586E] sm:text-[15px]">
              <i className="pi pi-calendar text-primarycolor" aria-hidden="true" />
              <p className="m-0">{formatEventDate(event?.fromDate)}</p>
            </div>

            {event?.smallDescription ? (
              <p className="text-sm leading-7 text-[#4B586E] sm:text-[15px]">
                {event.smallDescription}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {event?.description ? (
        <div
          className="sun-editor-editable py-8 text-sm leading-7 text-[#4B586E] sm:py-10 sm:text-[15px]"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
      ) : null}
    </div>
  );
}
