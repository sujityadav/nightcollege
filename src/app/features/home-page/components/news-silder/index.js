'use client';

import React, { useState } from 'react';





export default function NewsSilder() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="w-full">
  <div className="bg-primarycolor flex flex-wrap items-center gap-2 3xl:gap-3 px-4 sm:px-10 md:px-20 lg:px-40 xl:px-[150px] 2xl:px-[200px] 3xl:px-[300px] py-2">
    
    {/* News Title */}
    <div className="shrink-0 w-full lg:w-auto">
      <div className="px-0 sm:px-4 3xl:px-5 py-1 sm:py-2 3xl:py-3">
        <h6 className="text-white font-semibold text-base md:text-lg lg:text-xl">News/Announcement</h6>
      </div>
    </div>

    {/* Scrolling Text */}
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="flex-1 overflow-hidden whitespace-nowrap border-x border-white/30 py-1"
    >
      <div
        className={`inline-block font-light text-white animate-marquee ${isPaused ? 'pause' : ''}`}
      >
        Breaking News or Scrolling text using Marquee in Blogger &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        Breaking News or Scrolling text using Marquee in Blogger &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
        Breaking News or Scrolling text using Marquee in Blogger &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
      </div>
    </div>

  </div>
</div>

  );
}
