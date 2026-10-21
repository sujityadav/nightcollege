'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { getEventDetailPath } from '@/app/lib/publicEventFilters';

const FALLBACK_IMAGE = '/images/evn-img-1.jpg';

function parseEventDateParts(fromDate) {
  if (!fromDate) {
    return { day: '', month: '', year: '' };
  }

  try {
    const date = new Date(fromDate);
    return {
      day: format(date, 'd'),
      month: format(date, 'MMMM'),
      year: format(date, 'yyyy'),
    };
  } catch {
    return { day: '', month: '', year: '' };
  }
}

export default function EventCard({ event, className = '' }) {
  const imageUrl = event?.imageUrl || FALLBACK_IMAGE;
  const { day, month, year } = parseEventDateParts(event?.fromDate);
  const href = getEventDetailPath(event?.id);

  return (
    <div className={`group flex h-full cursor-pointer flex-col ${className}`}>
      <div className="img-block relative aspect-[4/3] shrink-0 overflow-hidden bg-[#F0F2F6]">
        <Image
          src={imageUrl}
          width={400}
          height={300}
          alt={event?.title || 'Event'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized={imageUrl.startsWith('http')}
        />
        {day || month || year ? (
          <div className="absolute bottom-[10px] left-4 rounded-sm bg-primarycolor p-2 text-center text-white">
            <div className="flex flex-col">
              {day ? <h3 className="font20 font-[700] text-white">{day}</h3> : null}
              <p className="font14 font-[300]">
                {month ? <span>{month}</span> : null}
                {year ? <span> {year}</span> : null}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="event-content flex flex-1 flex-col bg-[#f0f7ff] p20 transition-all duration-300 group-hover:bg-primarycolor group-hover:text-white">
        <h2 className="font18 pt-2 font-[500] leading-[120%] transition-colors duration-300 line-clamp-2">
          {event?.title}
        </h2>
        {event?.smallDescription ? (
          <p className="mt-2 flex-1 font14 leading-[130%] text-[#6e6e6e] transition-colors duration-300 line-clamp-3 group-hover:text-white">
            {event.smallDescription}
          </p>
        ) : (
          <div className="flex-1" />
        )}
        <div className="mt-4 shrink-0">
          <Link href={href} className="arrow-link mt-2 group-hover:text-white">
            Read more<span className="arrow"></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
