'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { getFirstPhotoUrl } from '@/app/components/common/MediaUpload';
import DepartmentalActivityDateOverlay from './DepartmentalActivityDateOverlay';
import 'suneditor/dist/css/suneditor.min.css';

const FALLBACK_IMAGE = '/images/evn-img-1.jpg';

function formatActivityDate(value) {
  if (!value) return '';
  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch {
    return '';
  }
}

function formatDateRange(fromDate, toDate) {
  const from = formatActivityDate(fromDate);
  const to = formatActivityDate(toDate);

  if (from && to && from !== to) {
    return `${from} – ${to}`;
  }
  return from || to || '—';
}

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

export default function DepartmentalActivityDetailView({ activity }) {
  const imageUrl = getFirstPhotoUrl(activity) || FALLBACK_IMAGE;
  const dateRange = formatDateRange(activity?.fromDate, activity?.toDate);
  const categoryList = normalizeCategories(activity?.category);
  const location = activity?.location?.trim();

  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-[0_4px_18px_rgba(20,58,119,0.10)]">
      <div className="relative aspect-[21/9] w-full min-h-[200px] overflow-hidden bg-[#F0F2F6] sm:aspect-[2.4/1]">
        <Image
          src={imageUrl}
          alt={activity?.title || 'Departmental activity'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
          unoptimized={imageUrl.startsWith('http')}
          priority
        />
        <DepartmentalActivityDateOverlay fromDate={activity?.fromDate} />
      </div>

      <div className="space-y-6 p-5 sm:p-8 lg:p-10">
        <header className="border-b border-[#E7EDF7] pb-5">
          <h1 className="font26 font-[700] leading-tight text-[#1B212F]">{activity?.title}</h1>
          {activity?.footerLabel ? (
            <p className="mt-2 text-sm font-medium text-primarycolor">{activity.footerLabel}</p>
          ) : null}
        </header>

        {activity?.description ? (
          <div
            className="sun-editor-editable text-sm leading-7 text-[#4B586E] sm:text-[15px]"
            dangerouslySetInnerHTML={{ __html: activity.description }}
          />
        ) : (
          <p className="text-sm text-[#6C768B]">No description has been added for this activity.</p>
        )}

        <div className="space-y-3 border-t border-[#E7EDF7] pt-6 text-sm leading-7 text-[#4B586E] sm:text-[15px]">
          <p>
            <span className="font-semibold text-[#183B6D]">Date: </span>
            <span>{dateRange}</span>
          </p>
          <p>
            <span className="font-semibold text-[#183B6D]">Location: </span>
            <span>{location || '—'}</span>
          </p>
          <div>
            <span className="font-semibold text-[#183B6D]">Category: </span>
            {categoryList.length ? (
              <ul className="mt-2 flex flex-wrap gap-2 list-none p-0">
                {categoryList.map((item) => (
                  <li key={item}>
                    <span
                      className="inline-block rounded-full border border-primarycolor/25 bg-[#FFF3F1] px-3 py-1 text-xs font-medium text-primarycolor"
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-1">—</span>
            )}
          </div>
        </div>

        {activity?.subjectPageHref ? (
          <div className="border-t border-[#E7EDF7] pt-5">
            <Link href={activity.subjectPageHref} className="arrow-link">
              Back to department<span className="arrow"></span>
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
