'use client';

import React from 'react';
import { Roboto_Slab } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export default function DepartmentEvents() {
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
  
  ];

  return (
    <div className="w-full py50">
      <div className="px300">
        <div className="title pb30">
          <div className={roboto_slab.className}>
            <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">
              Departmental Activities
            </h1>
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid lg:gap:2 xl:gap-3 3xl:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <div key={event.id} className="group cursor-pointer border">
              {/* Image Block */}
              <div className="img-block relative overflow-hidden">
                <Image
                  src={event.image}
                  width={400}
                  height={280}
                  alt="event"
                  className="w-full 3xl:w-full transition-transform duration-300 group-hover:scale-105"
                />
                 <div className="absolute top-[10px] right-3 bg-primarycolor rounded-md p-1 text-center text-white font14 px-3">
                      <div className="flex gap-1">
                        <h3 className=" font-[700] text-white">{event.day}</h3>
                        <p className=" font-[300]">
                          <span>{event.month}</span> <span>{event.year}</span>
                        </p>
                      </div>
                    </div>
                
              </div>

              {/* Content */}
              <div className="event-content  p20 transition-all duration-300 space-y-4">
                <h1 className="font18 font-[500] leading-[120%] pt-2 transition-colors duration-300">
                  {event.title}
                </h1>
                <p className=" text-[#6e6e6e] leading-[130%] font14 transition-colors duration-300 ">
                  {event.description}
                </p>
                <div className="flex items-center gap-1 bg-primarycolor p-1 justify-center text-white rounded-sm w-[100px] text-center font12">
                  <div className="  font-[500] leading-tight">
                    <h6 className="text-white">{event.day}</h6>
                   </div>
                  <p className="leading-tight">
                     {event.month} {event.year}
                    </p>
                </div>
                <div className="mt-4">
                  <Link href="" className="arrow-link mt-2">
                    Read more<span className="arrow"></span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Read More Button */}
        <div className="mt20 text-center flex justify-center">
          <Link href="" className="my-button shadow-2xl px20 py10 bg-primarycolor rounded-sm cursor-pointer relative overflow-hidden">
              <span className="text-center text-white font15 font-[500] my-auto">View More</span>
            </Link>
        </div>
      </div>
    </div>
  );
}
