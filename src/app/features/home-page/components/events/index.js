'use client';

import React from 'react';
import { Roboto_Slab } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Events() {


  const ArrowStyle = "bg-[#9e1c1c] w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform";

  const NextArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 -translate-y-1/2 right-[-50px] z-10 cursor-pointer"
      onClick={onClick}
    >
      <div className={ArrowStyle}>
        <span className="text-white "><i className='pi pi-angle-right text-lg'></i></span>
      </div>
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 -translate-y-1/2 left-[-50px] z-10 cursor-pointer"
      onClick={onClick}
    >
      <div className={ArrowStyle}>
        <span className="text-white text-xl"><i className='pi pi-angle-left text-lg'></i></span>
      </div>
    </div>
  );

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
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [

      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };


  return (
    <div className="w-full py50">
      <div className="px300">
        <div className='title pb30'>
          <div className={roboto_slab.className}>
            <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">
              Latest Events
            </h1>
          </div>
        </div>
        <div className="">
          <Slider {...settings}>
            {events.map((event) => (
              <div key={event.id} className="px20">
                <div className="group cursor-pointer">
                  {/* Image Block */}
                  <div className="img-block relative overflow-hidden">
                    <Image
                      src={event.image}
                      width={400}
                      height={280}
                      alt="event"
                      className="3xl:w-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-[10px] left-4 bg-primarycolor p-2 text-center text-white rounded-sm">
                      <div className="flex flex-col">
                        <h3 className="font20 font-[700] text-white">{event.day}</h3>
                        <p className="font14 font-[300]">
                          <span>{event.month}</span> <span>{event.year}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="event-content bg-[#f0f7ff] p20 transition-all duration-300 group-hover:bg-primarycolor group-hover:text-white">
                    <h1 className="font18 font-[500] leading-[120%] pt-2 transition-colors duration-300">
                      {event.title}
                    </h1>
                    <p className="mt-2 text-[#6e6e6e] leading-[130%] font14 transition-colors duration-300 group-hover:text-white">
                      {event.description}
                    </p>
                    <div className="mt-4">
                      <Link href="" className="arrow-link mt-2 group-hover:text-white">
                        Read more<span className="arrow"></span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>

          <div className='mt20 text-center flex justify-center'>

              <Link href='' class="arrow-link mt-2 ">Read More<span class="arrow"></span></Link>
          </div>


        </div>
      </div>
    </div>
  );
}
