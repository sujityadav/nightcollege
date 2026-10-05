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

export default function QuickLinks() {



  return (
    <div className="w-full py50 bg-[#f5f5f5]">
      <div className="px300">
        <div className='title pb30'>
          <div className={roboto_slab.className}>
            <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">
              Quick Links
            </h1>
          </div>
        </div>
        <div className='px-2 text-[#5a5a5a] sm:px-5'>
          <div className="grid grid-cols-1 gap-6 font15 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-10 quicklink">
         
              <ul className="list-disc space-y-3 break-words sm:pl-5">
                <li><Link href=''>College at a Glance </Link></li>
                <li><Link href=''>Goals & Mission </Link></li>
                <li><Link href=''>Admission </Link></li>
                <li><Link href=''>Academic/Administrative Calendar </Link></li>
                <li><Link href=''>Golas & Mission </Link></li>
                <li><Link href=''>Library </Link></li>
                <li><Link href=''>Cultural Activities </Link></li>
              </ul>
               <ul className="list-disc space-y-3 break-words sm:pl-5">
                <li><Link href=''>Anti Ragging Committee</Link></li>
                <li><Link href=''>Anti- Sexual Harassment Cell </Link></li>
                <li><Link href=''>RTI </Link></li>
                <li><Link href=''>Citizens Charter</Link></li>
                <li><Link href=''>Scholarships and EBC </Link></li>
                <li><Link href=''>Photo Gallery </Link></li>
               
              </ul>
               <ul className="list-disc space-y-3 break-words sm:pl-5">
                <li><Link href=''>College at a Glance </Link></li>
                <li><Link href=''>Goals & Mission </Link></li>
                <li><Link href=''>Admission </Link></li>
                <li><Link href=''>Academic/Administrative Calendar </Link></li>
                <li><Link href=''>Golas & Mission </Link></li>
                <li><Link href=''>Library </Link></li>
                <li><Link href=''>Cultural Activities </Link></li>
              </ul>
               <ul className="list-disc space-y-3 break-words sm:pl-5">
                <li><Link href=''>College at a Glance </Link></li>
                <li><Link href=''>Goals & Mission </Link></li>
                <li><Link href=''>Admission </Link></li>
                <li><Link href=''>Academic/Administrative Calendar </Link></li>
                <li><Link href=''>Golas & Mission </Link></li>
                <li><Link href=''>Library </Link></li>
                <li><Link href=''>Cultural Activities </Link></li>
              </ul>
               <ul className="list-disc space-y-3 break-words sm:pl-5">
                <li><Link href=''>College at a Glance </Link></li>
                <li><Link href=''>Goals & Mission </Link></li>
                <li><Link href=''>Admission </Link></li>
                <li><Link href=''>Academic/Administrative Calendar </Link></li>
                <li><Link href=''>Golas & Mission </Link></li>
                <li><Link href=''>Library </Link></li>
                <li><Link href=''>Cultural Activities </Link></li>
              </ul>
               
          


          </div>
        </div>

      </div>
    </div>
  );
}
