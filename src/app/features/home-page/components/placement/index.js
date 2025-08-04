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

export default function Placement() {

  const events = [
    {
      id: 1,
       image: "/images/p1.png",
      
    },
    {
      id: 2,
        image: "/images/p2.png",
      
    },
    {
      id: 3,
      image: "/images/p1.png",
      
    },
    {
      id: 4,
      image: "/images/p2.png",
     
      
    },
    {
      id: 5,
     image: "/images/p1.png",
      
    },
    {
      id: 6,
     image: "/images/p1.png",
      
    },
    {
      id: 7,
     image: "/images/p1.png",
      
    },
    {
      id: 8,
     image: "/images/p1.png",
      
    },
    {
      id: 9,
     image: "/images/p1.png",
      
    },
  ];
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 6,
     arrows: false,
    slidesToScroll: 1,
    
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
              Placement Partners
            </h1>
          </div>
        </div>
        <div className="">
          <Slider {...settings}>
            {events.map((event) => (
              <div key={event.id} className="px20">
                <div className="group cursor-pointer">
                  {/* Image Block */}
                  <div className="img-block relative overflow-hidden p-1 border">
                    <Image
                      src={event.image}
                      width={250}
                      height={112}
                      alt="event"
                      className="w-full 3xl:w-full transition-transform duration-300 group-hover:scale-105"
                    />
                   
                  </div>

                 
                </div>
              </div>
            ))}
          </Slider>



        </div>
      </div>
    </div>
  );
}
