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

export default function Desk() {



  return (
    <div className="w-full py50">
      <div className="px300">
        <div className='title pb30'>
          <div className={roboto_slab.className}>
            <h1 className="font-[700] font26 text-[#1B212F] leading-[140%]">
              FROM THE DESK OF…
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className='flex flex-1 gap-5'>
            <div className='w-full'>
               <Image
                              src="/images/profileid.jpg"
                              width={205}
                              height={200}
                              alt="aboutus"
                              className='rounded-md border-2  shadow-lg'
                            />
              
            </div>
            <div>
              <h4 className='font-[500] font20 text-[#1B212F] leading-[140%]'>I/C Principal Dr.Virupaksh R.Khanaj</h4>
               <div className='font-[700] text-primarycolor leading-none'>Our Principal</div>
              <p className='font-[400] font15 mt-3 leading-[120%] text-[#5a5a5a]'>I feel great pleasure to introduce Deshbhakt Babasaheb Bhahusaheb Khanjire Shikshan Sansth Night College of Arts & Commerce, Ichalkaranji as Co-educational renowned college in Maharashtra which was established in 1983. In today life academic excellence is most important.</p>

               <Link href='' class="arrow-link mt-2">Read more<span class="arrow"></span></Link>
            </div>
          </div>

           <div className='flex flex-1 gap-5'>
            <div className='w-full'>
               <Image
                              src="/images/profileid.jpg"
                              width={205}
                              height={200}
                              alt="aboutus"
                              className='rounded-md border-2   shadow-lg'
                            />
              
            </div>
            <div>
              <h4 className='font-[500] font20 text-[#1B212F] leading-[140%]'>I/C Principal Dr.Virupaksh R.Khanaj</h4>
              <div className='font-[700] text-primarycolor leading-none'>Our Chairperson</div>
              <p className='font-[400] font15 mt-3 leading-[120%] text-[#5a5a5a]'>I feel great pleasure to introduce Deshbhakt Babasaheb Bhahusaheb Khanjire Shikshan Sansth Night College of Arts & Commerce, Ichalkaranji as Co-educational renowned college in Maharashtra which was established in 1983. In today life academic excellence is most important.</p>

               <Link href='' class="arrow-link mt-2">Read more<span class="arrow"></span></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
