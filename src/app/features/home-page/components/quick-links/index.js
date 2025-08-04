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
        <div className='overflow-x-auto overflow-auto h-[280px] px-5 text-[#5a5a5a]'>
          <div className="flex  gap-[40px] font15 quicklink">
         
              <ul class="list-disc space-y-3 w-[250px]">
                <li><Link href=''>College at a Glance </Link></li>
                <li><Link href=''>Goals & Mission </Link></li>
                <li><Link href=''>Admission </Link></li>
                <li><Link href=''>Academic/Administrative Calendar </Link></li>
                <li><Link href=''>Golas & Mission </Link></li>
                <li><Link href=''>Library </Link></li>
                <li><Link href=''>Cultural Activities </Link></li>
              </ul>
               <ul class="list-disc space-y-3 w-[250px]">
                <li><Link href=''>Anti Ragging Committee</Link></li>
                <li><Link href=''>Anti- Sexual Harassment Cell </Link></li>
                <li><Link href=''>RTI </Link></li>
                <li><Link href=''>Citizens Charter</Link></li>
                <li><Link href=''>Scholarships and EBC </Link></li>
                <li><Link href=''>Photo Gallery </Link></li>
               
              </ul>
               <ul class="list-disc space-y-3 w-[250px]">
                <li><Link href=''>College at a Glance </Link></li>
                <li><Link href=''>Goals & Mission </Link></li>
                <li><Link href=''>Admission </Link></li>
                <li><Link href=''>Academic/Administrative Calendar </Link></li>
                <li><Link href=''>Golas & Mission </Link></li>
                <li><Link href=''>Library </Link></li>
                <li><Link href=''>Cultural Activities </Link></li>
              </ul>
               <ul class="list-disc space-y-3 w-[250px]">
                <li><Link href=''>College at a Glance </Link></li>
                <li><Link href=''>Goals & Mission </Link></li>
                <li><Link href=''>Admission </Link></li>
                <li><Link href=''>Academic/Administrative Calendar </Link></li>
                <li><Link href=''>Golas & Mission </Link></li>
                <li><Link href=''>Library </Link></li>
                <li><Link href=''>Cultural Activities </Link></li>
              </ul>
               <ul class="list-disc space-y-3 w-[250px]">
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
