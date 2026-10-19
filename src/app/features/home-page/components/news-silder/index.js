'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const MARQUEE_SEPARATOR = '   |   ';

export default function NewsSilder() {
  const [isPaused, setIsPaused] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const response = await axios.get('/api/announcements/public');
        setAnnouncements(response.data?.data || []);
      } catch {
        setAnnouncements([]);
      }
    };
    loadAnnouncements();
  }, []);

  const marqueeItems = useMemo(() => {
    const seen = new Set();
    const items = [];
    for (const item of announcements) {
      const id = item?._id;
      const title = (item?.title || '').trim();
      if (!id || !title || seen.has(id)) continue;
      seen.add(id);
      items.push({ _id: id, title });
    }
    return items;
  }, [announcements]);

  return (
    <div className="w-full">
      <div className="bg-primarycolor flex flex-wrap items-center gap-2 3xl:gap-3 px-4 sm:px-10 md:px-20 lg:px-40 xl:px-[150px] 2xl:px-[200px] 3xl:px-[300px] py-2">
        <div className="shrink-0 w-full lg:w-auto">
          <div className="px-0 sm:px-4 3xl:px-5 py-1 sm:py-2 3xl:py-3">
            <h6 className="text-white font-semibold text-base md:text-lg lg:text-xl">
              News/Announcement
            </h6>
          </div>
        </div>

        {marqueeItems.length ? (
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex-1 overflow-hidden whitespace-nowrap border-x border-white/30 py-1"
          >
            <div
              className={`inline-block font-bold text-white animate-marquee ${isPaused ? 'pause' : ''}`}
            >
              {marqueeItems.map((item, index) => (
                <span key={item._id}>
                  <Link
                    href={`/announcement/${item._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {item.title}
                  </Link>
                  {index < marqueeItems.length - 1 ? MARQUEE_SEPARATOR : null}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
