'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getFirstPhotoUrl } from '@/app/components/common/MediaUpload';
import { getDepartmentalActivityDetailPath } from '@/app/lib/departmentalActivityPaths';
import DepartmentalActivityDateOverlay from './DepartmentalActivityDateOverlay';

const FALLBACK_IMAGE = '/images/evn-img-1.jpg';

export default function DepartmentalActivityCard({ activity, dimmed = false }) {
  const imageUrl = getFirstPhotoUrl(activity) || FALLBACK_IMAGE;
  const footerLabel =
    activity?.footerLabel?.trim() || activity?.location?.trim();
  const readMoreHref = getDepartmentalActivityDetailPath(activity?.id);

  return (
    <div
      className={`group h-full cursor-pointer border border-[#E7EDF7] transition-opacity ${
        dimmed ? 'opacity-50 grayscale' : ''
      }`}
    >
      <div className="img-block relative aspect-[4/3] overflow-hidden bg-[#F0F2F6]">
        <Image
          src={imageUrl}
          width={480}
          height={360}
          alt={activity?.title || 'Departmental activity'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized={imageUrl.startsWith('http')}
        />
        <DepartmentalActivityDateOverlay fromDate={activity?.fromDate} />
      </div>

      <div className="event-content space-y-3 p-5 transition-all duration-300 sm:p-6">
        <h2 className="font18 pt-2 font-[500] leading-[120%] transition-colors duration-300">
          {activity?.title}
        </h2>
        {activity?.smallDescription ? (
          <p className="font14 leading-[130%] text-[#6e6e6e] transition-colors duration-300 line-clamp-4">
            {activity.smallDescription}
          </p>
        ) : null}
        {footerLabel ? (
          <div className="inline-flex max-w-full items-center justify-center rounded-sm bg-primarycolor px-2 py-1 text-center font12 text-white">
            <p className="leading-tight">{footerLabel}</p>
          </div>
        ) : null}
        <div className="mt-4">
          <Link href={readMoreHref} className="arrow-link mt-2">
            Read more<span className="arrow"></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
