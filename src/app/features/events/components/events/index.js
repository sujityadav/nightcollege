'use client';

import React, { useState } from 'react';
import { Roboto_Slab } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { Dropdown } from 'primereact/dropdown';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Events() {
  const [selectedYear, setSelectedYear] = useState(null);
  const Year = [
    { name: '2021-2022', code: 'NY' },
    { name: '2022-2023', code: 'RM' },
    { name: '2023-2024', code: 'LDN' },
    { name: '2024-2025', code: 'IST' },
    { name: '2025-2026', code: 'PRS' },
  ];

  const events = [
    {
      id: 1,
      image: "/images/evn-img-1.jpg",
      day: "20",
      month: "March",
      year: "2025",
      title: "Digital Education Market Briefing: Minnesota 2023",
      description:
        "Seamlessly visualize quality ellectual capital without superior collaboration and idea tically....",
    },
    {
      id: 2,
      image: "/images/evn-img-1.jpg",
      day: "20",
      month: "March",
      year: "2025",
      title: "Digital Education Market Briefing: Minnesota 2023",
      description:
        "Seamlessly visualize quality ellectual capital without superior collaboration and idea tically....",
    },
    {
      id: 3,
      image: "/images/evn-img-1.jpg",
      day: "20",
      month: "March",
      year: "2025",
      title: "Digital Education Market Briefing: Minnesota 2023",
      description:
        "Seamlessly visualize quality ellectual capital without superior collaboration and idea tically....",
    },
    {
      id: 4,
      image: "/images/evn-img-1.jpg",
      day: "20",
      month: "March",
      year: "2025",
      title: "Digital Education Market Briefing: Minnesota 2023",
      description:
        "Seamlessly visualize quality ellectual capital without superior collaboration and idea tically....",
    },
    {
      id: 5,
      image: "/images/evn-img-1.jpg",
      day: "20",
      month: "March",
      year: "2025",
      title: "Digital Education Market Briefing: Minnesota 2023",
      description:
        "Seamlessly visualize quality ellectual capital without superior collaboration and idea tically....",
    },
  ];

  return (
    <div className="w-full py20">
      <div className="px300">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-4 pb20">
          <div className='title  '>
          <div className={roboto_slab.className}> <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]"> Latest Events </h1> </div> </div> <div> <Dropdown value={selectedYear} onChange={(e) => setSelectedYear(e.value)} options={Year} optionLabel="name" placeholder="Select a year" className="w-14rem" /> </div> </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 3xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <div key={event.id} className="group cursor-pointer">
              {/* Image Block */}
              <div className="relative overflow-hidden">
                <Image
                  src={event.image}
                  width={400}
                  height={280}
                  alt="event"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 bg-[#9e1c1c] p-2 text-center text-white rounded-sm">
                  <div className="flex flex-col leading-tight">
                    <h3 className="text-lg font-bold">{event.day}</h3>
                    <p className="text-xs font-light">
                      <span>{event.month}</span> <span>{event.year}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Block */}
              <div className="bg-[#f0f7ff] p-5 transition-colors duration-300 group-hover:bg-[#9e1c1c] group-hover:text-white">
                <h1 className="text-lg font-medium leading-snug transition-colors duration-300">
                  {event.title}
                </h1>
                <p className="mt-2 text-sm text-[#6e6e6e] leading-snug transition-colors duration-300 group-hover:text-white">
                  {event.description}
                </p>
                <div className="mt-4">
                  <Link href="" className="arrow-link mt-2 group-hover:text-white">
                    Read more<span className="arrow"></span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
         <div className='my30 text-center flex justify-center'>
           <Link href="" className="my-button shadow-2xl px20 py10 bg-primarycolor rounded-sm cursor-pointer relative overflow-hidden">
              <span className="text-center text-white font15 font-[500] my-auto">Load More</span>
            </Link>
          </div>
      </div>
    </div>
  );
}
