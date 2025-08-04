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

export default function CampusTour() {
  // ✅ Define your image data array
  const tourImages = [
    { id: 1, image: '/images/g1.png' },
    { id: 2, image: '/images/g2.jpg' },
    { id: 3, image: '/images/g3.png' },
    { id: 4, image: '/images/evn-img-1.jpg' },
    { id: 5, image: '/images/summary_bg.jpg' },
    { id: 6, image: '/images/login_img.jpg' },
    { id: 7, image: '/images/g1.png' },
    { id: 8, image: '/images/g2.jpg' },
    { id: 9, image: '/images/g3.png' },
    { id: 10, image: '/images/evn-img-1.jpg' },
  ];

  return (
    <div className="w-full py50 bg-[#f8f8f8]">
      <div className="">
        <div className="title pb30 px300">
          <div className={roboto_slab.className}>
            <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">
              Take a Campus Tour
            </h1>
          </div>
        </div>


        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 3xl:grid-cols-5 items-start mt-5">
          {tourImages.map((item) => (
            <div key={item.id} className="group">
              <div className="img-block relative overflow-hidden aspect-[4/3] w-full">
                <Image
                  src={item.image}
                  alt="campus image"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>

                   <div className="mt-4 flex justify-center">
                      <Link href="" className="arrow-link mt-2 group-hover:text-white">
                        Read more<span className="arrow"></span>
                      </Link>
                    </div>
      </div>
    </div>
  );
}
