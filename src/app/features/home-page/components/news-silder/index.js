'use client';

import React, { useState } from 'react';





export default function NewsSilder() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="w-full ">
      <div className='bg-primarycolor flex gap-3 items-center px300'>
        <div className='h-full '>
          <div className='px-5 py-3'><h6 className='text-white font-[600] font20'>News/Announcement</h6></div>
          
          </div>
         <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="overflow-hidden whitespace-nowrap py-1 border-r border-l"
    >
      <div
        className={`inline-block font-[300] text-white animate-marquee ${isPaused ? 'pause' : ''}`}
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
